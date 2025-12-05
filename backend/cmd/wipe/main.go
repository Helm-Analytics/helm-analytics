package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ClickHouse/clickhouse-go/v2"
)

func main() {
	fmt.Println("WARNING: This will wipe ALL analytics data from ClickHouse.")
	fmt.Println("Connecting to ClickHouse...")

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{"127.0.0.1:9000"}, // Force IPv4
		Auth: clickhouse.Auth{
			Database: "sentinel",
			Username: "sentinel",
			Password: "password",
		},
	})
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	if err := conn.Ping(context.Background()); err != nil {
		// Try internal docker network hostname if localhost fails (though 'go run' runs on host)
		log.Printf("Failed to ping localhost:9000: %v. \nIf you are running this inside docker, this script might need updating.", err)
		log.Fatal(err)
	}

	tables := []string{
		"sentinel.events",
		"sentinel.session_events",
		"sentinel.clicks",
		"sentinel.errors",
	}

	for _, table := range tables {
		fmt.Printf("Truncating %s... ", table)
		err := conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", table))
		if err != nil {
			fmt.Printf("FAILED: %v\n", err)
		} else {
			fmt.Println("OK")
		}
	}

	fmt.Println("------------------------------------------------")
	fmt.Println("Database Wipe Complete. All analytics history is gone.")
	fmt.Println("------------------------------------------------")
}
