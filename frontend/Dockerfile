# Stage 1: Build the React application
FROM cgr.dev/chainguard/node:latest AS build
WORKDIR /app
COPY --chown=nonroot:nonroot package*.json ./
RUN npm install --legacy-peer-deps
COPY --chown=nonroot:nonroot . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM cgr.dev/chainguard/nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]