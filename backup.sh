#!/bin/bash
# 数据备份脚本：数据库 + 上传文件，保留最近7天
set -e

BACKUP_DIR=/opt/bible-web/backups
TIMESTAMP=$(date +%Y%m%d-%H%M)
WORK_DIR=$(mktemp -d)
ARCHIVE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

# 1. 数据库导出（pg_dump，含建表语句+数据）
docker exec bible-postgres pg_dump -U bible_user -d bible > "$WORK_DIR/database.sql"

# 2. 复制 uploads 上传文件
cp -r /var/lib/docker/volumes/bible-web_uploads/_data "$WORK_DIR/uploads"
cp -r /var/lib/docker/volumes/bible-web_uploads_photos/_data "$WORK_DIR/uploads_photos"

# 3. 打包归档
tar czf "$ARCHIVE" -C "$WORK_DIR" database.sql uploads uploads_photos

# 4. 清理临时目录
rm -rf "$WORK_DIR"

# 5. 保留最近7天（8天前的删除）
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

# 6. 输出结果
echo "[$TIMESTAMP] Backup OK: $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"
ls -lht "$BACKUP_DIR" | head -10
