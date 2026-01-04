package sentinel

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

var chConn driver.Conn

func InitClickHouse() {
	var err error
	var conn driver.Conn

	for i := 0; i < 5; i++ {
		conn, err = clickhouse.Open(&clickhouse.Options{
			Addr: []string{"clickhouse:9000"},
			Auth: clickhouse.Auth{
				Database: "sentinel",
				Username: "sentinel",
				Password: "password",
			},
			Settings: clickhouse.Settings{
				"max_execution_time": 60,
			},
		})

		if err != nil {
			log.Printf("Error connecting to ClickHouse: %v. Retrying in 3 seconds...", err)
			time.Sleep(3 * time.Second)
			continue
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err = conn.Ping(ctx); err != nil {
			log.Printf("Error pinging ClickHouse: %v. Retrying in 3 seconds...", err)
			time.Sleep(3 * time.Second)
			continue
		}

		chConn = conn
		fmt.Println("Successfully connected to ClickHouse!")
		
		runMigrations(ctx)
		return
	}

	log.Fatalf("Could not connect to ClickHouse after several retries: %v", err)
}

func runMigrations(ctx context.Context) {
	queries := []string{
		"CREATE DATABASE IF NOT EXISTS sentinel",
		
		// Events Table (Retention: 30 Days)
		`CREATE TABLE IF NOT EXISTS sentinel.events (
			Timestamp DateTime,
			SiteID String,
			ClientIP String,
			URL String,
			Referrer String,
			ScreenWidth UInt16,
			Browser String,
			OS String,
			Country String,
			TrustScore UInt8,
			LCP Nullable(Float64),
			CLS Nullable(Float64),
			FID Nullable(Float64)
		) ENGINE = MergeTree()
		ORDER BY (SiteID, Timestamp)
		TTL Timestamp + INTERVAL 30 DAY`,
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS TrustScore UInt8",
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS PageTitle String DEFAULT ''",
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS EventType String DEFAULT 'pageview'",
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS SessionID String DEFAULT ''",
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS EventName String DEFAULT ''",
		"ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS Properties String DEFAULT ''",
		"ALTER TABLE sentinel.events MODIFY TTL Timestamp + INTERVAL 30 DAY",

		// Session Events Table (Retention: 2 Days - Aggressive cleanup)
		`CREATE TABLE IF NOT EXISTS sentinel.session_events (
			Timestamp DateTime,
			SiteID String,
			SessionID String,
			Payload String
		) ENGINE = MergeTree()
		ORDER BY (SiteID, SessionID, Timestamp)
		TTL Timestamp + INTERVAL 2 DAY`,
		"ALTER TABLE sentinel.session_events MODIFY TTL Timestamp + INTERVAL 2 DAY",

		// Clicks/Heatmaps Table (Retention: 7 Days)
		`CREATE TABLE IF NOT EXISTS sentinel.clicks (
			Timestamp DateTime,
			SiteID String,
			ClientIP String,
			URL String,
			X UInt16,
			Y UInt16,
			Selector String,
			Country String
		) ENGINE = MergeTree()
		ORDER BY (SiteID, Timestamp)
		TTL Timestamp + INTERVAL 7 DAY`,
		"ALTER TABLE sentinel.clicks MODIFY TTL Timestamp + INTERVAL 7 DAY",

		// Errors Table (Retention: 7 Days)
		`CREATE TABLE IF NOT EXISTS sentinel.errors (
			Timestamp DateTime,
			SiteID String,
			ClientIP String,
			URL String,
			Message String,
			Source String,
			LineNo UInt32,
			ColNo UInt32,
			ErrorObj String
		) ENGINE = MergeTree()
		ORDER BY (SiteID, Timestamp)
		TTL Timestamp + INTERVAL 7 DAY`,
		"ALTER TABLE sentinel.errors ADD COLUMN IF NOT EXISTS Severity String DEFAULT 'Error'",
		"ALTER TABLE sentinel.errors ADD COLUMN IF NOT EXISTS Mitigation String DEFAULT ''",
		"ALTER TABLE sentinel.errors MODIFY TTL Timestamp + INTERVAL 7 DAY",
	}

	for _, query := range queries {
		if err := chConn.Exec(ctx, query); err != nil {
			log.Printf("Migration warning (query: %s): %v", query, err)
			// We don't fatal here because sometimes ALTERs fail if no change is needed, 
			// or if it's a structural change that needs manual intervention. 
			// But for these specific queries (IF NOT EXISTS / MODIFY TTL), it's usually safe to continue.
		}
	}
	fmt.Println("Database migrations completed.")
}
