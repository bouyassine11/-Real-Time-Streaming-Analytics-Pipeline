-- Clickstream Analytics Database Schema

-- Raw events table (recent events for drill-down)
CREATE TABLE IF NOT EXISTS raw_events (
    event_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    product_id VARCHAR(36),
    category VARCHAR(50),
    page_url VARCHAR(500),
    referrer VARCHAR(20),
    device VARCHAR(10),
    price DECIMAL(10, 2),
    timestamp TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregation: Events per minute by event type
CREATE TABLE IF NOT EXISTS agg_events_per_minute (
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_count BIGINT NOT NULL,
    PRIMARY KEY (window_start, event_type)
);

-- Aggregation: Top categories by views and purchases
CREATE TABLE IF NOT EXISTS agg_top_categories (
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    category VARCHAR(50) NOT NULL,
    view_count BIGINT DEFAULT 0,
    purchase_count BIGINT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    PRIMARY KEY (window_start, category)
);

-- Aggregation: Conversion funnel
CREATE TABLE IF NOT EXISTS agg_conversion_funnel (
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    stage VARCHAR(20) NOT NULL,
    user_count BIGINT NOT NULL,
    PRIMARY KEY (window_start, stage)
);

-- Aggregation: Revenue per window
CREATE TABLE IF NOT EXISTS agg_revenue (
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    total_revenue DECIMAL(12, 2) NOT NULL,
    purchase_count BIGINT NOT NULL,
    avg_order_value DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (window_start)
);

-- Aggregation: Device breakdown
CREATE TABLE IF NOT EXISTS agg_device_breakdown (
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    device VARCHAR(10) NOT NULL,
    event_count BIGINT NOT NULL,
    PRIMARY KEY (window_start, device)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_events_timestamp ON raw_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_user ON raw_events(user_id);
CREATE INDEX IF NOT EXISTS idx_agg_events_window ON agg_events_per_minute(window_start DESC);
CREATE INDEX IF NOT EXISTS idx_agg_categories_window ON agg_top_categories(window_start DESC);
CREATE INDEX IF NOT EXISTS idx_agg_funnel_window ON agg_conversion_funnel(window_start DESC);
CREATE INDEX IF NOT EXISTS idx_agg_revenue_window ON agg_revenue(window_start DESC);
CREATE INDEX IF NOT EXISTS idx_agg_device_window ON agg_device_breakdown(window_start DESC);
