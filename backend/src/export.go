package sentinel

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
)

// ExportFormat type
type ExportFormat string

const (
	FormatCSV  ExportFormat = "csv"
	FormatJSON ExportFormat = "json"
)

// ExportOverviewRow represents a row of dashboard overview data
type ExportOverviewRow struct {
	Date           string  `json:"date"`
	TotalViews     uint64  `json:"total_views"`
	UniqueVisitors uint64  `json:"unique_visitors"`
	BounceRate     float64 `json:"bounce_rate"`
	AvgVisitTime   float64 `json:"avg_visit_time"`
}

// ExportPageviewRow represents a raw pageview event
type ExportPageviewRow struct {
	Timestamp string `json:"timestamp"`
	URL       string `json:"url"`
	Referrer  string `json:"referrer"`
	Country   string `json:"country"`
	Browser   string `json:"browser"`
	OS        string `json:"os"`
	Device    string `json:"device"`
}

// ExportCustomEventRow represents a custom event
type ExportCustomEventRow struct {
	Timestamp  string `json:"timestamp"`
	EventName  string `json:"event_name"`
	URL        string `json:"url"`
	Properties string `json:"properties"`
}

// ExportCampaignRow represents campaign/UTM data
type ExportCampaignRow struct {
	Source   string `json:"source"`
	Medium   string `json:"medium"`
	Campaign string `json:"campaign"`
	Visitors uint64 `json:"visitors"`
	Views    uint64 `json:"views"`
}

// ExportErrorRow represents an error log entry
type ExportErrorRow struct {
	Timestamp string `json:"timestamp"`
	Message   string `json:"message"`
	Source    string `json:"source"`
	Count     uint64 `json:"count"`
}

// ExportHandler handles all data export requests
// GET /api/export?type=overview|pageviews|events|campaigns|errors&format=csv|json&siteId=xxx&days=30
func ExportHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		writeJSONError(w, http.StatusBadRequest, "siteId is required")
		return
	}

	exportType := r.URL.Query().Get("type")
	format := ExportFormat(r.URL.Query().Get("format"))
	if format == "" {
		format = FormatCSV
	}

	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")
	var startTime, endTime time.Time

	if fromStr != "" && toStr != "" {
		// Try parsing from/to dates (expecting YYYY-MM-DD or RFC3339)
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			startTime = t
		} else if t, err := time.Parse(time.RFC3339, fromStr); err == nil {
			startTime = t
		}

		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			endTime = t.Add(23*time.Hour + 59*time.Minute + 59*time.Second) // End of day
		} else if t, err := time.Parse(time.RFC3339, toStr); err == nil {
			endTime = t
		}
	}

	// Fallback to days if dates are not valid
	if startTime.IsZero() {
		daysStr := r.URL.Query().Get("days")
		days := 30
		if daysStr != "" {
			if d, err := strconv.Atoi(daysStr); err == nil && d > 0 && d <= 365 {
				days = d
			}
		}
		startTime = time.Now().AddDate(0, 0, -days)
		endTime = time.Now()
	}

	switch exportType {
	case "overview":
		exportOverview(w, siteID, startTime, endTime, format)
	case "pageviews":
		exportPageviews(w, siteID, startTime, endTime, format)
	case "events":
		exportCustomEvents(w, siteID, startTime, endTime, format)
	case "campaigns":
		exportCampaigns(w, siteID, startTime, endTime, format)
	case "referrers":
		exportReferrers(w, siteID, startTime, endTime, format)
	case "locations":
		exportLocations(w, siteID, startTime, endTime, format)
	case "devices":
		exportDevices(w, siteID, startTime, endTime, format)
	case "browsers":
		exportBrowsers(w, siteID, startTime, endTime, format)
	case "os":
		exportOS(w, siteID, startTime, endTime, format)
	case "errors":
		exportErrors(w, siteID, startTime, endTime, format)
	default:
		writeJSONError(w, http.StatusBadRequest, "Invalid export type. Use: overview, pageviews, events, campaigns, referrers, locations, devices, browsers, os, errors")
	}
}

