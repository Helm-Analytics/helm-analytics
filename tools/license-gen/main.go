package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"time"
)

type LicenseData struct {
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
	MaxSites  int       `json:"max_sites"`
	Features  []string  `json:"features"`
}

func main() {
	tier := flag.String("type", "pro", "License type: pro or enterprise")
	customer := flag.String("customer", "", "Customer name")
	email := flag.String("email", "", "Customer email")
	expires := flag.String("expires", "", "Expiration date (YYYY-MM-DD)")
	privateKeyPath := flag.String("key", "private.pem", "Path to private key file")
	generateKeys := flag.Bool("genkeys", false, "Generate new key pair")

	flag.Parse()

	// Generate keys if requested
	if *generateKeys {
		if err := generateKeyPair(); err != nil {
			fmt.Printf("❌ Error generating keys: %v\n", err)
			os.Exit(1)
		}
		return
	}

	// Validate required fields
	if *customer == "" || *email == "" || *expires == "" {
		fmt.Println("Usage: license-gen --type pro --customer 'Acme Corp' --email 'admin@acme.com' --expires '2027-01-01' --key private.pem")
		fmt.Println("\nOr generate keys: license-gen --genkeys")
		os.Exit(1)
	}

	expiresAt, err := time.Parse("2006-01-02", *expires)
	if err != nil {
		fmt.Printf("❌ Invalid date format: %v\n", err)
		os.Exit(1)
	}

	// Define features based on tier
	var features []string
	if *tier == "pro" {
		features = []string{
			"ai_consultant",
			"shield_auto",
			"white_label",
			"retention_cohorts",
			"gsc_integration",
			"email_reports",
		}
	} else if *tier == "enterprise" {
		features = []string{
			"ai_consultant",
			"shield_auto",
			"white_label",
			"retention_cohorts",
			"gsc_integration",
			"email_reports",
			"sso",
			"custom_branding",
			"advanced_api",
		}
	} else {
		fmt.Printf("❌ Invalid tier: must be 'pro' or 'enterprise'\n")
		os.Exit(1)
	}

	// Create license data
	license := LicenseData{
		Customer:  *customer,
		Email:     *email,
		IssuedAt:  time.Now(),
		ExpiresAt: expiresAt,
		MaxSites:  -1, // Unlimited
		Features:  features,
	}

	// Load private key
	privateKey, err := loadPrivateKey(*privateKeyPath)
	if err != nil {
		fmt.Printf("❌ Error loading private key: %v\n", err)
		fmt.Println("💡 Generate keys first: license-gen --genkeys")
		os.Exit(1)
	}

	// Serialize to JSON
	jsonData, err := json.Marshal(license)
	if err != nil {
		fmt.Printf("❌ Error marshaling license: %v\n", err)
		os.Exit(1)
	}

	// Sign with ECDSA
	hash := sha256.Sum256(jsonData)
	r, s, err := ecdsa.Sign(rand.Reader, privateKey, hash[:])
	if err != nil {
		fmt.Printf("❌ Error signing license: %v\n", err)
		os.Exit(1)
	}

	// Combine signature (64 bytes: 32 for r, 32 for s)
	signature := append(r.FillBytes(make([]byte, 32)), s.FillBytes(make([]byte, 32))...)

	// Combine data + signature
	combined := append(jsonData, signature...)

	// Base64 encode
	encoded := base64.StdEncoding.EncodeToString(combined)

	// Format license key
	prefix := "helm_pro"
	if *tier == "enterprise" {
		prefix = "helm_ent"
	}

	licenseKey := fmt.Sprintf("%s_%s", prefix, encoded)

	// Output
	fmt.Println("\n✅ License Generated Successfully!")
	fmt.Println("═══════════════════════════════════════\n")
	fmt.Printf("LICENSE_KEY=%s\n\n", licenseKey)
	fmt.Println("Customer Details:")
	fmt.Printf("  Name:    %s\n", *customer)
	fmt.Printf("  Email:   %s\n", *email)
	fmt.Printf("  Type:    %s\n", *tier)
	fmt.Printf("  Issued:  %s\n", time.Now().Format("2006-01-02"))
	fmt.Printf("  Expires: %s\n", expiresAt.Format("2006-01-02"))
	fmt.Println("\nFeatures:")
	for _, f := range features {
		fmt.Printf("  ✓ %s\n", f)
	}
	fmt.Println("\n═══════════════════════════════════════")
	fmt.Println("📋 Instructions:")
	fmt.Println("1. Send this LICENSE_KEY to the customer")
	fmt.Println("2. Customer adds it to their .env file")
	fmt.Println("3. Customer restarts Helm: docker-compose restart")
	fmt.Println()
}

func generateKeyPair() error {
	// Generate ECDSA key pair (P-256 curve)
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return err
	}

	// Encode private key to PEM
	privBytes, err := x509.MarshalECPrivateKey(privateKey)
	if err != nil {
		return err
	}

	privPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "EC PRIVATE KEY",
		Bytes: privBytes,
	})

	// Encode public key to PEM
	pubBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return err
	}

	pubPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubBytes,
	})

	// Write to files
	if err := ioutil.WriteFile("private.pem", privPEM, 0600); err != nil {
		return err
	}

	if err := ioutil.WriteFile("public.pem", pubPEM, 0644); err != nil {
		return err
	}

	fmt.Println("\n✅ Key pair generated successfully!")
	fmt.Println("═══════════════════════════════════════")
	fmt.Println("📁 Files created:")
	fmt.Println("   - private.pem (KEEP SECRET! Use for license generation)")
	fmt.Println("   - public.pem (Embed in backend/src/license.go)")
	fmt.Println("\n⚠️  SECURITY:")
	fmt.Println("   1. Backup private.pem to secure location")
	fmt.Println("   2. Never commit private.pem to Git")
	fmt.Println("   3. Copy public.pem contents to PUBLIC_KEY_PEM in license.go")
	fmt.Println()

	return nil
}

func loadPrivateKey(path string) (*ecdsa.PrivateKey, error) {
	keyData, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(keyData)
	if block == nil {
		return nil, fmt.Errorf("failed to parse PEM block")
	}

	privateKey, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	return privateKey, nil
}
