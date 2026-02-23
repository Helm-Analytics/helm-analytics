#!/bin/sh
# Generate runtime configuration from environment variables

cat > /usr/share/nginx/html/config.js << EOF
window.HELM_CONFIG = {
  API_URL: "${API_URL:-}"
};
EOF

# Start nginx
exec nginx -g "daemon off;"
