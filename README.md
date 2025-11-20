# 🔥 Real-Time Meme Coin Aggregation Service (Axiom Trade Style)

This project is a high-performance backend service designed to aggregate, cache, and deliver real-time meme coin data from decentralized exchange (DEX) APIs, utilizing a modern, scalable architecture built on Node.js and TypeScript.

---

## 🚀 Architecture and Tech Stack

The system is designed around separation of concerns, asynchronous job processing, and high data freshness.

### Core Stack:
* **Runtime:** Node.js + TypeScript
* [cite_start]**Web Framework:** **Fastify** (For high throughput API) [cite: 300]
* **Caching/Queue Broker:** **Redis** (Used for both volatile cache and BullMQ job management)
* **Job Scheduler:** **BullMQ** (For reliable, retriable background API fetching)
* [cite_start]**Rate Limiter:** **Bottleneck** (To safely adhere to DexScreener's 300 req/min limit) [cite: 360]
* [cite_start]**Real-time:** **Socket.io** (Using Redis adapter for horizontal scaling) [cite: 286, 287]
* **Frontend Demo:** React + Vite + Tailwind CSS + Framer Motion (for smooth live updates)

### Data Flow Diagram



1.  **Initial Load:** Client $\rightarrow$ Fastify API (`/discover`) $\rightarrow$ Redis Cache Check.
2.  **Live Updates:** Cron $\rightarrow$ BullMQ Queue $\rightarrow$ Worker $\rightarrow$ DexScreener $\rightarrow$ Aggregator $\rightarrow$ Redis Cache & **Pub/Sub Channel**.
3.  [cite_start]**Broadcasting:** Socket.io Server subscribes to Redis Pub/Sub $\rightarrow$ Broadcasts deltas to clients (`discover` room). [cite: 292, 293]

---

## 🧠 Key Architectural Decisions

### 1. High Availability & Scalability
* **Job Queue (BullMQ):** Heavy, slow API calls are moved off the main event loop to separate worker processes. This prevents the API server from blocking, keeping latency low.
* [cite_start]**Redis Adapter:** Socket.io uses the Redis adapter, allowing multiple API/Socket instances (horizontal scaling) to broadcast updates reliably. [cite: 286, 287]

### 2. Data Freshness & Efficiency
* [cite_start]**Caching (Redis):** Merged token lists (for filtering) and individual token data are cached with a configurable TTL (30s default) to minimize external API calls. [cite: 341]
* [cite_start]**Rate Limiting (Bottleneck):** DexScreener calls are wrapped in Bottleneck's scheduling mechanism to ensure the rate limit is never exceeded, preventing IP bans. [cite: 360]
* [cite_start]**Aggregation:** Data from multiple pools/DEXs are intelligently merged: volume/liquidity is summed, and the price from the highest liquidity pool is selected for accuracy. [cite: 196, 375, 376]

### 3. Real-time Optimization
* [cite_start]**Socket.io Rooms:** Clients join specific rooms (`discover`) to receive only necessary updates. [cite: 290]
* [cite_start]**Delta Updates:** The system pushes the full, newly merged token object, which the frontend efficiently updates. [cite: 109, 110]

---

## 🌐 Live Deployment Status

The application is split across Vercel and Render/Railway to utilize the strengths of each platform, allowing the worker processes to run reliably outside the web service's constraint.

| Component           | Platform    | URL                                          | Status |
| :------------------ | :---------- | :------------------------------------------- | :----- |
| **Frontend UI**     | **Vercel**  | `https://meme-aggregator-plum.vercel.app/`   | ✅ Live |
| **API & Socket.io** | **Render**  | `https://meme-aggregator-9sth.onrender.com/` | ✅ Live |
| **BullMQ Worker**   | **Railway** | *(Private Service)*                          | ✅ Live |

---

## 🛠️ Getting Started (Local Setup)

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/thistooshallpasss/meme-aggregator](https://github.com/thistooshallpasss/meme-aggregator)
    cd meme-aggregator
    ```

2.  **Start Local Redis:**
    * **NOTE:** This project requires a running **Redis instance** for the BullMQ queue and data cache. You must start Redis locally (e.g., via Docker) or use a cloud provider like Redis Labs/Upstash, and update the `backend/.env` file with the correct `REDIS_URL`.
    * Example using Docker:
        ```bash
        # Ensure you are in the project root
        docker run -d --name meme-redis -p 6379:6379 redis:alpine
        ```
    
3.  **Start Backend Services:**
    * **Note:** We assume the worker code is merged into the API for local testing.
    ```bash
    cd backend
    npm install
    npm run dev  # Starts API Server, Socket.io, Cron Scheduler, AND Worker.
    ```

4.  **Start Frontend Demo:**
    ```bash
    cd ../frontend
    npm install
    npm run dev  # Opens dashboard (connects to http://localhost:4000)
    ```

---

## 🔗 Endpoints & Features

| Method | Endpoint           | Description                                                                    |
| :----- | :----------------- | :----------------------------------------------------------------------------- |
| `GET`  | `/api/v1/discover` | [cite_start]Initial data load and real-time list snapshot. [cite: 304]         |
| `WS`   | `token_update`     | [cite_start]Live push of updated token data (via Socket.io). [cite: 293]       |
| `GET`  | `/ping`            | [cite_start]Health Check: Returns API and Redis connection status. [cite: 305] |

**Query Parameters (Filtering & Pagination):**
* [cite_start]`?limit=10`: Page size limit. [cite: 356]
* [cite_start]`?sort=volume_sol`: Sorts by metric (`price_sol`, `liquidity_sol`, `volume_sol`). [cite: 354]
* [cite_start]`?cursor=...`: Cursor for subsequent pages (Base64 encoded token address). [cite: 316, 356]

---

## ✅ Deliverables Checklist

* [ ] GitHub repository with clean commits.
* [x] Deployed public URL (Vercel, Render, Railway).
* [ ] 1-2 min YouTube video demonstration.
* [x] **Unit/Integration Tests (7 tests covering Aggregation & Pagination).**