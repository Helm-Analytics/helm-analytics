# Helm Analytics Automated Backup

Automated daily backups for PostgreSQL and ClickHouse databases with optional S3 sync.

## Features

- ✅ Daily automated backups at 2 AM
- ✅ PostgreSQL full database backup (compressed)
- ✅ ClickHouse full database backup
- ✅ Optional S3/MinIO sync for off-site storage
- ✅ Automatic cleanup of old backups (30 days retention)
- ✅ Email/webhook notifications on failure (optional)

## Quick Start

### 1. Start Backup Service

```bash
# Deploy with main services
docker-compose -f docker-compose.yml -f docker-compose.backup.yml up -d

# Or deploy backup service only
cd backup
docker-compose up -d
```

### 2. Manual Backup (Test)

```bash
# Run backup manually
docker exec helm-analytics-backup /usr/local/bin/backup.sh

# Check backup logs
docker logs helm-analytics-backup

# List backups
docker exec helm-analytics-backup ls -lh /backups
```

### 3. Restore from Backup

**PostgreSQL:**
```bash
# Copy backup from container
docker cp helm-analytics-backup:/backups/postgres_2026-01-08_02-00-00.dump ./

# Restore
PGPASSWORD=password pg_restore \
    -h localhost \
    -U sentinel \
    -d sentinel \
    --clean \
    --if-exists \
    postgres_2026-01-08_02-00-00.dump
```

**ClickHouse:**
```bash
# Restore ClickHouse
clickhouse-client --query="RESTORE DATABASE sentinel FROM Disk('backups', 'clickhouse_2026-01-08_02-00-00')"
```

## S3 Configuration

To enable cloud backups to S3/Wasabi/MinIO:

1. Edit `docker-compose.backup.yml`
2. Uncomment and configure S3 environment variables:

```yaml
- S3_BUCKET=helm-analytics-backups
- AWS_ACCESS_KEY_ID=your-key
- AWS_SECRET_ACCESS_KEY=your-secret
- AWS_DEFAULT_REGION=us-east-1
```

3. For MinIO/Wasabi, add endpoint:
```yaml
- AWS_ENDPOINT_URL=https://s3.wasabisys.com
```

## Backup Schedule

- **Default**: Daily at 2:00 AM UTC
- **Retention**: 30 days (configurable)

To change schedule, edit `backup/Dockerfile`:
```dockerfile
# Change from daily at 2 AM to every 6 hours:
RUN echo "0 */6 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" | crontab -
```

## Monitoring

### Check Backup Status
```bash
# View logs
docker logs -f helm-analytics-backup

# Check last backup
docker exec helm-analytics-backup ls -lt /backups | head -5

# Backup sizes
docker exec helm-analytics-backup du -sh /backups/*
```

### Email Notifications (Optional)

Add to `backup.sh` before final echo:
```bash
# Send email on success
echo "Backup completed at $BACKUP_DATE" | \
    mail -s "Helm Analytics Backup Success" admin@yourdomain.com
```

## Dokploy Deployment

In Dokploy:
1. Create a new **Docker Compose** service
2. Upload `docker-compose.backup.yml`
3. Set environment variables in Dokploy UI
4. Mount persistent volume for `/backups`
5. Deploy and verify logs

## Troubleshooting

**Backups not running:**
```bash
# Check if cron is running
docker exec helm-analytics-backup ps aux | grep cron

# Check cron logs
docker exec helm-analytics-backup cat /var/log/backup.log
```

**PostgreSQL connection failed:**
- Verify `POSTGRES_HOST` matches your database service name
- Check network connectivity
- Confirm credentials

**S3 upload failed:**
- Verify AWS credentials
- Check bucket permissions
- Test with AWS CLI manually

## Best Practices

1. **Test restores monthly** - Backups are useless if you can't restore
2. **Monitor disk space** - Set up alerts at 80% usage
3. **3-2-1 Rule**: 3 copies, 2 different media, 1 off-site (use S3)
4. **Encrypt backups** - Add GPG encryption for sensitive data
5. **Verify backup integrity** - Check file sizes and test restores

## Storage Estimates

- **PostgreSQL**: 10-50 MB per backup (compressed)
- **ClickHouse**: 100 MB - 10 GB depending on retention and events
- **30-day retention**: ~5-50 GB total storage needed

## Support

For issues, check: https://github.com/Helm-Analytics/sentinel-mvp/issues
