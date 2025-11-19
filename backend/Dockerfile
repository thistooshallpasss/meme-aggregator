# Stage 1: Build Stage (Dependencies install karna)
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app/backend

# Copy package.json and install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copy source code
COPY . .
RUN npm run build # Production deploy ke liye code compile karna zaroori hai

# Stage 2: Production Setup (Lightweight runtime)
FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Copy installed dependencies and built code from builder stage
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/src ./src

# ✅ FIX APPLIED: --from=builder use kiya
COPY --from=builder /app/backend/package.json .
COPY --from=builder /app/backend/tsconfig.json .
COPY --from=builder /app/backend/.env .

# Expose the port where Fastify will run
EXPOSE 4000

# Set environment variable (This is crucial for deployment platforms)
ENV NODE_ENV production

# Default command (npm start -> node dist/app.js)
CMD ["npm", "run", "start"]