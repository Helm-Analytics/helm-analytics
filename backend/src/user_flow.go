package sentinel

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sort"
)

type FlowNode struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type FlowEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Weight int    `json:"weight"`
}

type UserFlowResponse struct {
	Nodes []FlowNode `json:"nodes"`
	Edges []FlowEdge `json:"edges"`
}

// GetUserFlowHandler generates path data for the User Flow visualization
func GetUserFlowHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	days := parseIntOrDefault(r.URL.Query().Get("days"), 7)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Query individual session paths
	ctx := context.Background()
	query := `
		SELECT SessionID, URL, Timestamp
		FROM events
		WHERE SiteID = ? 
			AND EventType = 'pageview'
			AND Timestamp >= now() - INTERVAL ? DAY
		ORDER BY SessionID, Timestamp ASC
		LIMIT 10000
	`

	rows, err := chConn.Query(ctx, query, siteID, days)
	if err != nil {
		log.Printf("Error querying user flow data: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Aggregate transitions
	type sessionStep struct {
		URL       string
		Timestamp int64
	}
	
	sessionPaths := make(map[string][]string)
	for rows.Next() {
		var sessionID, url string
		var timestamp interface{}
		if err := rows.Scan(&sessionID, &url, &timestamp); err != nil {
			continue
		}
		sessionPaths[sessionID] = append(sessionPaths[sessionID], url)
	}

	// Count transitions
	transitionCounts := make(map[string]map[string]int)
	nodeSet := make(map[string]bool)

	for _, path := range sessionPaths {
		for i := 0; i < len(path)-1; i++ {
			source := path[i]
			target := path[i+1]
			
			if source == target {
				continue // Ignore refreshes
			}

			nodeSet[source] = true
			nodeSet[target] = true

			if transitionCounts[source] == nil {
				transitionCounts[source] = make(map[string]int)
			}
			transitionCounts[source][target]++
		}
		// Ensure last node is in set
		if len(path) > 0 {
			nodeSet[path[len(path)-1]] = true
		}
	}

	// Convert to response format
	var response UserFlowResponse
	
	// Sort nodes for consistent output
	var sortedNodes []string
	for node := range nodeSet {
		sortedNodes = append(sortedNodes, node)
	}
	sort.Strings(sortedNodes)

	for _, node := range sortedNodes {
		response.Nodes = append(response.Nodes, FlowNode{ID: node, Label: node})
	}

	for source, targets := range transitionCounts {
		for target, weight := range targets {
			response.Edges = append(response.Edges, FlowEdge{
				Source: source,
				Target: target,
				Weight: weight,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
