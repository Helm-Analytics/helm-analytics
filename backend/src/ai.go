package sentinel

import (
	"bytes"
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
		You have access to the following website traffic data for the last 30 days (JSON):
		%s

		User Question: "%s"

		Answer the user's question clearly and concisely based ONLY on the data provided. 
		If the answer cannot be found in the data, state that you don't have that information.
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
