package sentinel

import (
	"encoding/json"
	"net/http"
)

func DebugSessionEventsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	sessionID := r.URL.Query().Get("sessionId")
	
	if siteID == "" || sessionID == "" {
		http.Error(w, "siteId and sessionId required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT Timestamp, Payload 
		FROM sentinel.session_events 
		WHERE SiteID = ? AND SessionID = ? 
		ORDER BY Timestamp ASC
	`
	
	rows, err := chConn.Query(r.Context(), query, siteID, sessionID)
	if err != nil {
		http.Error(w, "Query error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type RawEvent struct {
		Timestamp string `json:"timestamp"`
		Payload   string `json:"payload"`
	}

	var rawEvents []RawEvent
	for rows.Next() {
		var timestamp string
		var payload string
		if err := rows.Scan(&timestamp, &payload); err != nil {
			continue
		}
		rawEvents = append(rawEvents, RawEvent{
			Timestamp: timestamp,
			Payload:   payload,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"count":  len(rawEvents),
		"events": rawEvents,
	})
}
