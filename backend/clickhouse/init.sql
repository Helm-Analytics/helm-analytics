CREATE DATABASE IF NOT EXISTS sentinel;

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
ORDER BY (SiteID, Timestamp);

ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS TrustScore UInt8;

CREATE TABLE IF NOT EXISTS sentinel.session_events (
    Timestamp DateTime,
    SiteID String,
    SessionID String,
    Payload String
) ENGINE = MergeTree()
ORDER BY (SiteID, SessionID, Timestamp);

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
ORDER BY (SiteID, Timestamp);

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
ORDER BY (SiteID, Timestamp);