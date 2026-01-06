package sentinel

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/oschwald/geoip2-golang"
	"github.com/ua-parser/uap-go/uaparser"
)

// --- EVENT TRACKING ---

type Event struct {
	SiteID      string   `json:"siteId"`
	SessionID   string   `json:"sessionId"`
	URL         string   `json:"url"`
	Referrer    string   `json:"referrer"`
	ScreenWidth int      `json:"screenWidth"`
	EventType   string   `json:"eventType"`
	PageTitle   string   `json:"pageTitle"`
	LCP         *float64 `json:"LCP,omitempty"`
	CLS         *float64 `json:"CLS,omitempty"`
	FID         *float64 `json:"FID,omitempty"`
	
	// UTM Parameters
	UtmSource   string `json:"utm_source,omitempty"`
	UtmMedium   string `json:"utm_medium,omitempty"`
	UtmCampaign string `json:"utm_campaign,omitempty"`
	UtmTerm     string `json:"utm_term,omitempty"`
	UtmContent  string `json:"utm_content,omitempty"`
	Channel     string `json:"channel,omitempty"`
}

type EventData struct {
	Timestamp   time.Time
	SiteID      string
	SessionID   string
	ClientIP    string
	URL         string
	Referrer    string
	ScreenWidth uint16
	Browser     string
	OS          string
	Country     string
	EventType   string
	PageTitle   string
	TrustScore  uint8
	LCP         sql.NullFloat64
	CLS         sql.NullFloat64
	FID         sql.NullFloat64
	
	// UTM & Attribution
	UtmSource   string
	UtmMedium   string
	UtmCampaign string
	UtmTerm     string
	UtmContent  string
	Channel     string
}

// --- ANALYTICS ENGINE ---

var uaParser *uaparser.Parser
var geoipDb *geoip2.Reader
var asnDb *geoip2.Reader

func InitAnalyticsEngine() {
	var err error
	uaParser = uaparser.NewFromSaved()

	geoipDb, err = geoip2.Open("GeoLite2-Country.mmdb")
	if err != nil {
		log.Printf("Warning: GeoIP database 'GeoLite2-Country.mmdb' not found. Country lookups will be disabled. Error: %v", err)
	}

	asnDb, err = geoip2.Open("GeoLite2-ASN.mmdb")
	if err != nil {
		log.Printf("Warning: ASN database 'GeoLite2-ASN.mmdb' not found. Bot detection will be less accurate. Error: %v", err)
	}
}

type Stats struct {
	TotalViews          uint64      `json:"totalViews"`
	UniqueVisitors      uint64      `json:"uniqueVisitors"`
	BounceRate          float64     `json:"bounceRate"`
	AvgVisitTime        string      `json:"avgVisitTime"`
	TrafficQualityScore float64     `json:"trafficQualityScore"`
	AvgLCP              float64     `json:"avgLcp"`
	AvgCLS              float64     `json:"avgCls"`
	AvgFID              float64     `json:"avgFid"`
	TopPages            []CountStat `json:"topPages"`
	TopReferrers        []CountStat `json:"topReferrers"`
	TopBrowsers         []CountStat `json:"topBrowsers"`
	TopOS               []CountStat `json:"topOs"`
	TopCountries        []CountStat `json:"topCountries"`
	DailyStats          []CountStat `json:"dailyStats"`

	// Change indicators
	TotalViewsChange          float64 `json:"totalViewsChange"`
	UniqueVisitorsChange      float64 `json:"uniqueVisitorsChange"`
	BounceRateChange          float64 `json:"bounceRateChange"`
	AvgVisitTimeChange        float64 `json:"avgVisitTimeChange"`
	TrafficQualityScoreChange float64 `json:"trafficQualityScoreChange"`
	AvgLCPChange              float64 `json:"avgLcpChange"`
	AvgCLSChange              float64 `json:"avgClsChange"`
	AvgFIDChange              float64 `json:"avgFidChange"`
	
	// New UTM & Engagement context for AI
	Campaigns  *CampaignStat    `json:"campaigns,omitempty"`
	Engagement []EngagementStat `json:"engagement,omitempty"`
}

type CoreStats struct {
	TotalViews          uint64
	UniqueVisitors      uint64
	BounceRate          float64
	AvgVisitTime        float64 // in seconds
	TrafficQualityScore float64
	AvgLCP              float64
	AvgCLS              float64
	AvgFID              float64
	DailyStats          []CountStat
}

type CampaignStat struct {
	TotalViews     uint64      `json:"totalViews"`
	UniqueVisitors uint64      `json:"uniqueVisitors"`
	TopSources     []CountStat `json:"topSources"`
	TopMediums     []CountStat `json:"topMediums"`
	TopCampaigns   []CountStat `json:"topCampaigns"`
	TopChannels    []CountStat `json:"topChannels"`
}

