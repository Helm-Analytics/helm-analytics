# Helm License Generation Tool

## ⚠️ IMPORTANT: First Time Setup

### 1. Generate Key Pair (One Time Only)

```bash
cd tools/license-gen
go run main.go --genkeys
```

This creates:
- `private.pem` - **KEEP SECRET!** Used to generate licenses
- `public.pem` - Public key for verification

### 2. Update Backend with Public Key

Copy the contents of `public.pem` and paste into:
`backend/src/license.go` → `PUBLIC_KEY_PEM` constant

### 3. Secure Your Private Key

```bash
# Backup to secure location
cp private.pem ~/secure-backup/helm-private-key.pem

# Never commit to Git!
echo "tools/license-gen/private.pem" >> .gitignore
```

---

## Generating Licenses

### Pro License

```bash
cd tools/license-gen

go run main.go \
  --type pro \
  --customer "John Doe" \
  --email "john@example.com" \
  --expires "2027-01-01" \
  --key private.pem
```

### Enterprise License

```bash
go run main.go \
  --type enterprise \
  --customer "Acme Corp" \
  --email "admin@acme.com" \
  --expires "2027-12-31" \
  --key private.pem
```

---

## Output Example

```
✅ License Generated Successfully!
═══════════════════════════════════════

LICENSE_KEY=helm_pro_eyJjdXN0b21lciI6IkpvaG4gRG9lIi...

Customer Details:
  Name:    John Doe
  Email:   john@example.com
  Type:    pro
  Issued:  2026-01-04
  Expires: 2027-01-01

Features:
  ✓ ai_consultant
  ✓ shield_auto
  ✓ white_label
  ✓ retention_cohorts
  ✓ gsc_integration
  ✓ email_reports

═══════════════════════════════════════
📋 Instructions:
1. Send this LICENSE_KEY to the customer
2. Customer adds it to their .env file
3. Customer restarts Helm: docker-compose restart
```

---

## Security Model

### How It Works

**Your Side:**
- Private key signs licenses
- Only YOU have the private key
- Licenses can't be forged without it

**Customer Side:**
- Public key (embedded in code) verifies signatures
- No server calls needed
- Works 100% offline
- Can't generate licenses (don't have private key)

**Why It's Secure:**
- ECDSA P-256 curve (256-bit security)
- Public key in code is safe (can't forge signatures)
- Even with source code, users can't create valid licenses
- No license server needed (no URL to bypass)

---

## Features by Tier

### Pro License ($199/year)
- AI Consultant
- Shield Auto-Block
- White-label branding
- Retention cohorts
- Google Search Console integration
- Email reports

### Enterprise License ($1,999/year)
- All Pro features
- SSO (SAML/LDAP)
- Custom branding
- Advanced API access
- Dedicated support

---

## Troubleshooting

### Error: "failed to load private key"
```bash
# Generate keys first
go run main.go --genkeys
```

### Error: "invalid signature"
- Public key in `license.go` doesn't match private key
- Re-copy `public.pem` contents to `PUBLIC_KEY_PEM`

### Testing License

```bash
# Generate test license
go run main.go --customer "Test" --email "test@example.com" --expires "2027-01-01"

# Add to .env
LICENSE_KEY=helm_pro_xxx...

# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs backend | grep "License activated"
```

---

## Best Practices

1. **Backup private.pem** - Store securely (encrypted USB, password manager)
2. **Never commit private.pem** - Add to .gitignore
3. **Rotate annually** - Generate new key pair yearly for security
4. **Keep records** - Log all generated licenses for support
5. **Set expiration** - Force annual renewals (recurring revenue)

---

## Key Rotation (Advanced)

If you need to rotate keys:

```bash
# 1. Generate new key pair
go run main.go --genkeys  # Creates new private.pem, public.pem

# 2. Keep old public key for legacy licenses
# In license.go, support multiple public keys:
# PUBLIC_KEY_PEM_V1 (old)
# PUBLIC_KEY_PEM_V2 (new)

# 3. Try validation with both keys
# Fall back to V1 if V2 fails

# 4. Use new key for new licenses
#
