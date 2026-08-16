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
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API server on port ${PORT}`));
