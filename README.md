# Real-Time Clickstream Analytics Pipeline

A production-style real-time streaming analytics platform that processes simulated e-commerce clickstream data through **Kafka → PySpark Structured Streaming → PostgreSQL → React Dashboard**.

## Architecture

```
┌──────────────┐    ┌─────────┐    ┌───────────────┐    ┌────────────┐    ┌─────────────┐
│  Data Generator│───▶│  Kafka  │───▶│ PySpark Local │───▶│ PostgreSQL │◀───│ React       │
│  (Python)     │    │         │    │ Streaming     │    │            │    │ Dashboard   │
└──────────────┘    └─────────┘    └───────────────┘    └────────────┘    └─────────────┘
    simulates           broker        windowed aggs       storage           custom UI
    clickstream                       & transformations
```

## Features

- **Real-time data generation**: Simulates 20+ events/sec of ecommerce clickstream data
- **Windowed aggregations**: 1-minute tumbling windows for all metrics
- **Live dashboard**: Auto-refreshing React dashboard with 6 visualization panels
- **Full Docker stack**: 7 services orchestrated with Docker Compose

## Dashboard Panels

| Panel | Description |
|---|---|
| Live Counters | Total events, unique users, total revenue |
| Events Per Minute | Line chart showing event volume by type over time |
| Top Categories | Bar chart of product categories by views and purchases |
| Conversion Funnel | Visual funnel from page view → add to cart → purchase |
| Device Breakdown | Donut chart of desktop vs mobile vs tablet |
| Revenue Over Time | Line chart of revenue per window |
| Recent Events | Scrolling table of the latest raw events |

## Quick Start

```bash
docker compose up -d --build
```

Then open:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001/api/health

## Tech Stack

| Component | Technology |
|---|---|
| Message Broker | Apache Kafka |
| Stream Processing | PySpark Structured Streaming (local mode) |
| Database | PostgreSQL 16 |
| Data Generator | Python (Faker + kafka-python) |
| API | Node.js + Express |
| Frontend | React + TypeScript + Vite |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Containers | Docker Compose |

## Project Structure

```
├── docker-compose.yml          # Orchestrates all 7 services
├── .env                        # Environment variables (not committed)
├── data-generator/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── generator.py            # Fake clickstream event producer
├── spark/
│   ├── Dockerfile
│   └── streaming_job.py        # PySpark Structured Streaming job
├── postgres/
│   └── init.sql                # Database schema (6 tables)
├── dashboard/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js           # Express API (8 endpoints)
│   └── ui/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── App.tsx
│           └── components/      # 7 React chart/table components
└── README.md
```

## Event Schema

```json
{
  "event_id": "uuid",
  "user_id": "user_1234",
  "session_id": "sess_abc123def456",
  "event_type": "page_view|add_to_cart|purchase|search|click|remove_from_cart",
  "product_id": "prod_laptop_456",
  "category": "electronics|clothing|home|sports|books|beauty",
  "page_url": "/products/electronics/laptop",
  "referrer": "google|direct|social|email",
  "device": "desktop|mobile|tablet",
  "browser": "chrome|firefox|safari|edge",
  "price": 99.99,
  "timestamp": "2026-08-16T10:30:00+00:00"
}
```

## Stopping

```bash
docker compose down -v
```
