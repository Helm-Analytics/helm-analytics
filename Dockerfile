# ----------------------------------------------------
# Stage 1 — Build
# ----------------------------------------------------
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Install git (needed for some Go modules)
RUN apk add --no-cache git

# Cache dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy application source
COPY . .

# Install swag CLI
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Generate swagger documentation
RUN /go/bin/swag init

# 🔥 Force linux/amd64 build (NO buildx variables)
RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    go build -ldflags="-s -w" -o helm-backend .


# ----------------------------------------------------
# Stage 2 — Runtime
# ----------------------------------------------------
FROM alpine:latest

# Install certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/helm-backend .

# Copy runtime assets
COPY --from=builder /app/docs ./docs
COPY GeoLite2-Country.mmdb .
COPY GeoLite2-ASN.mmdb .
COPY static ./static

# Expose application port
EXPOSE 6060

# Run application
CMD ["./helm-backend"]