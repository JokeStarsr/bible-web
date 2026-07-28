#!/bin/bash
cd /opt/bible-web
echo "BUILD_START=$(date +%s)"
docker compose up -d --build 2>&1
echo "BUILD_END=$(date +%s) rc=$?"
docker compose ps
