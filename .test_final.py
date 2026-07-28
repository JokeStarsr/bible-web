#!/usr/bin/env python3
"""自测：完整 OCR preview 流程，验证 Tesseract 优化后的识别效果"""
import subprocess, sys, os, json, base64, hmac, hashlib, time
from PIL import Image, ImageDraw, ImageFont

USER_ID = "23d07428-5cd0-467e-ae06-bd65e62b884c"
USERNAME = "Super@Joker"
JWT_SECRET = sys.argv[1]
HOST = "http://localhost:8080"

def base64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

# 1. 生成 token
header = {"alg": "HS256", "typ": "JWT"}
now = int(time.time())
payload = {"sub": USER_ID, "username": USERNAME, "iat": now, "exp": now + 7200}
h = base64url(json.dumps(header).encode())
p = base64url(json.dumps(payload).encode())
sig = hmac.new(JWT_SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
token = f"{h}.{p}.{base64url(sig)}"

# 2. 生成模拟灵修图片（多区块排版，测试 psm 3）
font_b = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf', 32)
font_s = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSans.ttf', 22)
img = Image.new('RGB', (750, 900), color='white')
draw = ImageDraw.Draw(img)
# 标题区
draw.text((40, 30), "Daily Devotion", fill='#1a4f8b', font=font_b)
draw.text((40, 75), "2026-07-28", fill='black', font=font_b)
# 经文出处
draw.text((40, 140), "Scripture: Psalm 23:1-3", fill='#8b4513', font=font_s)
# 经文正文
draw.text((40, 180), "The Lord is my shepherd, I lack nothing.", fill='black', font=font_s)
draw.text((40, 210), "He makes me lie down in green pastures,", fill='black', font=font_s)
draw.text((40, 240), "he leads me beside quiet waters,", fill='black', font=font_s)
draw.text((40, 270), "he refreshes my soul.", fill='black', font=font_s)
# 注释
draw.text((40, 330), "Commentary:", fill='#8b4513', font=font_s)
draw.text((40, 365), "God is our shepherd who guides us.", fill='black', font=font_s)
draw.text((40, 395), "He provides rest and refreshment.", fill='black', font=font_s)
img.save('/tmp/test_devotion.png')
print(f"[1] Image: {os.path.getsize('/tmp/test_devotion.png')} bytes")

# 3. 调用 ocr-preview 并计时
start = time.time()
r = subprocess.run(["curl", "-s", "-w", "\\n%{http_code}", "--max-time", "180",
                    "-H", f"Authorization: Bearer {token}",
                    "-F", "file=@/tmp/test_devotion.png;type=image/png",
                    f"{HOST}/api/v1/qt/admin/ocr-preview"],
                   capture_output=True, text=True, timeout=200)
elapsed = time.time() - start
lines = r.stdout.rsplit("\n", 1)
body = lines[0] if len(lines) > 1 else r.stdout
code = lines[-1] if len(lines) > 1 else "?"
print(f"[2] ocr-preview: http_code={code}, elapsed={elapsed:.1f}s")
try:
    d = json.loads(body)
    print(f"    success={d.get('success')}, message={d.get('message')}")
    if d.get('data') and d['data'].get('items'):
        for it in d['data']['items']:
            print(f"    date={it.get('date')}")
            print(f"    title={it.get('title')}")
            print(f"    ref={it.get('scriptureReference')}")
            print(f"    text={it.get('scriptureText','')[:100]}")
            print(f"    commentary={it.get('commentary','')[:80]}")
    else:
        print(f"    body: {body[:500]}")
except:
    print(f"    body: {body[:500]}")
