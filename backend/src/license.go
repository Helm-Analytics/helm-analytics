package sentinel

import (
	"crypto/ecdsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"
	"time"
)

// LicenseTier represents the license edition
type LicenseTier string

const (
	TierCommunity  LicenseTier = "community"
	TierPro        LicenseTier = "pro"
	TierEnterprise LicenseTier = "enterprise"
	TierCloud      LicenseTier = "cloud"
)

// License represents the license configuration
type License struct {
	Tier       LicenseTier `json:"tier"`
	Customer   string      `json:"customer"`
	Email      string      `json:"email"`
	IssuedAt   time.Time   `json:"issued_at"`
	ExpiresAt  time.Time   `json:"expires_at"`
	Features   []string    `json:"features"`
	MaxSites   int         `json:"max_sites"`
}

// Feature flags
const (
	FeatureAIConsultant     = "ai_consultant"
	FeatureShieldAuto       = "shield_auto"
	FeatureWhiteLabel       = "white_label"
	FeatureRetentionCohorts = "retention_cohorts"
	FeatureGSCIntegration   = "gsc_integration"
	FeatureEmailReports     = "email_reports"
	FeatureSSO              = "sso"
	FeatureAdvancedAPI      = "advanced_api"
	FeatureCustomBranding   = "custom_branding"
)

// Public key for license verification (ECDSA P-256)
// This is safe to embed in open-source code
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEwxKZFGgkOPYVVLMkRZvJtv0MBMmq
7XJw9gyPnY9kH3zdXJmtAJ9vZGfhH8O3QYhRkJGsEzYLjWxPkzl5uFVJ0g==
-----END PUBLIC KEY-----`

var currentLicense *License

// InitLicense initializes the license system
func InitLicense() error {
	deploymentMode := os.Getenv("DEPLOYMENT_MODE")

	if deploymentMode == "cloud" {
		// Cloud mode: licenses managed via database per user
		currentLicense = &License{
			Tier:     TierCloud,
			Features: []string{}, // Features determined per user/plan
		}
		log.Println("☁️  Running Cloud Edition")
		return nil
	}

	// Self-hosted: Check for license key
	licenseKey := os.Getenv("LICENSE_KEY")

	if licenseKey == "" {
		// Community Edition
		currentLicense = &License{
			Tier:     TierCommunity,
			Features: []string{},
			MaxSites: -1, // Unlimited
		}
		log.Println("🆓 Running Community Edition (AGPLv3)")
		log.Println("💡 Upgrade to Pro: https://helm.io/pricing")
		return nil
	}

	// Validate license locally with signature verification
	license, err := validateLicenseSignature(licenseKey)
	if err != nil {
		log.Printf("⚠️  Invalid license key: %v", err)
		log.Println("💡 Falling back to Community Edition")
		
		currentLicense = &License{
			Tier:     TierCommunity,
			Features: []string{},
			MaxSites: -1,
		}
		return nil
	}

	// Check expiration
	if time.Now().After(license.ExpiresAt) {
		log.Printf("⚠️  License expired on %s", license.ExpiresAt.Format("2006-01-02"))
		log.Println("💡 Renew at https://helm.io/pricing")
		
		currentLicense = &License{
			Tier:     TierCommunity,
			Features: []string{},
			MaxSites: -1,
		}
		return nil
	}

	currentLicense = license
	log.Printf("✅ License activated: %s Edition", strings.ToUpper(string(license.Tier)))
	log.Printf("👤 Licensed to: %s (%s)", license.Customer, license.Email)
	log.Printf("📅 Expires: %s", license.ExpiresAt.Format("2006-01-02"))
	log.Printf("🎁 Features: %v", license.Features)

	return nil
}

// validateLicenseSignature validates license using ECDSA signature
func validateLicenseSignature(licenseKey string) (*License, error) {
	// Parse key format: helm_pro_base64data or helm_ent_base64data
	parts := strings.Split(licenseKey, "_")
	if len(parts) != 3 {
		return nil, errors.New("invalid license key format")
	}

	tier := parts[1]
	payload := parts[2]

	// Decode base64
	data, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return nil, fmt.Errorf("invalid base64 encoding: %w", err)
	}

	// Last 64 bytes are signature (r and s, 32 bytes each)
	if len(data) < 64 {
		return nil, errors.New("invalid license data length")
	}

	signature := data[len(data)-64:]
	jsonData := data[:len(data)-64]

	// Parse signature (r and s)
	r := new(big.Int).SetBytes(signature[:32])
	s := new(big.Int).SetBytes(signature[32:])

	// Verify signature
	publicKey, err := parsePublicKey(PUBLIC_KEY_PEM)
	if err != nil {
		return nil, fmt.Errorf("failed to parse public key: %w", err)
	}

	hash := sha256.Sum256(jsonData)
	if !ecdsa.Verify(publicKey, hash[:], r, s) {
		return nil, errors.New("invalid license signature")
	}

	// Parse JSON
	var license License
	if err := json.Unmarshal(jsonData, &license); err != nil {
		return nil, fmt.Errorf("invalid license data: %w", err)
	}

	license.Tier = LicenseTier(tier)
	return &license, nil
}

// parsePublicKey parses PEM-encoded ECDSA public key
func parsePublicKey(pemStr string) (*ecdsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil {
		return nil, errors.New("failed to parse PEM block")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	ecdsaPub, ok := pub.(*ecdsa.PublicKey)
	if !ok {
		return nil, errors.New("not an ECDSA public key")
	}

	return ecdsaPub, nil
}

// GetLicense returns the current license
func GetLicense() *License {
	if currentLicense == nil {
		return &License{
			Tier:     TierCommunity,
			MaxSites: -1,
		}
	}
	return currentLicense
}

// HasFeature checks if a feature is available in current license
func HasFeature(feature string) bool {
	license := GetLicense()

	// Cloud licenses check per-user plan (handled in billing.go)
	if license.Tier == TierCloud {
		return true // Feature gating done at user level
	}

	// Community has no premium features
	if license.Tier == TierCommunity {
		return false
	}

	// Check feature list
	for _, f := range license.Features {
		if f == feature {
			return true
		}
	}
	return false
}

// GetRequiredTier returns the tier name required for a feature
func GetRequiredTier(feature string) string {
	switch feature {
	case FeatureSSO, FeatureCustomBranding:
		return "Enterprise License"
	case FeatureAIConsultant, FeatureShieldAuto, FeatureWhiteLabel:
		return "Pro License or Growth Cloud"
	default:
		return "Pro License or Cloud"
	}
}
