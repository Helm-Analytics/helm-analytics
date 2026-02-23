package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

const (
	baseURL = "http://localhost:6060"
	siteID  = "f2c73d9d-513a-4228-9e4e-e1ce7eb76e15"
)

type Payload struct {
	SiteID      string `json:"siteId"`
	URL         string `json:"url"`
	Referrer    string `json:"referrer"`
	ScreenWidth int    `json:"screenWidth"`
	EventType   string `json:"eventType"`
}

func main() {
	fmt.Println("Starting Local Verification Load Test...")
	fmt.Println("Target: localhost:6060")
	fmt.Println("------------------------------------------------")

	// Scenario 1: Quality User (Valid Visit, ~20s duration)
	// Expected: Increases TotalViews, DailyVisitors, AvgVisitTime. Lowers BounceRate.
	go func() {
		fmt.Println("[User A] Starting: Standard Visit (Will send Heartbeat)")
		simulateUser("User A", true) 
	}()

	// Scenario 2: Bouncing User (No Heartbeat)
	// Expected: Increases TotalViews, DailyVisitors. Increases BounceRate. No AvgVisitTime impact.
	go func() {
		fmt.Println("[User B] Starting: Bouncer (No Heartbeat)")
		simulateUser("User B", false)
	}()

	time.Sleep(30 * time.Second)
	fmt.Println("------------------------------------------------")
	fmt.Println("Test Complete. Check your Dashboard/Logs.")
	fmt.Println("Expected Changes:")
	fmt.Println("1. TotalViews: +2")
	fmt.Println("2. DailyVisitors: +2 (Unique IPs)")
	fmt.Println("3. AvgVisitTime: Should increase (User A contributed ~20s)")
	fmt.Println("------------------------------------------------")
}

func simulateUser(name string, sendHeartbeat bool) {
	client := &http.Client{}
	url := fmt.Sprintf("https://otakudojo.xyz/verify-%d", rand.Intn(100))
	
	// 1. Pageview
	fmt.Printf("[%s] Sending Pageview -> %s\n", name, url)
	sendEvent(client, Payload{
		SiteID:      siteID,
		URL:         url,
		Referrer:    "https://google.com/search",
		ScreenWidth: 1920,
		EventType:   "pageview",
	})

	if sendHeartbeat {
		dur := 20 * time.Second
		fmt.Printf("[%s] Staying for %v...\n", name, dur)
		time.Sleep(dur)
		
		fmt.Printf("[%s] Sending Heartbeat\n", name)
		sendEvent(client, Payload{
			SiteID:      siteID,
			URL:         url,
			Referrer:    "https://google.com/search",
			ScreenWidth: 1920,
			EventType:   "heartbeat",
		})
	}
}

func sendEvent(client *http.Client, p Payload) {
	data, _ := json.Marshal(p)
	req, _ := http.NewRequest("POST", baseURL+"/track", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	
	// Random IP
	ip := fmt.Sprintf("10.1.%d.%d", rand.Intn(255), rand.Intn(255))
	req.Header.Set("X-Forwarded-For", ip)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		fmt.Printf("Error: Server returned %d\n", resp.StatusCode)
	}
}