type EngagementStat struct {
	PageURL      string       `json:"pageUrl"`
	Milestones   []Milestone  `json:"milestones"`
	AvgMaxDepth  float64      `json:"avgMaxDepth"`
}

type Milestone struct {
	Level      int     `json:"level"`
	Percentage float64 `json:"percentage"`
}


type CountStat struct {
	Value string `json:"value"`
	Count uint64 `json:"count"`
}

func getClientIP(r *http.Request) string {
	forwardedFor := r.Header.Get("X-Forwarded-For")
	if forwardedFor != "" {
		ips := strings.Split(forwardedFor, ",")
		return strings.TrimSpace(ips[0])
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// Helper functions for enriching event data
func getCountry(ipStr string) string {
	ip := net.ParseIP(ipStr)
	if geoipDb != nil && ip != nil {
		record, err := geoipDb.Country(ip)
		if err == nil && record.Country.IsoCode != "" {
			return record.Country.IsoCode
		}
	}
	return "Unknown"
}

func getCity(ipStr string) string {
	return "" // Requires GeoLite2-City database
}

func getBrowser(userAgent string) string {
	if uaParser != nil {
		client := uaParser.Parse(userAgent)
		browser := client.UserAgent.Family
		if browser == "Other" || browser == "" {
			return "Unknown"
		}
		return browser
	}
	return "Unknown"
}

func getOS(userAgent string) string {
	if uaParser != nil {
		client := uaParser.Parse(userAgent)
		os := client.Os.Family
		if os == "Other" || os == "" {
			return "Unknown"
		}
		return os
	}
	return "Unknown"
}

func getDevice(userAgent string) string {
	ua := strings.ToLower(userAgent)
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone") {
		return "Mobile"
	}
	if strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad") {
		return "Tablet"
	}
	return "Desktop"
}

func parseIntOrDefault(s string, defaultVal int) int {
	if val, err := strconv.Atoi(s); err == nil {
		return val
	}
	return defaultVal
}

func verifySiteOwnership(r *http.Request, siteID string) bool {
	// Get userID from context (set by AuthMiddleware)
	userID, ok := r.Context().Value("userID").(int)
	if !ok || userID == 0 {
		return false
	}
	
	// Query database to get the owner of this site
	var ownerID int
	err := db.QueryRow("SELECT user_id FROM sites WHERE id = $1", siteID).Scan(&ownerID)
	if err != nil {
		return false
	}
	
	// Check if the authenticated user owns this site
	return ownerID == userID
}

var botUserAgents = []string{
	"bot", "spider", "crawler", "monitor", "Go-http-client", "python-requests",
}

func calculateTrustScore(ip net.IP, userAgent string) uint8 {
	score := 100
	for _, botString := range botUserAgents {
		if strings.Contains(strings.ToLower(userAgent), botString) {
			score -= 50
			break
		}
	}
	if asnDb != nil && ip != nil {
		_, err := asnDb.ASN(ip)
		if err == nil {
			score -= 40
		}
	}
	if score < 0 {
		return 0
	}
	return uint8(score)
}

func TrackHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	userAgent := r.UserAgent()
	client := uaParser.Parse(userAgent)
	ipStr := getClientIP(r)
	ip := net.ParseIP(ipStr)

	log.Printf("[Track] Received %s event for Site %s from %s (URL: %s)", event.EventType, event.SiteID, ipStr, event.URL)

	country := "Unknown"
	if geoipDb != nil && ip != nil {
		record, err := geoipDb.Country(ip)
		if err == nil && record.Country.IsoCode != "" {
			country = record.Country.IsoCode
		}
	}

	browser := client.UserAgent.Family
	if browser == "Other" {
		browser = "Unknown"
	}
	osFamily := client.Os.Family
	if osFamily == "Other" {
		osFamily = "Unknown"
	}

	trustScore := calculateTrustScore(ip, userAgent)

	// Check Shield Mode
	var shieldMode bool
	if err := db.QueryRow("SELECT shield_mode FROM sites WHERE id = $1", event.SiteID).Scan(&shieldMode); err == nil && shieldMode {
		if trustScore < 80 {
			http.Error(w, "Blocked by Shield Mode", http.StatusForbidden)
			return
		}
	}

	var asn string
	if asnDb != nil && ip != nil {
		record, err := asnDb.ASN(ip)
		if err == nil {
			asn = record.AutonomousSystemOrganization
		}
	}
	if isBlocked(event.SiteID, ipStr, country, asn) {
		http.Error(w, "Forbidden by firewall", http.StatusForbidden)
		return
	}

	eventData := EventData{
		Timestamp:   time.Now().UTC(),
		SiteID:      event.SiteID,
		SessionID:   event.SessionID,
		ClientIP:    ipStr,
		URL:         event.URL,
		Referrer:    event.Referrer,
		PageTitle:   event.PageTitle,
		ScreenWidth: uint16(event.ScreenWidth),
		Browser:     browser,
		OS:          osFamily,
		Country:     country,
		EventType:   event.EventType,
		TrustScore:  trustScore,
		LCP:         nullFloat64(event.LCP),
		CLS:         nullFloat64(event.CLS),
		FID:         nullFloat64(event.FID),
		UtmSource:   event.UtmSource,
		UtmMedium:   event.UtmMedium,
		UtmCampaign: event.UtmCampaign,
		UtmTerm:     event.UtmTerm,
		UtmContent:  event.UtmContent,
		Channel:     event.Channel,
	}

	if eventData.EventType == "" {
		if eventData.LCP.Valid || eventData.CLS.Valid || eventData.FID.Valid {
			eventData.EventType = "web-vital"
		} else {
			eventData.EventType = "pageview"
		}
	}

	ctx := context.Background()
	err := chConn.AsyncInsert(ctx, `INSERT INTO sentinel.events 
		(Timestamp, SiteID, ClientIP, SessionID, URL, Referrer, ScreenWidth, Browser, OS, Country, TrustScore, LCP, CLS, FID, EventType, PageTitle, UtmSource, UtmMedium, UtmCampaign, UtmTerm, UtmContent, Channel) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, false,
		eventData.Timestamp, eventData.SiteID, eventData.ClientIP, eventData.SessionID, eventData.URL, eventData.Referrer,
		eventData.ScreenWidth, eventData.Browser, eventData.OS, eventData.Country, eventData.TrustScore,
		eventData.LCP, eventData.CLS, eventData.FID, eventData.EventType, eventData.PageTitle,
		eventData.UtmSource, eventData.UtmMedium, eventData.UtmCampaign, eventData.UtmTerm, eventData.UtmContent, eventData.Channel,
	)
	if err != nil {
		log.Printf("Error inserting event into ClickHouse: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// --- CLICKS & ERRORS ---

type Click struct {
	SiteID   string `json:"siteId"`
	URL      string `json:"url"`
	X        int    `json:"x"`
	Y        int    `json:"y"`
	Selector string `json:"selector"`
}

type JSError struct {
	SiteID   string `json:"siteId"`
	URL      string `json:"url"`
	Message  string `json:"message"`
	Source   string `json:"source"`
	LineNo   int    `json:"lineno"`
	ColNo    int    `json:"colno"`
	ErrorObj string `json:"error"`
}

func ClickHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var click Click
	if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	ipStr := getClientIP(r)
	ip := net.ParseIP(ipStr)
	country := "Unknown"
	if geoipDb != nil && ip != nil {
		record, err := geoipDb.Country(ip)
		if err == nil && record.Country.IsoCode != "" {
			country = record.Country.IsoCode
		}
	}

	ctx := context.Background()
	err := chConn.AsyncInsert(ctx, "INSERT INTO sentinel.clicks VALUES (?, ?, ?, ?, ?, ?, ?, ?)", false,
		time.Now().UTC(), click.SiteID, ipStr, click.URL, uint16(click.X), uint16(click.Y), click.Selector, country,
	)
	if err != nil {
		log.Printf("Error inserting click: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func ErrorHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var jsErr JSError
	if err := json.NewDecoder(r.Body).Decode(&jsErr); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	log.Printf("DEBUG: Received JS Error: %s from %s (SiteID: %s)", jsErr.Message, jsErr.URL, jsErr.SiteID)

	ipStr := getClientIP(r)

	ctx := context.Background()
	err := chConn.AsyncInsert(ctx, "INSERT INTO sentinel.errors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", true,
		time.Now().UTC(), jsErr.SiteID, ipStr, jsErr.URL, jsErr.Message, jsErr.Source, uint32(jsErr.LineNo), uint32(jsErr.ColNo), jsErr.ErrorObj, "", "",
	)
	if err != nil {
		log.Printf("Error inserting JS error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// --- DATA RETRIEVAL FOR NEW FEATURES ---

func GetHeatmapDataHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	urlPath := r.URL.Query().Get("url") // Optional: filter by specific page
	
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	var query string
	var args []interface{}
	
	args = append(args, siteID)

	if urlPath != "" {
		// If URL is provided, return individual points for the canvas
		// Limit to 2000 points to prevent browser crash, sample recent data
		query = `
			SELECT X, Y, count() as intensity 
			FROM sentinel.clicks 
			WHERE SiteID = ? AND URL LIKE ? AND Timestamp >= now() - INTERVAL 7 DAY
			GROUP BY X, Y 
			ORDER BY intensity DESC 
			LIMIT 1000
		`
		args = append(args, "%"+urlPath+"%")
	} else {
		// If no URL, return list of pages with click counts
		query = `
			SELECT URL, count() as count 
			FROM sentinel.clicks 
			WHERE SiteID = ? AND Timestamp >= now() - INTERVAL 7 DAY
			GROUP BY URL 
			ORDER BY count DESC 
			LIMIT 50
		`
	}

	rows, err := chConn.Query(ctx, query, args...)
	if err != nil {
		log.Printf("Error querying heatmap data: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Dynamic result parsing based on query
	var result interface{}
	
	if urlPath != "" {
		type Point struct {
			X         uint16 `json:"x"`
			Y         uint16 `json:"y"`
			Intensity uint64 `json:"value"`
		}
		var points []Point
		for rows.Next() {
			var p Point
			if err := rows.Scan(&p.X, &p.Y, &p.Intensity); err != nil {
				continue
			}
			points = append(points, p)
		}
		result = points
	} else {
		type Page struct {
			URL   string `json:"url"`
			Count uint64 `json:"count"`
		}
		var pages []Page
		for rows.Next() {
			var p Page
			if err := rows.Scan(&p.URL, &p.Count); err != nil {
				continue
			}
			pages = append(pages, p)
		}
		result = pages
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func GetErrorsStatsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	log.Printf("DEBUG: Fetching errors for SiteID: %s", siteID)
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	// Return top errors by frequency
	query := `
		SELECT 
			Message, 
			Source, 
			LineNo, 
			count() as count, 
			uniq(ClientIP) as user_impact,
			max(Timestamp) as last_seen,
			any(Severity) as severity,
			any(Mitigation) as mitigation,
			any(ErrorObj) as error_obj
		FROM sentinel.errors 
		WHERE SiteID = ? AND Timestamp >= now() - INTERVAL 7 DAY
		GROUP BY Message, Source, LineNo
		ORDER BY count DESC
		LIMIT 20
	`

	log.Printf("DEBUG: Executing Error Stats Query for SiteID: %s", siteID)
	rows, err := chConn.Query(ctx, query, siteID)
	if err != nil {
		log.Printf("Error querying error stats: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type ErrorStat struct {
		Message    string    `json:"message"`
		Source     string    `json:"source"`
		LineNo     uint32    `json:"lineNo"`
		Count      uint64    `json:"count"`
		UserImpact uint64    `json:"userImpact"`
		LastSeen   time.Time `json:"lastSeen"`
		Severity   string    `json:"severity"`
		Mitigation string    `json:"mitigation"`
		ErrorObj   string    `json:"errorObj"`
	}

	var stats []ErrorStat
	rowCount := 0
	for rows.Next() {
		rowCount++
		var s ErrorStat
		if err := rows.Scan(&s.Message, &s.Source, &s.LineNo, &s.Count, &s.UserImpact, &s.LastSeen, &s.Severity, &s.Mitigation, &s.ErrorObj); err != nil {
			log.Printf("ERROR: Scan error in GetErrorsStats: %v", err)
			continue
		}
		stats = append(stats, s)
	}
	log.Printf("DEBUG: Found %d error rows for SiteID: %s", len(stats), siteID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func isBlocked(siteID, ip, country, asn string) bool {
	rows, err := db.Query("SELECT rule_type, value FROM firewall_rules WHERE site_id = $1", siteID)
	if err != nil {
		log.Printf("Error querying firewall rules: %v", err)
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var ruleType, value string
		if err := rows.Scan(&ruleType, &value); err != nil {
			log.Printf("Error scanning firewall rule: %v", err)
			continue
		}
		switch ruleType {
		case "ip":
			if strings.Contains(value, "/") {
				_, ipNet, err := net.ParseCIDR(value)
				if err == nil && ipNet.Contains(net.ParseIP(ip)) {
					return true
				}
			} else if value == ip {
				return true
			}
		case "country":
			if value == country {
				return true
			}
		case "asn":
			if value == asn {
				return true
			}
		}
	}
	return false
}

func SpiderTrapHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	ipStr := getClientIP(r)
	userAgent := r.UserAgent()

	// Log this as a high-confidence bot event
	log.Printf("SPIDER TRAP HIT: IP=%s, UA=%s", ipStr, userAgent)
	ctx := context.Background()
	err := chConn.AsyncInsert(ctx, `INSERT INTO sentinel.events 
		(Timestamp, SiteID, ClientIP, URL, Referrer, ScreenWidth, Browser, OS, Country, TrustScore, EventType, PageTitle) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, false,
		time.Now().UTC(), siteID, ipStr, "/track/spider-trap", "Spider Trap",
		0, "Bot", "Robot", "XX", 0, "bot-trap", "Spider Trap Detected",
	)
	if err != nil {
		log.Printf("Error logging spider trap: %v", err)
	}

	// Always return 403 to spiders
	http.Error(w, "Forbidden", http.StatusForbidden)
}

func DashboardApiHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId query parameter is required", http.StatusBadRequest)
		return
	}
	daysStr := r.URL.Query().Get("days")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 30 // Default to 30 days
	}

	stats, err := calculateStats(siteID, days)
	if err != nil {
		log.Printf("Error calculating stats: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Log the stats object before sending
	log.Printf("Dashboard stats for site %s (last %d days): %+v", siteID, days, stats)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Error encoding dashboard stats to JSON: %v", err)
		// The response header might have already been written, so we can't send a new HTTP error.
		// The client will likely see a truncated or empty response.
	}
}

func calculateChange(current, previous float64) float64 {
	if previous == 0 {
		return 0.0 // Avoid misleading "100%" or infinite growth for new data
	}
	return ((current - previous) / previous) * 100
}

func getCoreStats(ctx context.Context, siteID string, startDaysAgo, endDaysAgo int) (CoreStats, error) {
	var stats CoreStats

	// Total Views - Count only pageviews
	queryTotalViews := "SELECT count() FROM events WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'"
	err := chConn.QueryRow(ctx, queryTotalViews, siteID, startDaysAgo, endDaysAgo).Scan(&stats.TotalViews)
	if err != nil && err != sql.ErrNoRows {
		return stats, err
	}

	// Unique Visitors (Visits) - Count unique ClientIPs
	queryUniqueVisitors := "SELECT uniq(ClientIP) FROM events WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'"
	err = chConn.QueryRow(ctx, queryUniqueVisitors, siteID, startDaysAgo, endDaysAgo).Scan(&stats.UniqueVisitors)
	if err != nil && err != sql.ErrNoRows {
		return stats, err
	}

	// Bounce Rate - Calculate % of sessions with only 1 pageview using SessionID
	queryBounceRate := `
		SELECT (countIf(pageviews = 1) * 100.0 / NULLIF(count(), 0))
		FROM (
			SELECT SessionID, count() AS pageviews
			FROM events
			WHERE SiteID = ? 
				AND EventType = 'pageview' 
				AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY 
				AND ClientIP NOT IN ('127.0.0.1', '::1') 
				AND URL NOT LIKE '%localhost:8090%' 
				AND Referrer NOT LIKE '%localhost:8090%' 
				AND URL NOT LIKE '%Eng_Dub%' 
				AND Referrer NOT LIKE '%Eng_Dub%'
				AND SessionID != ''
			GROUP BY SessionID
		)`
	err = chConn.QueryRow(ctx, queryBounceRate, siteID, startDaysAgo, endDaysAgo).Scan(&stats.BounceRate)
	if err != nil {
		log.Printf("[BOUNCE RATE DEBUG] Query error: %v", err)
		stats.BounceRate = 0
	}
	if math.IsNaN(stats.BounceRate) {
		stats.BounceRate = 0
	}

	// Average Visit Duration - Based on heartbeat events (15 sec intervals)
	queryAvgVisitTime := `
		SELECT
			avg(visit_duration)
		FROM (
			SELECT
				SessionID,
				count(*) * 15 AS visit_duration
			FROM sentinel.events
			WHERE SiteID = ?
			  AND EventType = 'heartbeat'
			  AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY
			  AND ClientIP NOT IN ('127.0.0.1', '::1')
			  AND SessionID != ''
			GROUP BY SessionID
			HAVING count(*) > 0
		)
	`
	var heartbeatCount uint64
	chConn.QueryRow(ctx, "SELECT count() FROM sentinel.events WHERE SiteID = ? AND EventType = 'heartbeat' AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY", siteID, startDaysAgo, endDaysAgo).Scan(&heartbeatCount)
	log.Printf("[VISIT TIME DEBUG] Heartbeat events found: %d", heartbeatCount)
	
	err = chConn.QueryRow(ctx, queryAvgVisitTime, siteID, startDaysAgo, endDaysAgo).Scan(&stats.AvgVisitTime)
	if err != nil {
		log.Printf("[VISIT TIME DEBUG] Query error: %v", err)
		stats.AvgVisitTime = 0
	}
	if math.IsNaN(stats.AvgVisitTime) {
		stats.AvgVisitTime = 0
	}

	// Daily Visitors (for Line Chart)
	queryDaily := `
		SELECT 
			formatDateTime(Timestamp, '%Y-%m-%d') as date, 
			uniq(ClientIP) as count 
		FROM events 
		WHERE SiteID = ? 
		  AND EventType = 'pageview'
		  AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY 
		  AND ClientIP NOT IN ('127.0.0.1', '::1') 
		  AND URL NOT LIKE '%localhost:8090%' 
		  AND Referrer NOT LIKE '%localhost:8090%' 
		GROUP BY date 
		ORDER BY date ASC`
	
	rows, err := chConn.Query(ctx, queryDaily, siteID, startDaysAgo, endDaysAgo)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var d CountStat
			rows.Scan(&d.Value, &d.Count)
			stats.DailyStats = append(stats.DailyStats, d)
		}
	}

	// Traffic Quality Score
	queryGoodTraffic := "SELECT count() FROM events WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND TrustScore > 50 AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'"
	var goodTrafficCount uint64
	err = chConn.QueryRow(ctx, queryGoodTraffic, siteID, startDaysAgo, endDaysAgo).Scan(&goodTrafficCount)
	if err != nil || stats.TotalViews == 0 {
		stats.TrafficQualityScore = 0
	} else {
		stats.TrafficQualityScore = (float64(goodTrafficCount) / float64(stats.TotalViews)) * 100
	}

	// Web Vitals
	chConn.QueryRow(ctx, "SELECT avg(LCP) FROM events WHERE SiteID = ? AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'", siteID, startDaysAgo, endDaysAgo).Scan(&stats.AvgLCP)
	if math.IsNaN(stats.AvgLCP) {
		stats.AvgLCP = 0
	}
	chConn.QueryRow(ctx, "SELECT avg(CLS) FROM events WHERE SiteID = ? AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'", siteID, startDaysAgo, endDaysAgo).Scan(&stats.AvgCLS)
	if math.IsNaN(stats.AvgCLS) {
		stats.AvgCLS = 0
	}
	chConn.QueryRow(ctx, "SELECT avg(FID) FROM events WHERE SiteID = ? AND Timestamp BETWEEN now() - INTERVAL ? DAY AND now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%'", siteID, startDaysAgo, endDaysAgo).Scan(&stats.AvgFID)
	if math.IsNaN(stats.AvgFID) {
		stats.AvgFID = 0
	}

	return stats, nil
}

