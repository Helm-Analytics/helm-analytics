package sentinel

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

var chConn driver.Conn
var dbName string

func InitClickHouse() {
	var err error
	var conn driver.Conn


	for i := 0; i < 5; i++ {
		dbName = os.Getenv("CLICKHOUSE_DB")
		if dbName == "" {
			dbName = "sentinel"
		}
		dbUser := os.Getenv("CLICKHOUSE_USER")
		if dbUser == "" {
			dbUser = "sentinel"
		}
		dbPass := os.Getenv("CLICKHOUSE_PASSWORD")
		if dbPass == "" {
			dbPass = "password"
		}
		
		conn, err = clickhouse.Open(&clickhouse.Options{
			Addr: []string{"clickhouse:9000"},
			Auth: clickhouse.Auth{
				Database: dbName,
				Username: dbUser,
				Password: dbPass,
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
	fmt.Printf("Running migrations for database: %s\n", dbName)

	retentionDays := os.Getenv("CLICKHOUSE_RETENTION_DAYS")
	if retentionDays == "" {
		retentionDays = "90" // Default to 90 days if not specified
	}

	queries := []string{
		fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", dbName),
		
		// Events Table (Retention: 30 Days)
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s.events (
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
		TTL Timestamp + INTERVAL %s DAY`, dbName, retentionDays),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS TrustScore UInt8", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS PageTitle String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS EventType String DEFAULT 'pageview'", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS SessionID String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS EventName String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS Properties String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS City String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS Device String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS UtmSource String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS UtmMedium String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS UtmCampaign String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS UtmTerm String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS UtmContent String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events ADD COLUMN IF NOT EXISTS Channel String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.events MODIFY TTL Timestamp + INTERVAL %s DAY", dbName, retentionDays),

		// Session Events Table (Retention: 2 Days - Aggressive cleanup)
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s.session_events (
			Timestamp DateTime,
			SiteID String,
			SessionID String,
			Payload String
		) ENGINE = MergeTree()
		ORDER BY (SiteID, SessionID, Timestamp)
		TTL Timestamp + INTERVAL 2 DAY`, dbName),
		fmt.Sprintf("ALTER TABLE %s.session_events MODIFY TTL Timestamp + INTERVAL 2 DAY", dbName),

		// Clicks/Heatmaps Table (Retention: 7 Days)
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s.clicks (
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
		TTL Timestamp + INTERVAL %s DAY`, dbName, retentionDays),
		fmt.Sprintf("ALTER TABLE %s.clicks MODIFY TTL Timestamp + INTERVAL %s DAY", dbName, retentionDays),

		// Errors Table (Retention: 7 Days)
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s.errors (
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
		TTL Timestamp + INTERVAL %s DAY`, dbName, retentionDays),
		fmt.Sprintf("ALTER TABLE %s.errors ADD COLUMN IF NOT EXISTS Severity String DEFAULT 'Error'", dbName),
		fmt.Sprintf("ALTER TABLE %s.errors ADD COLUMN IF NOT EXISTS Mitigation String DEFAULT ''", dbName),
		fmt.Sprintf("ALTER TABLE %s.errors MODIFY TTL Timestamp + INTERVAL %s DAY", dbName, retentionDays),
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
