package sentinel

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	net_url "net/url"
	"sort"
	"time"
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
	// Fetch RECENT events first to ensure active sessions are captured within the limit
	query := `
		SELECT SessionID, URL, Timestamp
		FROM events
		WHERE SiteID = ? 
			AND EventType = 'pageview'
			AND Timestamp >= now() - INTERVAL ? DAY
			AND SessionID != ''
		ORDER BY Timestamp DESC
		LIMIT 50000
	`

	rows, err := chConn.Query(ctx, query, siteID, days)
	if err != nil {
		log.Printf("Error querying user flow data: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Aggregate transitions
	type PathNode struct {
		URL       string
		Timestamp time.Time
	}
	sessionPaths := make(map[string][]PathNode)
	
	for rows.Next() {
		var sessionID, url string
		var timestamp time.Time
		if err := rows.Scan(&sessionID, &url, &timestamp); err != nil {
			log.Printf("[USER FLOW ERROR] Scan failed: %v", err)
			continue
		}
		// Normalize URL immediately
		url = normalizeFlowURL(url)
		sessionPaths[sessionID] = append(sessionPaths[sessionID], PathNode{URL: url, Timestamp: timestamp})
	}


	// Count transitions
	transitionCounts := make(map[string]map[string]int)
	nodeSet := make(map[string]bool)

	for _, pathNodes := range sessionPaths {
		// Sort by timestamp ascending (since we queried DESC)
		sort.Slice(pathNodes, func(i, j int) bool {
			return pathNodes[i].Timestamp.Before(pathNodes[j].Timestamp)
		})

		for i := 0; i < len(pathNodes)-1; i++ {
			source := pathNodes[i].URL
			target := pathNodes[i+1].URL
			
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
		// Ensure last node is in set if path exists
		if len(pathNodes) > 0 {
			nodeSet[pathNodes[len(pathNodes)-1].URL] = true
		}
	}

	// Convert to response format
	// Initialize as empty slices to ensure [] JSON output instead of null
	response := UserFlowResponse{
		Nodes: []FlowNode{},
		Edges: []FlowEdge{},
	}
	
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

type UserFlowReport struct {
	EntryPoints []TrafficPoint `json:"entryPoints"`
	ExitPoints  []TrafficPoint `json:"exitPoints"`
	TopPaths    []TrafficPath  `json:"topPaths"`
	DropOffs    []TrafficPoint `json:"dropOffs"`
}

type TrafficPoint struct {
	URL        string  `json:"url"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

type TrafficPath struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Weight int    `json:"weight"`
}

// GetUserFlowReportHandler generates a summary report of user journeys
func GetUserFlowReportHandler(w http.ResponseWriter, r *http.Request) {
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

	report, err := CalculateUserFlowReport(r.Context(), siteID, days)
	if err != nil {
		log.Printf("Error calculating user flow report: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

func CalculateUserFlowReport(ctx context.Context, siteID string, days int) (*UserFlowReport, error) {
	query := `
		SELECT SessionID, URL, Timestamp
		FROM events
		WHERE SiteID = ? 
			AND EventType = 'pageview'
			AND Timestamp >= now() - INTERVAL ? DAY
			AND SessionID != ''
		ORDER BY SessionID, Timestamp ASC
		LIMIT 50000
	`

	rows, err := chConn.Query(ctx, query, siteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	sessionPaths := make(map[string][]string)
	pageTotalViews := make(map[string]int)

	for rows.Next() {
		var sessionID, url string
		var timestamp time.Time
		if err := rows.Scan(&sessionID, &url, &timestamp); err != nil {
			continue
		}
		url = normalizeFlowURL(url)
		sessionPaths[sessionID] = append(sessionPaths[sessionID], url)
		pageTotalViews[url]++
	}

	entryCounts := make(map[string]int)
	exitCounts := make(map[string]int)
	transitions := make(map[string]map[string]int)
	totalSessions := len(sessionPaths)

	for _, path := range sessionPaths {
		if len(path) == 0 {
			continue
		}
		entryCounts[path[0]]++
		exitCounts[path[len(path)-1]]++

		for i := 0; i < len(path)-1; i++ {
			src, dst := path[i], path[i+1]
			if src == dst {
				continue
			}
			if transitions[src] == nil {
				transitions[src] = make(map[string]int)
			}
			transitions[src][dst]++
		}
	}

	report := &UserFlowReport{
		EntryPoints: []TrafficPoint{},
		ExitPoints:  []TrafficPoint{},
		TopPaths:    []TrafficPath{},
		DropOffs:    []TrafficPoint{},
	}

	if totalSessions == 0 {
		return report, nil
	}

	// 1. Top Entry Points
	for url, count := range entryCounts {
		report.EntryPoints = append(report.EntryPoints, TrafficPoint{
			URL:        url,
			Count:      count,
			Percentage: float64(count) / float64(totalSessions) * 100,
		})
	}
	sort.Slice(report.EntryPoints, func(i, j int) bool { return report.EntryPoints[i].Count > report.EntryPoints[j].Count })
	if len(report.EntryPoints) > 5 {
		report.EntryPoints = report.EntryPoints[:5]
	}

	// 2. Top Exit Points
	for url, count := range exitCounts {
		report.ExitPoints = append(report.ExitPoints, TrafficPoint{
			URL:        url,
			Count:      count,
			Percentage: float64(count) / float64(totalSessions) * 100,
		})
	}
	sort.Slice(report.ExitPoints, func(i, j int) bool { return report.ExitPoints[i].Count > report.ExitPoints[j].Count })
	if len(report.ExitPoints) > 5 {
		report.ExitPoints = report.ExitPoints[:5]
	}

	// 3. Top Paths
	for src, targets := range transitions {
		for dst, weight := range targets {
			report.TopPaths = append(report.TopPaths, TrafficPath{
				Source: src,
				Target: dst,
				Weight: weight,
			})
		}
	}
	sort.Slice(report.TopPaths, func(i, j int) bool { return report.TopPaths[i].Weight > report.TopPaths[j].Weight })
	if len(report.TopPaths) > 8 {
		report.TopPaths = report.TopPaths[:8]
	}

	// 4. Drop-offs (High ratio of non-continuing traffic relative to page views)
	for url, views := range pageTotalViews {
		continuity := 0
		if t, ok := transitions[url]; ok {
			for _, w := range t {
				continuity += w
			}
		}
		dropOff := views - continuity
		if dropOff < 0 {
			dropOff = 0
		}
		report.DropOffs = append(report.DropOffs, TrafficPoint{
			URL:        url,
			Count:      dropOff,
			Percentage: float64(dropOff) / float64(views) * 100,
		})
	}
	sort.Slice(report.DropOffs, func(i, j int) bool { return report.DropOffs[i].Count > report.DropOffs[j].Count })
	if len(report.DropOffs) > 5 {
		report.DropOffs = report.DropOffs[:5]
	}

	return report, nil
}

func normalizeFlowURL(rawURL string) string {
	u, err := net_url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	// Return path only (e.g. /dashboard)
	// If path is empty, return /
	if u.Path == "" {
		return "/"
	}
	return u.Path
}
