# 🔥 Real-Time Meme Coin Aggregation Service (Axiom Trade Style)

This project is a high-performance backend service designed to aggregate, cache, and deliver real-time meme coin data from decentralized exchange (DEX) APIs, utilizing a modern, scalable architecture built on Node.js and TypeScript.

---

## 🚀 Live Deployment Status

The service is fully deployed across three platforms, demonstrating a robust, horizontally scaled architecture:

| Component         | Platform                    | Status   | URL                                                                                      |
| :---------------- | :-------------------------- | :------- | :--------------------------------------------------------------------------------------- |
| **Frontend UI**   | Vercel                      | **LIVE** | [https://meme-aggregator-plum.vercel.app/](https://meme-aggregator-plum.vercel.app/)     |
| **API & Sockets** | Render (Web Service)        | **LIVE** | [https://meme-aggregator-9sth.onrender.com/](https://meme-aggregator-9sth.onrender.com/) |
| **BullMQ Worker** | Railway (Background Worker) | **LIVE** | *Private worker logs confirm job processing.*                                            |

---

## 🧠 Architecture and Tech Stack

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



1.  **Initial Load:** Client $\rightarrow$ Render API (`/discover`) $\rightarrow$ Redis Cache Check.
2.  **Live Updates:** Cron (on Render) $\rightarrow$ BullMQ Queue (in Redis) $\rightarrow$ **Railway Worker** $\rightarrow$ DexScreener $\rightarrow$ Aggregator $\rightarrow$ Redis Cache & **Pub/Sub Channel**.
3.  **Broadcasting:** Render Socket.io Server subscribes to Redis Pub/Sub $\rightarrow$ Broadcasts deltas to Vercel clients (`discover` room).

---

## 💡 Key Architectural Decisions

### 1. High Availability & Scalability
* **Job Queue (BullMQ):** Heavy, slow API calls are moved to a separate **Railway worker process**. This prevents the main API server from blocking, keeping latency low.
* **Decoupled Deployment:** Deploying the API (Render) and the Worker (Railway) separately ensures true horizontal scaling and prevents the single worker failure from taking down the API layer.
* **Redis Adapter:** Socket.io uses the Redis adapter, allowing multiple API/Socket instances (if scaled) to broadcast updates reliably.

### 2. Data Freshness & Efficiency
* **Caching (Redis):** Merged token lists (for filtering) and individual token data are cached with a configurable TTL (30s default) to minimize external API calls.
* **Rate Limiting (Bottleneck):** DexScreener calls are wrapped in Bottleneck's scheduling mechanism to ensure the rate limit is never exceeded, preventing IP bans.
* **Aggregation:** Data from multiple pools/DEXs are intelligently merged: volume/liquidity is summed, and the price from the highest liquidity pool is selected for accuracy.

### 3. Real-time Optimization
* **Socket.io Rooms:** Clients join specific rooms (`discover`) to receive only necessary updates.
* **Delta Updates:** The system pushes the full, newly merged token object, which the frontend efficiently updates using libraries like **Framer Motion**.

---

## 🛠️ Getting Started (Local Setup)

To run this project locally, you need two separate terminal windows for the API/Cron and the Worker, plus one for the Frontend.

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/thistooshallpasss/meme-aggregator](https://github.com/thistooshallpasss/meme-aggregator)
    cd meme-aggregator
    ```

2.  **Start Redis (Docker):**
    ```bash
    cd backend
    docker-compose up -d redis # Only start the Redis container
    ```
    *Note: Your Redis connection URL in the `.env` file must point to the running Redis instance (e.g., `redis://localhost:6379`).*

3.  **Start Backend Services (Two Terminals):**
    ```bash
    # Terminal 1: API Server, Socket.io, and Cron Scheduler
    cd backend
    npm install
    npm run dev 
    ```

    ```bash
    # Terminal 2: BullMQ Worker (to process fetch jobs)
    cd backend
    npm install
    npm run worker 
    ```

4.  **Start Frontend Demo:**
    ```bash
    cd frontend
    npm install
    # NOTE: You must update frontend/src/hooks/useRealTimeData.ts to point to http://localhost:4000
    npm run dev 
    ```

---

## 🔗 Endpoints & Features

| Method | Endpoint                                                                                                                                                                     | Description                                      |
| :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `GET`  | **[https://meme-aggregator-9sth.onrender.com/api/v1/discover?limit=20&sort=volume_sol](https://meme-aggregator-9sth.onrender.com/api/v1/discover?limit=20&sort=volume_sol)** | Initial data load and real-time list snapshot.   |
| `WS`   | `token_update`                                                                                                                                                               | Live push of updated token data (via Socket.io). |
| `GET`  | **[https://meme-aggregator-9sth.onrender.com/ping](https://meme-aggregator-9sth.onrender.com/ping)**                                                                         | Health check for API and Redis status.           |

**Query Parameters (Filtering & Pagination):**
* `?limit=10`: Page size limit.
* `?sort=volume_sol`: Sorts by metric (`price_sol`, `liquidity_sol`, `volume_sol`).
* `?cursor=...`: Cursor for subsequent pages (Base64 encoded token address).

---

## ✅ Deliverables Checklist

* [x] GitHub repository with clean commits.
* [x] Deployed public URL (Render/Railway).
* [ ] 1-2 min YouTube video demonstration.
* [x] **Unit/Integration Tests (7 tests covering Aggregation & Pagination).**