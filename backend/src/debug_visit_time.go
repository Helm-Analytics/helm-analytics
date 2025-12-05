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
	
	// Debug query to see sessions
	debugQuery := `
		SELECT
			ClientIP,
			session_id,
			max(duration) as duration,
			count() as event_count,
			min(Timestamp) as first_event,
			max(Timestamp) as last_event
		FROM (
			SELECT
				ClientIP,
				Timestamp,
				sum(is_new_session) OVER (PARTITION BY ClientIP ORDER BY Timestamp) AS session_id,
				max(Timestamp) OVER (PARTITION BY ClientIP, sum(is_new_session) OVER (PARTITION BY ClientIP ORDER BY Timestamp)) - 
				min(Timestamp) OVER (PARTITION BY ClientIP, sum(is_new_session) OVER (PARTITION BY ClientIP ORDER BY Timestamp)) AS duration
			FROM (
				SELECT
					ClientIP,
					Timestamp,
					if(neighbor(ClientIP, -1) != ClientIP OR dateDiff('second', neighbor(Timestamp, -1), Timestamp) > 1800, 1, 0) AS is_new_session
				FROM events
				WHERE SiteID = ?
				  AND Timestamp >= now() - INTERVAL 7 DAY
				  AND ClientIP NOT IN ('127.0.0.1', '::1')
				ORDER BY ClientIP, Timestamp
			)
		)
		GROUP BY ClientIP, session_id
		ORDER BY first_event DESC
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
		if err := rows.Scan(&s.ClientIP, &s.SessionID, &s.Duration, &s.EventCount, &s.FirstEvent, &s.LastEvent); err != nil {
			continue
		}
		sessions = append(sessions, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"sessions": sessions,
		"count":    len(sessions),
	})
}
