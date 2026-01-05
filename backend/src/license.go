package sentinel

import (
	"log"
	"os"
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

var currentLicense *License

// InitLicense initializes the license system
func InitLicense() error {
	deploymentMode := os.Getenv("DEPLOYMENT_MODE")

	if deploymentMode == "cloud" {
		// Cloud mode: features managed per user/plan in the database
		currentLicense = &License{
			Tier:     TierCloud,
			Features: []string{}, 
		}
		log.Println("☁️  Running Cloud Edition")
		return nil
	}

	// Self-hosted/Public Release Default
	currentLicense = &License{
		Tier:     TierCommunity,
		Features: []string{},
		MaxSites: -1, // Unlimited
	}
	log.Println("🆓 Running Community Edition (AGPLv3)")
	
	return nil
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

	// Cloud licenses check per-user plan
	if license.Tier == TierCloud {
		return true // Feature gating done at user/app level
	}

	// Community has no premium features by default
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
