# ---------- Base Image ----------
FROM node:20-alpine

# ---------- App Directory ----------
WORKDIR /app

# ---------- Copy Package Files ----------
COPY package*.json ./

# ---------- Install Production Dependencies ----------
RUN npm ci --omit=dev

# ---------- Copy Application ----------
COPY . .

# ---------- Create Non-Root User ----------
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

# ---------- Expose Application Port ----------
EXPOSE 3000

# ---------- Health Check ----------
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
CMD wget --quiet --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# ---------- Start Application ----------
CMD ["node", "server.js"]