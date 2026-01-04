# Admin API Usage Guide

## Manual Subscription Management

Use these endpoints to manually upgrade/downgrade user subscriptions without Stripe.

### Authentication

All admin endpoints require the `X-Admin-Key` header:

```bash
X-Admin-Key: your-secure-admin-api-key
```

Set this in your `.env`:
```
ADMIN_API_KEY=your-secure-admin-api-key-here
```

---

## Update Subscription

**Endpoint:** `POST /api/admin/subscription`

**Use Case:** Manually upgrade a user to Growth or Business plan.

### Request

```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-secure-admin-api-key" \
  -d '{
    "email": "user@example.com",
    "plan": "growth",
    "status": "active"
  }'
```

### Parameters

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `email` | string | Yes | User's email address |
| `plan` | string | Yes | `starter`, `growth`, `business` |
| `status` | string | No | `active` (default), `cancelled`, `past_due` |

### Response

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "plan": "growth",
  "status": "active"
}
```

### Examples

**Upgrade to Growth Plan:**
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "john@acme.com", "plan": "growth"}'
```

**Upgrade to Business Plan:**
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "jane@startup.io", "plan": "business"}'
```

**Cancel Subscription:**
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "user@example.com", "plan": "starter", "status": "cancelled"}'
```

---

## Get Subscription

**Endpoint:** `GET /api/admin/subscription/get?email=user@example.com`

**Use Case:** Check a user's current subscription status.

### Request

```bash
curl https://api.helm.io/api/admin/subscription/get?email=user@example.com \
  -H "X-Admin-Key: your-secure-admin-api-key"
```

### Response

```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "plan": "growth",
  "status": "active",
  "stripe_subscription": "sub_xyz789",
  "period_end": "2026-02-01"
}
```

---

## Common Use Cases

### 1. Beta User Upgrade
Give early adopters free access to Growth plan:
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "beta@user.com", "plan": "growth", "status": "active"}'
```

### 2. Influencer Partnership
Provide Business plan to content creators:
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "influencer@youtube.com", "plan": "business"}'
```

### 3. Customer Support
Temporarily upgrade a user having payment issues:
```bash
curl -X POST https://api.helm.io/api/admin/subscription \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-key" \
  -d '{"email": "support@customer.com", "plan": "growth", "status": "active"}'
```

### 4. Check Status
Verify subscription before support call:
```bash
curl https://api.helm.io/api/admin/subscription/get?email=user@example.com \
  -H "X-Admin-Key: your-key"
```

---

## Security Notes

1. **Keep ADMIN_API_KEY secret** - Never commit to Git
2. **Use HTTPS only** - Endpoints only work over SSL
3. **Log all changes** - Admin actions are logged for audit
4. **Rotate keys regularly** - Change ADMIN_API_KEY quarterly

---

## Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```
→ Check X-Admin-Key header

**404 Not Found:**
```json
{
  "error": "User not found"
}
```
→ Email doesn't exist in database

**400 Bad Request:**
```json
{
  "error": "Invalid plan. Must be: starter, growth, or business"
}
```
→ Check plan parameter

---

## Integration with Stripe

- Manual subscriptions have `stripe_subscription_id` = `"manual_{user_id}"`
- These won't be billed via Stripe
- Perfect for:
  - Beta users
  - Partnerships
  - Internal testing
  - Temporary upgrades
