# Clickstream Analytics Pipeline

Real-time streaming platform: **Kafka → PySpark → PostgreSQL → React**

```
Data Generator → Kafka → PySpark Streaming → PostgreSQL ← React Dashboard
  (Python)      broker     windowed aggs       storage       live UI
```

## Quick Start

```bash
docker compose up -d --build
```

- **Dashboard** — http://localhost:3000
- **API** — http://localhost:3001/api/health

## Stack

| Layer | Tech |
|---|---|
| Ingestion | Apache Kafka |
| Processing | PySpark Structured Streaming (local mode) |
| Storage | PostgreSQL 16 |
| Generator | Python, Faker, kafka-python |
| API | Node.js, Express |
| Frontend | React, TypeScript, Vite, Recharts, Tailwind CSS |
| Infra | Docker Compose (7 services) |

## Dashboard

Live-updating panels with dark/light mode:

| Panel | Type |
|---|---|
| Events Per Minute | Multi-line chart |
| Top Categories | Grouped bar chart |
| Conversion Funnel | Gradient funnel bars |
| Device Breakdown | Donut chart |
| Revenue Over Time | Area chart |
| Recent Events | Scrollable table with badges |

## Project Structure

```
├── docker-compose.yml
├── .env                    # not committed
├── data-generator/         # fake clickstream producer
├── spark/                  # PySpark streaming job
├── postgres/               # schema (6 tables)
└── dashboard/
    ├── api/                # Express REST API
    └── ui/                 # React dashboard
```

## Teardown

```bash
docker compose down -v
```
