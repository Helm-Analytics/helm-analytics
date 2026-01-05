package sentinel

import (
	"fmt"
	"net/http"
)

// RequireFeature middleware - protects endpoints requiring premium features
func RequireFeature(feature string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !HasFeature(feature) {
				license := GetLicense()

				upgradeURL := "https://helm-analytics.com/pricing"
				tierName := "Pro License"

				switch license.Tier {
				case TierCommunity:
					upgradeURL = "https://helm-analytics.com/pricing#pro-license"
					tierName = GetRequiredTier(feature)
				case TierCloud:
					// Cloud users need to upgrade their plan
					upgradeURL = "https://helm-analytics.com/account/upgrade"
					tierName = "Growth or Business plan"
				}

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired) // 402
				fmt.Fprintf(w, `{
					"error": "Feature not available",
					"message": "This feature requires %s",
					"feature": "%s",
					"current_tier": "%s",
					"upgrade_url": "%s"
				}`, tierName, feature, license.Tier, upgradeURL)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// FeatureGateHandler wraps a HandlerFunc with feature gating
func FeatureGateHandler(feature string, handler http.HandlerFunc) http.Handler {
	return RequireFeature(feature)(handler)
}
