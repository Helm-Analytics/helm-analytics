# --- Stage 1: Build the React Frontend ---
FROM dhi.io/node:20-alpine3.23 AS frontend-builder
WORKDIR /app
# Note the updated paths, relative to the root context
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build the Go Backend ---
FROM dhi.io/golang:1.24-alpine3.23 AS backend-builder
WORKDIR /app
# Copy module files first
COPY backend/go.mod backend/go.sum ./
RUN go mod download
# Copy the Go source code into its own directory
COPY backend/src/ ./src
# Set the working directory to the source code location
WORKDIR /app/src
# Ensure the docs directory is writeable if needed
RUN mkdir -p docs && chmod -R 777 docs
# This is the corrected build command. It builds the current directory
# and places the output binary in the parent /app directory.
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /app/sentinel .

# --- Stage 3: Create the Final Production Image ---
FROM dhi.io/alpine-base:3.22
WORKDIR /app

# Copy assets from the build stages
COPY --from=frontend-builder /app/dist ./static
COPY --from=backend-builder /app/sentinel .
# We need to copy the GeoIP file from the original build context
COPY backend/GeoLite2-Country.mmdb .

# Make the binary executable
RUN chmod +x ./sentinel

# The ca-certificates package is needed for secure outbound connections
# (Removed apk add as hardened dhi.io images lack a package manager)

EXPOSE 7070
ENTRYPOINT ["./sentinel"]

