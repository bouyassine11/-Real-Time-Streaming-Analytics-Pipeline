const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "clickstream",
  user: process.env.POSTGRES_USER || "clickstream_user",
  password: process.env.POSTGRES_PASSWORD || "clickstream_pass",
  max: 10,
  idleTimeoutMillis: 30000,
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Events per minute by event type
app.get("/api/events-per-minute", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT window_start, window_end, event_type, event_count
      FROM agg_events_per_minute
      WHERE window_start > NOW() - INTERVAL '30 minutes'
      ORDER BY window_start DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top categories
app.get("/api/top-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, SUM(view_count) as view_count,
             SUM(purchase_count) as purchase_count,
             SUM(total_revenue) as total_revenue
      FROM agg_top_categories
      WHERE window_start > NOW() - INTERVAL '30 minutes'
      GROUP BY category
      ORDER BY view_count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Conversion funnel
app.get("/api/conversion-funnel", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT stage, SUM(user_count) as user_count
      FROM agg_conversion_funnel
      WHERE window_start > NOW() - INTERVAL '30 minutes'
      GROUP BY stage
      ORDER BY CASE stage
        WHEN 'page_view' THEN 1
        WHEN 'add_to_cart' THEN 2
        WHEN 'purchase' THEN 3
      END
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revenue
app.get("/api/revenue", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT window_start, total_revenue, purchase_count, avg_order_value
      FROM agg_revenue
      WHERE window_start > NOW() - INTERVAL '30 minutes'
      ORDER BY window_start DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Device breakdown
app.get("/api/device-breakdown", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT device, SUM(event_count) as event_count
      FROM agg_device_breakdown
      WHERE window_start > NOW() - INTERVAL '30 minutes'
      GROUP BY device
      ORDER BY event_count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent events
app.get("/api/recent-events", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT event_id, user_id, event_type, product_id, category,
             page_url, referrer, device, price, timestamp
      FROM raw_events
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats summary
app.get("/api/stats", async (req, res) => {
  try {
    const events = await pool.query("SELECT COUNT(*) as total_events FROM raw_events");
    const users = await pool.query("SELECT COUNT(DISTINCT user_id) as total_users FROM raw_events");
    const revenue = await pool.query("SELECT COALESCE(SUM(total_revenue), 0) as total_revenue FROM agg_revenue");

    res.json({
      total_events: parseInt(events.rows[0].total_events),
      total_users: parseInt(users.rows[0].total_users),
      total_revenue: parseFloat(revenue.rows[0].total_revenue),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`Dashboard API running on port ${PORT}`));
