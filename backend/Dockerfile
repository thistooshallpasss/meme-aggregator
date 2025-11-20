# Stage 1: Build Stage (Dependencies install karna)
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app/backend

# Copy package.json and install dependencies
COPY package.json .
# COPY package-lock.json .
RUN npm install

# Copy source code and Build (TS compilation)
COPY . .
RUN npm run build # <--- Ye line zaroori hai production (dist) folder banane ke liye

# Stage 2: Production Setup (Lightweight runtime)
FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Copy only necessary production files
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist 
COPY --from=builder /app/backend/package.json .
# COPY --from=builder /app/backend/.env .

# Expose the port where Fastify will run
EXPOSE 4000

# Set environment variable 
ENV NODE_ENV production

# CMD ko Render service mein define karenge
CMD ["node", "dist/app.js"]