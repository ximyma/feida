# ── 构建阶段 ──
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ 

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:server && npm run build:client
RUN npm prune --omit=dev

# ── 运行阶段 ──
FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/data
ENV SERVER_PORT=3000
EXPOSE 3000
VOLUME ["/app/data"]

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server/standalone.js"]
