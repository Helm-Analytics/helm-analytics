CREATE DATABASE IF NOT EXISTS sentinel;

-- 1. Raw Events: Keep for 30 days for detailed filtering, then delete.
-- (These are relatively small compared to session replays)
CREATE TABLE IF NOT EXISTS sentinel.events (
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
TTL Timestamp + INTERVAL 30 DAY;

ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS TrustScore UInt8;
ALTER TABLE sentinel.events MODIFY TTL Timestamp + INTERVAL 30 DAY;

-- 2. Daily Snapshots: Keep FOREVER (tiny size).
-- This aggregates raw events into daily totals so we don't lose history 
-- even when raw events are deleted.
CREATE TABLE IF NOT EXISTS sentinel.daily_stats (
    Date Date,
    SiteID String,
    TotalViews UInt64,
    UniqueVisitors AggregateFunction(uniq, String),
    AvgDuration AggregateFunction(avg, UInt64)
) ENGINE = SummingMergeTree()
ORDER BY (SiteID, Date);

CREATE MATERIALIZED VIEW IF NOT EXISTS sentinel.mv_daily_stats TO sentinel.daily_stats AS
SELECT
    toDate(Timestamp) as Date,
    SiteID,
    count() as TotalViews,
    uniqState(ClientIP) as UniqueVisitors,
    avgState(15) as AvgDuration -- Placeholder for duration approx
FROM sentinel.events
GROUP BY SiteID, Date;


-- 3. Session Replays: Keep only 2 DAYS.
-- These are MASSIVE (JSON text). 95% of storage usage is here.
-- Debugging usually happens immediately.
CREATE TABLE IF NOT EXISTS sentinel.session_events (
    Timestamp DateTime,
    SiteID String,
    SessionID String,
    Payload String
) ENGINE = MergeTree()
ORDER BY (SiteID, SessionID, Timestamp)
TTL Timestamp + INTERVAL 2 DAY;

ALTER TABLE sentinel.session_events MODIFY TTL Timestamp + INTERVAL 2 DAY;

-- 4. Heatmap Clicks: Keep 7 DAYS.
-- Heatmaps are usually generated from recent data.
CREATE TABLE IF NOT EXISTS sentinel.clicks (
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
TTL Timestamp + INTERVAL 7 DAY;

ALTER TABLE sentinel.clicks MODIFY TTL Timestamp + INTERVAL 7 DAY;

-- 5. Errors: Keep 7 DAYS.
CREATE TABLE IF NOT EXISTS sentinel.errors (
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
TTL Timestamp + INTERVAL 7 DAY;

ALTER TABLE sentinel.errors MODIFY TTL Timestamp + INTERVAL 7 DAY;