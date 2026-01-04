-- Activity Log Table (PostgreSQL)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'pageview', 'custom_event', 'visitor_new', 'firewall_block'
    activity_data JSONB NOT NULL,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    browser TEXT,
    os TEXT,
    device TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_site_time ON activity_log(site_id, created_at DESC);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_country ON activity_log(country);
