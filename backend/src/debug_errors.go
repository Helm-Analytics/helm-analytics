package sentinel

import (
	"encoding/json"
	"net/http"
	"time"
)

type DebugError struct {
	Timestamp time.Time
	URL       string
	Message   string
	Source    string
	LineNo    int
	ColNo     int
}

func DebugErrorsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT Timestamp, URL, Message, Source, LineNo, ColNo
		FROM sentinel.errors
		WHERE SiteID = ?
		ORDER BY Timestamp DESC
		LIMIT 20
	`
	
	rows, err := chConn.Query(r.Context(), query, siteID)
	if err != nil {
		http.Error(w, "Query error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var errors []DebugError
	for rows.Next() {
		var e DebugError
		if err := rows.Scan(&e.Timestamp, &e.URL, &e.Message, &e.Source, &e.LineNo, &e.ColNo); err != nil {
			continue
		}
		errors = append(errors, e)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"count":  len(errors),
		"errors": errors,
	})
}
