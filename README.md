# 🔥 Real-Time Meme Coin Aggregation Service (Axiom Trade Style)

This project is a high-performance backend service designed to aggregate, cache, and deliver real-time meme coin data from decentralized exchange (DEX) APIs, utilizing a modern, scalable architecture built on Node.js and TypeScript.

---

## 🚀 Architecture and Tech Stack

The system is designed around separation of concerns, asynchronous job processing, and high data freshness.

### Core Stack:
* **Runtime:** Node.js + TypeScript
* **Web Framework:** **Fastify** (For high throughput API)
* **Caching/Queue Broker:** **Redis** (Used for both volatile cache and BullMQ job management)
* **Job Scheduler:** **BullMQ** (For reliable, retriable background API fetching)
* **Rate Limiter:** **Bottleneck** (To safely adhere to DexScreener's 300 req/min limit)
* **Real-time:** **Socket.io** (Using Redis adapter for horizontal scaling)
* **Frontend Demo:** React + Vite + Tailwind CSS + Framer Motion (for smooth live updates)

### Data Flow Diagram



1.  **Initial Load:** Client $\rightarrow$ Fastify API (`/discover`) $\rightarrow$ Redis Cache Check.
2.  **Live Updates:** Cron $\rightarrow$ BullMQ Queue $\rightarrow$ Worker $\rightarrow$ DexScreener $\rightarrow$ Aggregator $\rightarrow$ Redis Cache & **Pub/Sub Channel**.
3.  **Broadcasting:** Socket.io Server subscribes to Redis Pub/Sub $\rightarrow$ Broadcasts deltas to clients (`discover` room).

---

## 🧠 Key Architectural Decisions

### 1. High Availability & Scalability
* **Job Queue (BullMQ):** Heavy, slow API calls are moved off the main event loop to separate worker processes. This prevents the API server from blocking, keeping latency low.
* **Redis Adapter:** Socket.io uses the Redis adapter, allowing multiple API/Socket instances (horizontal scaling) to broadcast updates reliably.

### 2. Data Freshness & Efficiency
* **Caching (Redis):** Merged token lists (for filtering) and individual token data are cached with a configurable TTL (30s default) to minimize external API calls.
* **Rate Limiting (Bottleneck):** DexScreener calls are wrapped in Bottleneck's scheduling mechanism to ensure the rate limit is never exceeded, preventing IP bans.
* **Aggregation:** Data from multiple pools/DEXs are intelligently merged: volume/liquidity is summed, and the price from the highest liquidity pool is selected for accuracy.

### 3. Real-time Optimization
* **Socket.io Rooms:** Clients join specific rooms (`discover`) to receive only necessary updates.
* **Delta Updates:** The system pushes the full, newly merged token object, which the frontend efficiently updates.

---

## 🛠️ Getting Started (Local Setup)

1.  **Clone Repository:**
    ```bash
    git clone [Your GitHub URL]
    cd meme-aggregator
    ```

2.  **Start Redis (Docker):**
    ```bash
    cd backend
    docker-compose up -d
    ```

3.  **Start Backend Services:**
    ```bash
    npm install
    npm run dev    # Starts API Server, Socket.io, and Cron Scheduler
    npm run worker # Starts BullMQ Worker to process fetch jobs
    ```

4.  **Start Frontend Demo:**
    ```bash
    cd ../frontend
    npm install
    npm run dev    # Opens dashboard, connects to Socket.io
    ```

---

## 🔗 Endpoints & Features

| Method | Endpoint           | Description                                      |
| :----- | :----------------- | :----------------------------------------------- |
| `GET`  | `/api/v1/discover` | Initial data load and real-time list snapshot.   |
| `WS`   | `token_update`     | Live push of updated token data (via Socket.io). |

**Query Parameters (Filtering & Pagination):**
* `?limit=10`: Page size limit.
* `?sort=volume_sol`: Sorts by metric (`price_sol`, `liquidity_sol`, `volume_sol`).
* `?cursor=...`: Cursor for subsequent pages (Base64 encoded token address).

---

## ✅ Deliverables Checklist

* [ ] GitHub repository with clean commits.
* [ ] Deployed public URL (Render/Railway).
* [ ] 1-2 min YouTube video demonstration.
* [x] **Unit/Integration Tests (7 tests covering Aggregation & Pagination).**