func calculateStats(siteID string, days int) (Stats, error) {
	ctx := context.Background()
	var finalStats Stats

	// Get stats for the current period (e.g., last 30 days)
	currentStats, err := getCoreStats(ctx, siteID, days, 0)
	if err != nil {
		return finalStats, err
	}

	// Get stats for the previous period (e.g., 31-60 days ago)
	previousStats, err := getCoreStats(ctx, siteID, days*2, days)
	if err != nil {
		return finalStats, err
	}

	// Populate the final stats struct
	finalStats.TotalViews = currentStats.TotalViews
	finalStats.UniqueVisitors = currentStats.UniqueVisitors
	finalStats.BounceRate = currentStats.BounceRate
	d := time.Duration(currentStats.AvgVisitTime) * time.Second
	finalStats.AvgVisitTime = d.Round(time.Second).String()
	finalStats.TrafficQualityScore = currentStats.TrafficQualityScore
	finalStats.AvgLCP = currentStats.AvgLCP
	finalStats.AvgCLS = currentStats.AvgCLS
	finalStats.AvgFID = currentStats.AvgFID
	finalStats.DailyStats = currentStats.DailyStats

	// Calculate percentage changes
	finalStats.TotalViewsChange = calculateChange(float64(currentStats.TotalViews), float64(previousStats.TotalViews))
	finalStats.UniqueVisitorsChange = calculateChange(float64(currentStats.UniqueVisitors), float64(previousStats.UniqueVisitors))
	finalStats.BounceRateChange = calculateChange(currentStats.BounceRate, previousStats.BounceRate)
	finalStats.AvgVisitTimeChange = calculateChange(currentStats.AvgVisitTime, previousStats.AvgVisitTime)
	// TrafficQualityScoreChange is an absolute point change, not a percentage change of a percentage.
	finalStats.TrafficQualityScoreChange = currentStats.TrafficQualityScore - previousStats.TrafficQualityScore
	finalStats.AvgLCPChange = calculateChange(currentStats.AvgLCP, previousStats.AvgLCP)
	finalStats.AvgCLSChange = calculateChange(currentStats.AvgCLS, previousStats.AvgCLS)
	finalStats.AvgFIDChange = calculateChange(currentStats.AvgFID, previousStats.AvgFID)

	// Top stats are still for the current period
	finalStats.TopPages, _ = queryTopStats(ctx, "URL", siteID, days)
	finalStats.TopReferrers, _ = queryTopStats(ctx, "Referrer", siteID, days)
	finalStats.TopBrowsers, _ = queryTopStats(ctx, "Browser", siteID, days)
	finalStats.TopOS, _ = queryTopStats(ctx, "OS", siteID, days)
	finalStats.TopCountries, _ = queryTopStats(ctx, "Country", siteID, days)

	// Fetch Campaign and Engagement data for context
	finalStats.Campaigns = getCampaignStats(ctx, siteID, days)
	finalStats.Engagement = getEngagementStats(ctx, siteID, days)

	return finalStats, nil
}

