# Globally define predefined build args so BuildKit passes them to all stages
ARG TARGETOS
ARG TARGETARCH

# --- Stage 1: Build the React Frontend ---
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build the Go Backend ---
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend-builder
ARG TARGETOS
ARG TARGETARCH
WORKDIR /app

# Copy module files and download dependencies
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy Go source code
COPY backend/src/ ./src
WORKDIR /app/src

# Build binary as helm-analytics for the target platform
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
    go build -v -o /app/helm-analytics .

# --- Stage 3: Final Production Image ---
FROM alpine:latest
WORKDIR /app

# Copy frontend assets
COPY --from=frontend-builder /app/dist ./static

# Copy backend binary
COPY --from=backend-builder /app/helm-analytics ./

# Copy GeoIP files
COPY backend/GeoLite2-Country.mmdb ./
COPY backend/GeoLite2-ASN.mmdb ./

# Make binary executable
RUN chmod +x ./helm-analytics

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

EXPOSE 7070
ENTRYPOINT ["./helm-analytics"]