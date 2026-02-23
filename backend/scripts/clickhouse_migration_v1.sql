-- Migration V1: Add SessionID to events table
ALTER TABLE sentinel.events ADD COLUMN IF NOT EXISTS SessionID String;