func queryTopStats(ctx context.Context, column, siteID string, days int) ([]CountStat, error) {
	var query string
	if column == "URL" {
		// For Top Pages, we want the most recent Title associated with each URL
		query = `
			SELECT 
				URL, 
				count() AS c, 
				argMax(PageTitle, Timestamp) as title
			FROM events 
			WHERE SiteID = ? 
			  AND EventType = 'pageview' 
			  AND Timestamp >= now() - INTERVAL ? DAY 
			  AND ClientIP NOT IN ('127.0.0.1', '::1') 
			  AND URL NOT LIKE '%localhost:8090%' 
			  AND Referrer NOT LIKE '%localhost:8090%' 
			GROUP BY URL 
			ORDER BY c DESC 
			LIMIT 10
		`
	} else {
		query = "SELECT " + column + ", count() AS c FROM events WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= now() - INTERVAL ? DAY AND ClientIP NOT IN ('127.0.0.1', '::1') AND URL NOT LIKE '%localhost:8090%' AND Referrer NOT LIKE '%localhost:8090%' AND URL NOT LIKE '%Eng_Dub%' AND Referrer NOT LIKE '%Eng_Dub%' GROUP BY " + column + " ORDER BY c DESC LIMIT 10"
	}

	rows, err := chConn.Query(ctx, query, siteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []CountStat
	for rows.Next() {
		var stat CountStat
		if column == "URL" {
			var url, title string
			var count uint64
			if err := rows.Scan(&url, &count, &title); err != nil {
				return nil, err
			}
			// Use Title if available, else URL
			displayValue := title
			if displayValue == "" {
				displayValue = url
			}
			stat = CountStat{Value: displayValue, Count: count}
		} else {
			if err := rows.Scan(&stat.Value, &stat.Count); err != nil {
				return nil, err
			}
		}
		result = append(result, stat)
	}
	return result, nil
}

func nullFloat64(f *float64) sql.NullFloat64 {
	if f == nil {
		return sql.NullFloat64{}
	}
	return sql.NullFloat64{Float64: *f, Valid: true}
}

// GetCampaignStatsHandler returns attribution and campaign statistics
func GetCampaignStatsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	days := parseIntOrDefault(r.URL.Query().Get("days"), 30)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := context.Background()
	stats := getCampaignStats(ctx, siteID, days)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func getCampaignStats(ctx context.Context, siteID string, days int) *CampaignStat {
	var stats CampaignStat

	// 1. Core Summary
	query := `
		SELECT count(), uniqExact(SessionID)
		FROM sentinel.events
		WHERE SiteID = ? 
			AND Timestamp >= now() - INTERVAL ? DAY
			AND UtmSource != ''
	`
	err := chConn.QueryRow(ctx, query, siteID, days).Scan(&stats.TotalViews, &stats.UniqueVisitors)
	if err != nil {
		log.Printf("Error querying campaign core stats: %v", err)
	}

	// 2. Top Sources
	stats.TopSources = fetchTopStats(ctx, siteID, "UtmSource", days, 10, "UtmSource != ''")
	
	// 3. Top Mediums
	stats.TopMediums = fetchTopStats(ctx, siteID, "UtmMedium", days, 10, "UtmMedium != ''")
	
	// 4. Top Campaigns
	stats.TopCampaigns = fetchTopStats(ctx, siteID, "UtmCampaign", days, 10, "UtmCampaign != ''")
	
	// 5. Top Channels
	stats.TopChannels = fetchTopStats(ctx, siteID, "Channel", days, 10, "Channel != ''")
	
	return &stats
}

// Helper for fetching top breakdown stats
func fetchTopStats(ctx context.Context, siteID, column string, days, limit int, extraWhere string) []CountStat {
	where := fmt.Sprintf("SiteID = ? AND Timestamp >= now() - INTERVAL ? DAY AND %s", extraWhere)
	query := fmt.Sprintf("SELECT %s, count() as count FROM sentinel.events WHERE %s GROUP BY %s ORDER BY count DESC LIMIT ?", column, where, column)
	
	rows, err := chConn.Query(ctx, query, siteID, days, limit)
	if err != nil {
		log.Printf("Error fetching top %s: %v", column, err)
		return []CountStat{}
	}
	defer rows.Close()

	var results []CountStat
	for rows.Next() {
		var stat CountStat
		if err := rows.Scan(&stat.Value, &stat.Count); err != nil {
			continue
		}
		results = append(results, stat)
	}
	return results
}


// GetEngagementStatsHandler returns scroll depth and engagement metrics
func GetEngagementStatsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	days := parseIntOrDefault(r.URL.Query().Get("days"), 30)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := context.Background()
	engagementData := getEngagementStats(ctx, siteID, days)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(engagementData)
}