func exportOverview(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}

	// Complex query for daily metrics including bounce rate and duration
	query := fmt.Sprintf(`
		WITH session_stats AS (
			SELECT
				toDate(Timestamp) as d,
				SessionID,
				count() as event_count,
				max(Timestamp) - min(Timestamp) as duration
			FROM %s.events
			WHERE SiteID = ?
			  AND Timestamp >= ? AND Timestamp <= ?
			  AND ClientIP NOT IN ('127.0.0.1', '::1')
			GROUP BY d, SessionID
		)
		SELECT
			d,
			countIf(event_count > 0) as total_views, -- Approximate views from event count
			uniq(SessionID) as unique_sessions,
			round(countIf(event_count = 1) / count() * 100, 2) as bounce_rate,
			round(avg(duration), 2) as avg_duration
		FROM session_stats
		GROUP BY d
		ORDER BY d DESC
	`, dbName)

	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] Overview query error: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var results []ExportOverviewRow
	for rows.Next() {
		var date time.Time
		var views, visitors uint64
		var bounce, duration float64
		if err := rows.Scan(&date, &views, &visitors, &bounce, &duration); err != nil {
			log.Printf("[EXPORT] Scan error: %v", err)
			continue
		}
		results = append(results, ExportOverviewRow{
			Date:           date.Format("2006-01-02"),
			TotalViews:     views,
			UniqueVisitors: visitors,
			BounceRate:     bounce,
			AvgVisitTime:   duration,
		})
	}

	if format == FormatJSON {
		writeJSONExport(w, "overview", results)
	} else {
		headers := []string{"Date", "Total Views", "Unique Visitors", "Bounce Rate (%)", "Avg Duration (s)"}
		var csvRows [][]string
		for _, r := range results {
			csvRows = append(csvRows, []string{
				r.Date,
				strconv.FormatUint(r.TotalViews, 10),
				strconv.FormatUint(r.UniqueVisitors, 10),
				fmt.Sprintf("%.2f", r.BounceRate),
				fmt.Sprintf("%.2f", r.AvgVisitTime),
			})
		}
		writeCSVExport(w, "overview", headers, csvRows)
	}
}

func exportPageviews(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}

	query := fmt.Sprintf(`
		SELECT
			Timestamp,
			URL,
			Referrer,
			Country,
			Browser,
			OS,
			if(ScreenWidth < 768, 'Mobile', if(ScreenWidth < 1024, 'Tablet', 'Desktop')) as Device
		FROM %s.events
		WHERE SiteID = ?
		  AND EventType = 'pageview'
		  AND Timestamp >= ? AND Timestamp <= ?
		  AND ClientIP NOT IN ('127.0.0.1', '::1')
		ORDER BY Timestamp DESC
		LIMIT 100000
	`, dbName)

	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] Pageviews query error: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var results []ExportPageviewRow
	for rows.Next() {
		var ts time.Time
		var url, referrer, country, browser, os, device string
		if err := rows.Scan(&ts, &url, &referrer, &country, &browser, &os, &device); err != nil {
			continue
		}
		results = append(results, ExportPageviewRow{
			Timestamp: ts.Format(time.RFC3339),
			URL:       url,
			Referrer:  referrer,
			Country:   country,
			Browser:   browser,
			OS:        os,
			Device:    device,
		})
	}

	if format == FormatJSON {
		writeJSONExport(w, "pageviews", results)
	} else {
		headers := []string{"Timestamp", "URL", "Referrer", "Country", "Browser", "OS", "Device"}
		var csvRows [][]string
		for _, r := range results {
			csvRows = append(csvRows, []string{r.Timestamp, r.URL, r.Referrer, r.Country, r.Browser, r.OS, r.Device})
		}
		writeCSVExport(w, "pageviews", headers, csvRows)
	}
}

