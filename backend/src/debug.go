package sentinel

import (
	"encoding/json"
	"net/http"
	"time"
)

type DebugEvent struct {
	Timestamp   time.Time
	SiteID      string
	ClientIP    string
	EventType   string
	URL         string
	TrustScore  uint8
}

func DebugLatestEventsHandler(w http.ResponseWriter, r *http.Request) {
	// Query last 10 events
	query := `
		SELECT Timestamp, SiteID, ClientIP, EventType, URL, TrustScore 
		FROM sentinel.events 
		ORDER BY Timestamp DESC 
		LIMIT 10
	`
	
	rows, err := chConn.Query(r.Context(), query)
	if err != nil {
		http.Error(w, "Query failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []DebugEvent
	for rows.Next() {
		var e DebugEvent
		if err := rows.Scan(&e.Timestamp, &e.SiteID, &e.ClientIP, &e.EventType, &e.URL, &e.TrustScore); err != nil {
			continue
		}
		events = append(events, e)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}
