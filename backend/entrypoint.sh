#!/bin/sh
set -e

# ==================== 清理 Flyway 失败迁移记录 ====================
# V20 迁移脚本曾因 SQL 截断导致失败，留下 success=false 记录，
# 会使 Flyway 拒绝启动。这里在 Java 启动前自动清理这些失败记录。
#
# 从 DB_URL 解析数据库连接信息
# 格式: jdbc:postgresql://host:port/dbname
DB_URL_PARSED="${DB_URL:-jdbc:postgresql://postgres:5432/bible}"
DB_HOST=$(echo "$DB_URL_PARSED" | sed -n 's|.*//\([^:]*\).*|\1|p')
DB_PORT=$(echo "$DB_URL_PARSED" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL_PARSED" | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "[entrypoint] Cleaning failed Flyway migrations from ${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-bible}..."

# 删除失败的迁移记录，避免后端启动失败
PGPASSWORD="${DB_PASS:-bible_pass}" \
  psql -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER:-bible_user}" -d "${DB_NAME:-bible}" \
  -c "DELETE FROM flyway_schema_history WHERE success = false;" \
  2>/dev/null && echo "[entrypoint] Failed migrations cleaned." \
  || echo "[entrypoint] Could not clean (DB not ready or no failed records), continuing..."

# ==================== 启动 Spring Boot ====================
exec java -jar app.jar
