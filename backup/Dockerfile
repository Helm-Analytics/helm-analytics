FROM alpine:latest

# Install required packages
RUN apk add --no-cache \
    postgresql-client \
    clickhouse-client \
    bash \
    curl \
    dcron \
    aws-cli

# Create backup directory
RUN mkdir -p /backups

# Copy backup script
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Create cron job - runs daily at 2 AM
RUN echo "0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" | crontab -

# Start cron in foreground
CMD ["crond", "-f", "-l", "2"]
