package sentinel

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

type Funnel struct {
	ID         string   `json:"id"`
	SiteID     string   `json:"siteId"`
	Name       string   `json:"name"`
	Steps      []string `json:"steps"`
	StepCounts []uint64 `json:"stepCounts,omitempty"`
}

// FunnelsApiHandler routes requests to appropriate functions based on HTTP method.
func FunnelsApiHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		handleListFunnels(w, r)
	case "POST":
		handleCreateFunnel(w, r)
	case "PUT":
		handleUpdateFunnel(w, r)
	case "DELETE":
		handleDeleteFunnel(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleListFunnels(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId query parameter is required", http.StatusBadRequest)
		return
	}

	// Verify site ownership
	var ownerID int
	err := db.QueryRow("SELECT user_id FROM sites WHERE id = $1", siteID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	rows, err := db.Query("SELECT id, site_id, name, steps FROM funnels WHERE site_id = $1 ORDER BY name", siteID)
	if err != nil {
		http.Error(w, "Failed to fetch funnels", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	funnels := []Funnel{}
	for rows.Next() {
		var funnel Funnel
		var stepsJSON []byte
		if err := rows.Scan(&funnel.ID, &funnel.SiteID, &funnel.Name, &stepsJSON); err != nil {
			log.Printf("Error scanning funnel: %v", err)
			continue
		}
		if err := json.Unmarshal(stepsJSON, &funnel.Steps); err != nil {
			log.Printf("Error parsing funnel steps: %v", err)
			continue
		}

		// Calculate stats for this funnel
		counts, err := calculateFunnelStats(siteID, funnel.Steps)
		if err != nil {
			log.Printf("Error calculating funnel stats: %v", err)
			// Return empty counts on error rather than failing
			funnel.StepCounts = make([]uint64, len(funnel.Steps))
		} else {
			funnel.StepCounts = counts
		}

		funnels = append(funnels, funnel)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(funnels)
}

func calculateFunnelStats(siteID string, steps []string) ([]uint64, error) {
	if len(steps) == 0 {
		return []uint64{}, nil
	}

	// Build windowFunnel arguments
	// windowFunnel(window)(timestamp, cond1, cond2, ...)
	var conditions []string
	for range steps {
		// Basic LIKE matching for now.
		// Note: Use parameters to prevent injection if possible, but ClickHouse Go driver
		// handles args differently. For simplicity in dynamic SQL generation here:
		// Check that step doesn't contain dangerous chars or rely on param binding.
		// We will use '?' and pass args.
		conditions = append(conditions, "URL LIKE ?")
	}

	// Construct the query
	// windowFunnel with 7 day window (604800 seconds)
	query := fmt.Sprintf(`
		SELECT 
			level, 
			count() as count 
		FROM 
		(
			SELECT 
				windowFunnel(604800)(Timestamp, %s) as level 
			FROM sentinel.events 
			WHERE SiteID = ? 
			  AND Timestamp >= now() - INTERVAL 90 DAY 
			  AND ClientIP NOT IN ('127.0.0.1', '::1')
			GROUP BY if(SessionID != '', SessionID, ClientIP)
		) 
		GROUP BY level`, strings.Join(conditions, ", "))

	// Prepare args: first for each LIKE condition, then for SiteID
	args := make([]interface{}, len(steps)+1)
	for i, step := range steps {
		args[i] = "%" + step + "%"
	}
	args[len(steps)] = siteID

	ctx := context.Background()
	rows, err := chConn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Map level -> count
	// level 0 means no steps matched (but we grouped by ClientIP who had *some* events in range? No, they must be in WHERE)
	// Actually windowFunnel returns 0 if no events match.
	levelCounts := make(map[uint8]uint64)
	for rows.Next() {
		var level uint8
		var count uint64
		if err := rows.Scan(&level, &count); err != nil {
			continue
		}
		levelCounts[level] = count
	}

	// Calculate cumulative flows
	// Step i (0-indexed) corresponds to level i+1
	// Count for Step i = Sum(counts where level >= i+1)
	stats := make([]uint64, len(steps))
	for i := 0; i < len(steps); i++ {
		targetLevel := uint8(i + 1)
		var total uint64
		for level, count := range levelCounts {
			if level >= targetLevel {
				total += count
			}
		}
		stats[i] = total
	}

	return stats, nil
}

func handleCreateFunnel(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	var funnel Funnel
	if err := json.NewDecoder(r.Body).Decode(&funnel); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Verify site ownership
	var ownerID int
	err := db.QueryRow("SELECT user_id FROM sites WHERE id = $1", funnel.SiteID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	stepsJSON, err := json.Marshal(funnel.Steps)
	if err != nil {
		http.Error(w, "Failed to serialize funnel steps", http.StatusInternalServerError)
		return
	}

	var newFunnelID string
	err = db.QueryRow("INSERT INTO funnels (site_id, name, steps) VALUES ($1, $2, $3) RETURNING id", funnel.SiteID, funnel.Name, stepsJSON).Scan(&newFunnelID)
	if err != nil {
		http.Error(w, "Failed to create funnel", http.StatusInternalServerError)
		return
	}

	funnel.ID = newFunnelID
	funnel.StepCounts = make([]uint64, len(funnel.Steps)) // Initialize empty counts
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(funnel)
}

func handleUpdateFunnel(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	var funnel Funnel
	if err := json.NewDecoder(r.Body).Decode(&funnel); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Verify funnel ownership via site ownership
	var ownerID int
	err := db.QueryRow("SELECT s.user_id FROM sites s JOIN funnels f ON s.id = f.site_id WHERE f.id = $1", funnel.ID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	stepsJSON, err := json.Marshal(funnel.Steps)
	if err != nil {
		http.Error(w, "Failed to serialize funnel steps", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("UPDATE funnels SET name = $1, steps = $2 WHERE id = $3", funnel.Name, stepsJSON, funnel.ID)
	if err != nil {
		http.Error(w, "Failed to update funnel", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(funnel)
}

func handleDeleteFunnel(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	funnelID := r.URL.Query().Get("id")
	if funnelID == "" {
		http.Error(w, "id query parameter is required", http.StatusBadRequest)
		return
	}

	// Verify funnel ownership via site ownership
	var ownerID int
	err := db.QueryRow("SELECT s.user_id FROM sites s JOIN funnels f ON s.id = f.site_id WHERE f.id = $1", funnelID).Scan(&ownerID)
	if err != nil || ownerID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	_, err = db.Exec("DELETE FROM funnels WHERE id = $1", funnelID)
	if err != nil {
		http.Error(w, "Failed to delete funnel", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