func exportCustomEvents(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}

	query := fmt.Sprintf(`
		SELECT
			Timestamp,
			EventType,
			URL,
			PageTitle
		FROM %s.events
		WHERE SiteID = ?
		  AND EventType NOT IN ('pageview', 'heartbeat', 'click', 'error', 'scroll')
		  AND Timestamp >= ? AND Timestamp <= ?
		ORDER BY Timestamp DESC
		LIMIT 100000
	`, dbName)

	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] Events query error: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var results []ExportCustomEventRow
	for rows.Next() {
		var ts time.Time
		var eventName, url, props string
		if err := rows.Scan(&ts, &eventName, &url, &props); err != nil {
			continue
		}
		results = append(results, ExportCustomEventRow{
			Timestamp:  ts.Format(time.RFC3339),
			EventName:  eventName,
			URL:        url,
			Properties: props,
		})
	}

	if format == FormatJSON {
		writeJSONExport(w, "events", results)
	} else {
		headers := []string{"Timestamp", "Event Name", "URL", "Properties"}
		var csvRows [][]string
		for _, r := range results {
			csvRows = append(csvRows, []string{r.Timestamp, r.EventName, r.URL, r.Properties})
		}
		writeCSVExport(w, "events", headers, csvRows)
	}
}

func exportCampaigns(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}

	query := fmt.Sprintf(`
		SELECT
			UtmSource,
			UtmMedium,
			UtmCampaign,
			uniq(ClientIP) as visitors,
			count() as views
		FROM %s.events
		WHERE SiteID = ?
		  AND EventType = 'pageview'
		  AND Timestamp >= ? AND Timestamp <= ?
		  AND UtmSource != ''
		GROUP BY UtmSource, UtmMedium, UtmCampaign
		ORDER BY visitors DESC
		LIMIT 5000
	`, dbName)

	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] Campaigns query error: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var results []ExportCampaignRow
	for rows.Next() {
		var source, medium, campaign string
		var visitors, views uint64
		if err := rows.Scan(&source, &medium, &campaign, &visitors, &views); err != nil {
			continue
		}
		results = append(results, ExportCampaignRow{
			Source:   source,
			Medium:   medium,
			Campaign: campaign,
			Visitors: visitors,
			Views:    views,
		})
	}

	if format == FormatJSON {
		writeJSONExport(w, "campaigns", results)
	} else {
		headers := []string{"Source", "Medium", "Campaign", "Visitors", "Views"}
		var csvRows [][]string
		for _, r := range results {
			csvRows = append(csvRows, []string{r.Source, r.Medium, r.Campaign, strconv.FormatUint(r.Visitors, 10), strconv.FormatUint(r.Views, 10)})
		}
		writeCSVExport(w, "campaigns", headers, csvRows)
	}
}

func exportErrors(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}

	query := fmt.Sprintf(`
		SELECT
			max(Timestamp) as latest,
			PageTitle as message,
			URL as source,
			count() as occurrences
		FROM %s.events
		WHERE SiteID = ?
		  AND EventType = 'error'
		  AND Timestamp >= ? AND Timestamp <= ?
		GROUP BY message, source
		ORDER BY occurrences DESC
		LIMIT 5000
	`, dbName)

	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] Errors query error: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var results []ExportErrorRow
	for rows.Next() {
		var ts time.Time
		var message, source string
		var count uint64
		if err := rows.Scan(&ts, &message, &source, &count); err != nil {
			continue
		}
		results = append(results, ExportErrorRow{
			Timestamp: ts.Format(time.RFC3339),
			Message:   message,
			Source:    source,
			Count:     count,
		})
	}

	if format == FormatJSON {
		writeJSONExport(w, "errors", results)
	} else {
		headers := []string{"Latest Occurrence", "Error Message", "Source", "Count"}
		var csvRows [][]string
		for _, r := range results {
			csvRows = append(csvRows, []string{r.Timestamp, r.Message, r.Source, strconv.FormatUint(r.Count, 10)})
		}
		writeCSVExport(w, "errors", headers, csvRows)
	}
}

func exportReferrers(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	query := fmt.Sprintf(`
		SELECT Referrer, uniq(ClientIP) as visitors, count() as views
		FROM %s.events
		WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= ? AND Timestamp <= ? AND Referrer != ''
		GROUP BY Referrer ORDER BY visitors DESC LIMIT 5000
	`, dbName)
	exportSimpleMap(w, "referrers", siteID, startTime, endTime, format, query, []string{"Referrer", "Visitors", "Views"})
}

