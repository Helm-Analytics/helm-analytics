package sentinel

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

type InsightsResponse struct {
	Insights       []string `json:"insights"`
	Recommendation string   `json:"recommendation"`
}

func callGemini(prompt string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error: %s", string(bodyBytes))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no candidates returned")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}

func GetInsightsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	// Fetch stats for context
	stats, err := calculateStats(siteID, 30)
	if err != nil {
		log.Printf("Error calculating stats for AI: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	statsJson, _ := json.Marshal(stats)
	
	prompt := fmt.Sprintf(`
		You are an expert web analyst. Analyze the following 30-day website traffic data (JSON):
		%s

		Provide a response in strictly valid JSON format with this schema:
		{
			"insights": ["insight 1", "insight 2", "insight 3"],
			"recommendation": "one actionable recommendation"
		}
		
		Focus on:
		1. Unusual spikes or drops.
		2. High bounce rates on specific pages/devices.
		3. Traffic quality issues (bots).
		4. Conversion opportunities.

		Do not include markdown formatting like "'''json". Just return the raw JSON string.
	`, string(statsJson))

	responseText, err := callGemini(prompt)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		http.Error(w, "AI Service Unavailable", http.StatusServiceUnavailable)
		return
	}

	// Clean up markdown code blocks if present (just in case)
	if len(responseText) > 7 && responseText[:3] == "```" {
		// Find first { and last }
		first := 0
		last := len(responseText)
		for i, c := range responseText {
			if c == '{' {
				first = i
				break
			}
		}
		for i := len(responseText) - 1; i >= 0; i-- {
			if responseText[i] == '}' {
				last = i + 1
				break
			}
		}
		if first < last {
			responseText = responseText[first:last]
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(responseText))
}

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	var chatReq ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&chatReq); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	stats, err := calculateStats(siteID, 30)
	if err != nil {
		log.Printf("Error fetching stats for chat: %v", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	statsJson, _ := json.Marshal(stats)

	prompt := fmt.Sprintf(`
		You are Sentinel, a helpful and professional web analytics assistant. 

		PRODUCT KNOWLEDGE BASE & SETUP GUIDE:
		1. Getting Started: To track a site, click '+' in the sidebar, add domain, copy the generated script, and paste it into the <head> of the website. Deploy to go live.
		2. Metrics: 'Unique Visits' are sessions (cookieless hash). 'Views' are page loads. 'Bounce Rate' is percentage of single-page visits. 'Duration' is time on site (heartbeat every 15s).
		3. Security: 'Shield Mode' blocks bad bots/data centers. 'Spider Trap' is a hidden link (/track/trap) that bans bots found clicking it.
		4. AI Intelligence: Analyze trends every 10 mins. Cached for 15 mins.
		5. Middleware: Server-side tracking (Python/Node) coming soon to bypass ad-blockers.

		You see the live traffic data below (JSON):
		%s

		User Question: "%s"

		Answer the user's question clearly and concisely based on the traffic data OR the knowledge base above. 
		If the question is unrelated to website analytics, performance, or security (e.g. cooking recipes), politely decline.
		Do not use JSON in your response, just natural language.
	`, string(statsJson), chatReq.Message)

	replyText, err := callGemini(prompt)
	if err != nil {
		log.Printf("Gemini Chat error: %v", err)
		http.Error(w, "AI Service Unavailable", http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ChatResponse{Reply: replyText})
}

// AnalyzeError uses Gemini to synthesize a debugging guide for a specific error.
func AnalyzeError(ctx context.Context, errMsg, source string) (string, error) {
	prompt := fmt.Sprintf(`As Helm Intelligence, analyze this frontend error and provide a concise, expert debugging guide:
Error: %s
Source: %s

Please provide your response in HTML format (using only <b>, <i>, <ul>, <li> tags) with these sections:
1. **Root Cause**: What likely triggered this?
2. **Impact**: How does this affect the user?
3. **Fix**: Step-by-step resolution steps.`, errMsg, source)

	reply, err := callGemini(prompt)
	if err != nil {
		return "", err
	}

	return reply, nil
}
// AnalyzeErrorHandler handles requests for on-demand error resolution strategies.
func AnalyzeErrorHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Message string `json:"message"`
		Source  string `json:"source"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	mitigation, err := AnalyzeError(r.Context(), req.Message, req.Source)
	if err != nil {
		log.Printf("Error analyzing issue: %v", err)
		http.Error(w, "Helm Intelligence unavailable", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"mitigation": mitigation})
}

type FirewallSuggestion struct {
	IP         string `json:"ip"`
	Reason     string `json:"reason"`
	Confidence string `json:"confidence"` // High, Medium, Low
	Country    string `json:"country"`
}

func GetFirewallSuggestionsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	// 1. Get existing IP blocks to avoid duplicates
	rows, err := db.Query("SELECT value FROM firewall_rules WHERE site_id = $1 AND rule_type = 'ip'", siteID)
	if err != nil {
		log.Printf("Error fetching firewall rules: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	blockedIPs := make(map[string]bool)
	for rows.Next() {
		var ip string
		if err := rows.Scan(&ip); err == nil {
			blockedIPs[ip] = true
		}
	}

	// 2. Query ClickHouse for suspicious traffic (Low Trust, High Volume)
	// We look for IPs with TrustScore < 60 in last 24h
	ctx := context.Background()
	query := `
		SELECT ClientIP, any(Country) as country, avg(TrustScore) as avg_trust, count() as requests
		FROM sentinel.events
		WHERE SiteID = ? AND Timestamp >= now() - INTERVAL 24 HOUR AND TrustScore < 80
		GROUP BY ClientIP
		HAVING requests > 5
		ORDER BY avg_trust ASC, requests DESC
		LIMIT 10
	`
	
	chRows, err := chConn.Query(ctx, query, siteID)
	if err != nil {
		log.Printf("Error querying suggestions: %v", err)
		http.Error(w, "Analytics error", http.StatusInternalServerError)
		return
	}
	defer chRows.Close()

	var suggestions []FirewallSuggestion

	for chRows.Next() {
		var ip, country string
		var avgTrust float64
		var requests uint64
		if err := chRows.Scan(&ip, &country, &avgTrust, &requests); err != nil {
			continue
		}

		if blockedIPs[ip] {
			continue
		}

		reason := "Suspicious Behavior"
		confidence := "Low"

		if avgTrust < 20 {
			reason = "Known Botnet / Data Center"
			confidence = "High"
		} else if avgTrust < 50 {
			reason = "Likely Automated Traffic"
			confidence = "Medium"
		} else {
			reason = fmt.Sprintf("Abnormal Request Volume (%d reqs)", requests)
		}

		suggestions = append(suggestions, FirewallSuggestion{
			IP:         ip,
			Reason:     reason,
			Confidence: confidence,
			Country:    country,
		})

		if len(suggestions) >= 5 {
			break
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suggestions)
}
