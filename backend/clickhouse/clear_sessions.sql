-- Clear all session recordings
-- Run this to remove old broken sessions before testing the fix

TRUNCATE TABLE sentinel.session_events;
