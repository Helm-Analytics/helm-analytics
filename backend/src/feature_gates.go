package sentinel

import (
	"fmt"
	"net/http"
)

// Feature definitions with required plan tiers
const (
	FeatureSessionReplays      = "session_replays"
	FeatureCustomEvents        = "custom_events"
	FeatureWebVitals           = "web_vitals"
	FeatureAIInsights          = "ai_insights"
	FeatureAdvancedSegmentation = "advanced_segmentation"
	FeatureBotDetection        = "bot_detection"
	FeatureFirewall            = "firewall"
	FeatureCustomIntegrations  = "custom_integrations"
	FeaturePrioritySupport     = "priority_support"
)

// Feature requirements per plan
var featureRequirements = map[string][]string{
	FeatureSessionReplays:       {"pro", "growth", "business"},
	FeatureCustomEvents:         {"pro", "growth", "business"},
	FeatureWebVitals:            {"free", "pro", "growth", "business"}, // Available to all
	FeatureAIInsights:           {"free", "pro", "growth", "business"}, // Available to all
	FeatureAdvancedSegmentation: {"growth", "business"},
	FeatureBotDetection:         {"growth", "business"},
	FeatureFirewall:             {"growth", "business"},
	FeatureCustomIntegrations:   {"business"},
	FeaturePrioritySupport:      {"pro", "growth", "business"},
}

// Check if a plan has access to a feature
func PlanHasFeature(userPlan string, feature string) bool {
	requiredPlans, exists := featureRequirements[feature]
	if !exists {
		return true // If feature not defined, allow access (backward compatibility)
	}
	
	// Normalize plan name
	if userPlan == "" || userPlan == "starter" {
		userPlan = "free"
	}
	
	for _, plan := range requiredPlans {
		if plan == userPlan {
			return true
		}
	}
	return false
}

// Get the minimum required tier for a feature
func GetRequiredTier(feature string) string {
	plans, exists := featureRequirements[feature]
	if !exists || len(plans) == 0 {
		return "Free"
	}
	
	// Return the lowest tier that has access
	for _, plan := range []string{"free", "pro", "growth", "business"} {
		for _, requiredPlan := range plans {
			if requiredPlan == plan {
				switch plan {
				case "free":
					return "Hobby Plan"
				case "pro":
					return "Pro Plan"
				case "growth":
					return "Growth Plan"
				case "business":
					return "Business Plan"
				}
			}
		}
	}
	return "Pro Plan"
}

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
					upgradeURL = "https://helm-analytics.com/pricing"
					tierName = GetRequiredTier(feature)
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

// RequireCloudPlan middleware - checks user's plan in cloud mode
func RequireCloudPlan(feature string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			license := GetLicense()
			
			// Only check in cloud mode
			if license.Tier != TierCloud {
				next.ServeHTTP(w, r)
				return
			}
			
			// Get user plan from context (should be set by auth middleware)
			userPlan := r.Context().Value("user_plan")
			userPlanStr, ok := userPlan.(string)
			if !ok {
				userPlanStr = "free"
			}
			
			// Check if user's plan has access
			if !PlanHasFeature(userPlanStr, feature) {
				tierName := GetRequiredTier(feature)
				
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired) // 402
				fmt.Fprintf(w, `{
					"error": "Feature not available",
					"message": "This feature requires %s",
					"feature": "%s",
					"current_plan": "%s",
					"required_plan": "%s",
					"upgrade_url": "https://helm-analytics.com/pricing"
				}`, tierName, feature, userPlanStr, tierName)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}