func exportLocations(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	query := fmt.Sprintf(`
		SELECT Country, uniq(ClientIP) as visitors, count() as views
		FROM %s.events
		WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= ? AND Timestamp <= ? AND Country != ''
		GROUP BY Country ORDER BY visitors DESC LIMIT 1000
	`, dbName)
	exportSimpleMap(w, "locations", siteID, startTime, endTime, format, query, []string{"Country", "Visitors", "Views"})
}

func exportDevices(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	query := fmt.Sprintf(`
		SELECT if(ScreenWidth < 768, 'Mobile', if(ScreenWidth < 1024, 'Tablet', 'Desktop')) as Device, uniq(ClientIP) as visitors
		FROM %s.events
		WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= ? AND Timestamp <= ?
		GROUP BY Device ORDER BY visitors DESC
	`, dbName)
	exportSimpleMap(w, "devices", siteID, startTime, endTime, format, query, []string{"Device", "Visitors"})
}

func exportBrowsers(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	query := fmt.Sprintf(`
		SELECT Browser, uniq(ClientIP) as visitors
		FROM %s.events
		WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= ? AND Timestamp <= ? AND Browser != ''
		GROUP BY Browser ORDER BY visitors DESC
	`, dbName)
	exportSimpleMap(w, "browsers", siteID, startTime, endTime, format, query, []string{"Browser", "Visitors"})
}

func exportOS(w http.ResponseWriter, siteID string, startTime, endTime time.Time, format ExportFormat) {
	query := fmt.Sprintf(`
		SELECT OS, uniq(ClientIP) as visitors
		FROM %s.events
		WHERE SiteID = ? AND EventType = 'pageview' AND Timestamp >= ? AND Timestamp <= ? AND OS != ''
		GROUP BY OS ORDER BY visitors DESC
	`, dbName)
	exportSimpleMap(w, "os", siteID, startTime, endTime, format, query, []string{"OS", "Visitors"})
}

func exportSimpleMap(w http.ResponseWriter, name, siteID string, startTime, endTime time.Time, format ExportFormat, query string, headers []string) {
	if chConn == nil {
		writeJSONError(w, http.StatusInternalServerError, "Analytics engine not available")
		return
	}
	ctx, cancel := r_ctx()
	defer cancel()
	rows, err := chConn.Query(ctx, query, siteID, startTime, endTime)
	if err != nil {
		log.Printf("[EXPORT] %s query error: %v", name, err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to query data")
		return
	}
	defer rows.Close()

	var csvRows [][]string
	var jsonResults []map[string]interface{}

	for rows.Next() {
		vals := make([]interface{}, len(headers))
		valPtrs := make([]interface{}, len(headers))
		for i := range vals {
			valPtrs[i] = &vals[i]
		}
		if err := rows.Scan(valPtrs...); err != nil {
			continue
		}

		row := make([]string, len(headers))
		jsonRow := make(map[string]interface{})
		for i, v := range vals {
			str := fmt.Sprintf("%v", v)
			row[i] = str
			jsonRow[headers[i]] = v
		}
		csvRows = append(csvRows, row)
		jsonResults = append(jsonResults, jsonRow)
	}

	if format == FormatJSON {
		writeJSONExport(w, name, jsonResults)
	} else {
		writeCSVExport(w, name, headers, csvRows)
	}
}

// Helper: write CSV response
func writeCSVExport(w http.ResponseWriter, name string, headers []string, rows [][]string) {
	filename := fmt.Sprintf("helm_%s_%s.csv", name, time.Now().Format("2006-01-02"))
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

	writer := csv.NewWriter(w)
	writer.Write(headers)
	for _, row := range rows {
		writer.Write(row)
	}
	writer.Flush()
}

// Helper: write JSON export response
func writeJSONExport(w http.ResponseWriter, name string, data interface{}) {
	filename := fmt.Sprintf("helm_%s_%s.json", name, time.Now().Format("2006-01-02"))
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

	json.NewEncoder(w).Encode(map[string]interface{}{
		"exported_at": time.Now().UTC().Format(time.RFC3339),
		"type":        name,
		"data":        data,
	})
}

// Helper: consistent JSON error response
func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":   true,
		"message": message,
		"status":  statusCode,
	})
}

// Helper: context for read queries
func r_ctx() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 30*time.Second)
}
