# Globally define build args
ARG TARGETOS
ARG TARGETARCH

# --- Stage 1: Build the React Frontend ---
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build the Go Backend for Linux ---
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend-builder
ARG TARGETOS
ARG TARGETARCH
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/src/ ./src
WORKDIR /app/src
# Build a Linux binary regardless of host platform
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -o /app/helm-analytics .

# --- Stage 3: Create the Final Production Image ---
FROM alpine:latest
WORKDIR /app
COPY --from=frontend-builder /app/dist ./static
COPY --from=backend-builder /app/helm-analytics ./
COPY backend/GeoLite2-Country.mmdb ./

RUN chmod +x ./helm-analytics
RUN apk --no-cache add ca-certificates

EXPOSE 7070
ENTRYPOINT ["./helm-analytics"]