#!/bin/bash
# Helm Analytics Automated Backup Script
# Runs daily backups of PostgreSQL and ClickHouse to S3-compatible storage

set -e

BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups"
RETENTION_DAYS=30

echo "==========================================="
echo "Helm Analytics Backup - $BACKUP_DATE"
echo "==========================================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# 1. Backup PostgreSQL
echo "Backing up PostgreSQL..."
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h $POSTGRES_HOST \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    --format=custom \
    --compress=9 \
    > $BACKUP_DIR/postgres_$BACKUP_DATE.dump

if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL backup completed: $(du -h $BACKUP_DIR/postgres_$BACKUP_DATE.dump | cut -f1)"
else
    echo "✗ PostgreSQL backup failed!"
    exit 1
fi

# 2. Backup ClickHouse
echo "Backing up ClickHouse..."
clickhouse-client \
    --host=$CLICKHOUSE_HOST \
    --user=$CLICKHOUSE_USER \
    --password=$CLICKHOUSE_PASSWORD \
    --query="BACKUP DATABASE sentinel TO Disk('backups', 'clickhouse_$BACKUP_DATE')"

if [ $? -eq 0 ]; then
    echo "✓ ClickHouse backup completed"
else
    echo "✗ ClickHouse backup failed!"
    exit 1
fi

# 3. Upload to S3 (optional - if S3 credentials are provided)
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo "Uploading to S3 bucket: $S3_BUCKET"
    
    # Install AWS CLI if not present
    if ! command -v aws &> /dev/null; then
        apk add --no-cache aws-cli
    fi
    
    # Upload PostgreSQL backup
    aws s3 cp $BACKUP_DIR/postgres_$BACKUP_DATE.dump \
        s3://$S3_BUCKET/helm-analytics/postgres/postgres_$BACKUP_DATE.dump
    
    # Upload ClickHouse backup
    tar -czf $BACKUP_DIR/clickhouse_$BACKUP_DATE.tar.gz -C $BACKUP_DIR clickhouse_$BACKUP_DATE
    aws s3 cp $BACKUP_DIR/clickhouse_$BACKUP_DATE.tar.gz \
        s3://$S3_BUCKET/helm-analytics/clickhouse/clickhouse_$BACKUP_DATE.tar.gz
    
    echo "✓ Backups synced to S3"
fi

# 4. Cleanup old local backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "postgres_*.dump" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "clickhouse_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "==========================================="
echo "Backup completed successfully!"
echo "==========================================="