func getEngagementStats(ctx context.Context, siteID string, days int) []EngagementStat {
	// 1. Get Top 5 URLs directly (not Titles) to ensure precise matching
	queryTopParams := `
		SELECT 
			URL, 
			count() as c
		FROM sentinel.events 
		WHERE SiteID = ? 
		  AND EventType = 'pageview' 
		  AND Timestamp >= now() - INTERVAL ? DAY 
		  AND ClientIP NOT IN ('127.0.0.1', '::1') 
		  AND URL NOT LIKE '%localhost:8090%' 
		  AND Referrer NOT LIKE '%localhost:8090%' 
		GROUP BY URL 
		ORDER BY c DESC 
		LIMIT 5
	`
	
	rows, err := chConn.Query(ctx, queryTopParams, siteID, days)
	if err != nil {
		log.Printf("[ENGAGEMENT ERROR] Failed to query top pages: %v", err)
		return []EngagementStat{}
	}
	defer rows.Close()

	var topURLs []string
	for rows.Next() {
		var url string
		var count uint64
		if err := rows.Scan(&url, &count); err == nil {
			topURLs = append(topURLs, url)
		}
	}
	
	log.Printf("[ENGAGEMENT DEBUG] Found %d top URLs for engagement analysis", len(topURLs))
	
	var engagementData []EngagementStat

	for _, url := range topURLs {
		// Get Page Title for display if possible, otherwise use URL
		var pageTitle string
		titleQuery := `SELECT argMax(PageTitle, Timestamp) FROM sentinel.events WHERE SiteID = ? AND URL = ?`
		chConn.QueryRow(ctx, titleQuery, siteID, url).Scan(&pageTitle)
		
		displayLabel := pageTitle
		if displayLabel == "" {
			displayLabel = url
		}
		
		// Simplify label if it's just the domain + slash
		if displayLabel == "/" || displayLabel == "" {
			displayLabel = "Home"
		}

		log.Printf("[ENGAGEMENT DEBUG] Processing URL: %s (Title: %s)", url, displayLabel)
		stat := EngagementStat{PageURL: displayLabel}
		
		// Calculate milestones
		milestones := []int{25, 50, 75, 100}
		for _, m := range milestones {
			// Query specifically checks for scroll_depth events on this URL
			query := `
				SELECT count() 
				FROM sentinel.events 
				WHERE SiteID = ? 
					AND EventType = 'custom' 
					AND EventName = 'scroll_depth' 
					AND URL = ? 
					AND JSONExtractInt(Properties, 'depth') >= ?
					AND Timestamp >= now() - INTERVAL ? DAY
			`
			var count uint64
			// Use the actual URL for querying interactions
			err := chConn.QueryRow(ctx, query, siteID, url, m, days).Scan(&count)
			if err != nil {
				log.Printf("[ENGAGEMENT ERROR] Milestone %d%% query failed for %s: %v", m, url, err)
			} else {
				// Normalize against total pageviews for this SPECIFIC URL
				pvQuery := `SELECT count() FROM sentinel.events WHERE SiteID = ? AND EventType = 'pageview' AND URL = ? AND Timestamp >= now() - INTERVAL ? DAY`
				var totalPV uint64
				chConn.QueryRow(ctx, pvQuery, siteID, url, days).Scan(&totalPV)
				
				if count > 0 {
					log.Printf("[ENGAGEMENT DEBUG] %s - Milestone %d%%: %d events vs %d pageviews", url, m, count, totalPV)
				}
				
				percentage := 0.0
				if totalPV > 0 {
					percentage = (float64(count) / float64(totalPV)) * 100
					// Cap at 100% just in case
					if percentage > 100 {
						percentage = 100
					}
				}
				stat.Milestones = append(stat.Milestones, Milestone{Level: m, Percentage: percentage})
			}
		}

		// Calculate Avg Max Depth
		maxDepthQuery := `
			SELECT avg(JSONExtractInt(Properties, 'maxDepth'))
			FROM sentinel.events
			WHERE SiteID = ? 
				AND EventType = 'custom' 
				AND EventName = 'scroll_final'
				AND URL = ? 
				AND Timestamp >= now() - INTERVAL ? DAY
		`
		err := chConn.QueryRow(ctx, maxDepthQuery, siteID, url, days).Scan(&stat.AvgMaxDepth)
		if err != nil {
			// Ensure it's 0 if no data
			stat.AvgMaxDepth = 0
		}
		
		if math.IsNaN(stat.AvgMaxDepth) {
			stat.AvgMaxDepth = 0
		} else {
			log.Printf("[ENGAGEMENT DEBUG] %s - Avg Max Depth: %.2f", url, stat.AvgMaxDepth)
		}
		
		engagementData = append(engagementData, stat)
	}
	
	return engagementData
}
