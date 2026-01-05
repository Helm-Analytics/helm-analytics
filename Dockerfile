# --- Stage 1: Build the React Frontend ---
FROM cgr.dev/chainguard/node:latest AS frontend-builder
WORKDIR /app
# Note the updated paths, relative to the root context
COPY --chown=nonroot:nonroot frontend/package*.json ./
RUN npm ci
COPY --chown=nonroot:nonroot frontend/ ./
RUN npm run build

# --- Stage 2: Build the Go Backend ---
FROM cgr.dev/chainguard/go:latest AS backend-builder
WORKDIR /app
# Copy module files first
COPY --chown=nonroot:nonroot backend/go.mod backend/go.sum ./
RUN go mod download
# Copy the Go source code into its own directory
COPY --chown=nonroot:nonroot backend/src/ ./src
# Set the working directory to the source code location
# Set the working directory to the source code location
WORKDIR /app/src
# This is the corrected build command. It builds the current directory
# and places the output binary in the parent /app directory.
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /app/sentinel .

# --- Stage 3: Create the Final Production Image ---
FROM cgr.dev/chainguard/static:latest
WORKDIR /app

# Copy assets from the build stages
COPY --from=frontend-builder /app/dist ./static
COPY --from=backend-builder /app/sentinel .
# We need to copy the GeoIP file from the original build context
COPY backend/GeoLite2-Country.mmdb .

# Make the binary executable
RUN chmod +x ./sentinel

# (Removed apk add as hardened images are minimal and often lack package managers)

EXPOSE 7070
ENTRYPOINT ["./sentinel"]

