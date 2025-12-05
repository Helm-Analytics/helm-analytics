package sentinel

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type DebugSession struct {
	ClientIP      string
	SessionID     int
	Duration      float64
	EventCount    int
	FirstEvent    time.Time
	LastEvent     time.Time
}

func DebugAvgVisitTimeHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	
	// Simplified debug query - show heartbeat count per user
	debugQuery := `
		SELECT
			ClientIP,
			count(*) as heartbeat_count,
			count(*) * 15 as duration_seconds,
			min(Timestamp) as first_event,
			max(Timestamp) as last_event
		FROM events
		WHERE SiteID = ?
		  AND EventType = 'heartbeat'
		  AND Timestamp >= now() - INTERVAL 7 DAY
		  AND ClientIP NOT IN ('127.0.0.1', '::1')
		GROUP BY ClientIP
		ORDER BY last_event DESC
		LIMIT 10
	`
	
	rows, err := chConn.Query(ctx, debugQuery, siteID)
	if err != nil {
		http.Error(w, "Query error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var sessions []DebugSession
	for rows.Next() {
		var s DebugSession
		if err := rows.Scan(&s.ClientIP, &s.EventCount, &s.Duration, &s.FirstEvent, &s.LastEvent); err != nil {
			continue
		}
		s.SessionID = 1 // Not grouping by session, just by IP
		sessions = append(sessions, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"sessions": sessions,
		"count":    len(sessions),
	})
}
