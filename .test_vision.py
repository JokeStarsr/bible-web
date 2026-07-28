#!/usr/bin/env python3
"""测试 DeepSeek v4 是否支持 vision（image_url）"""
import subprocess, sys, os, json, base64, hmac, hashlib, time
from PIL import Image, ImageDraw, ImageFont

# 读取 API key
API_KEY = open('/tmp/dsk_key.txt').read().strip()
MODEL = "deepseek-v4-flash"
URL = "https://api.deepseek.com/v1/chat/completions"

# 生成含中文的测试图片（用英文，服务器无中文字体）
font = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf', 36)
img = Image.new('RGB', (800, 300), color='white')
draw = ImageDraw.Draw(img)
draw.text((40, 30), "2026-07-28", fill='black', font=font)
draw.text((40, 90), "John 3:16", fill='blue', font=font)
draw.text((40, 150), "For God so loved the world", fill='black', font=font)
img.save('/tmp/test_vision.png')

with open('/tmp/test_vision.png', 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

payload = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": "识别图片中的文字，返回JSON: {\"date\":\"\",\"text\":\"\"}"},
        {"role": "user", "content": [
            {"type": "text", "text": "识别这张图片"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
        ]}
    ],
    "temperature": 0.3,
    "max_tokens": 1024
}

r = subprocess.run(["curl", "-s", "-w", "\\n%{http_code}", "--max-time", "60",
                    "-X", "POST", URL,
                    "-H", f"Authorization: Bearer {API_KEY}",
                    "-H", "Content-Type: application/json",
                    "-d", json.dumps(payload)],
                   capture_output=True, text=True)
lines = r.stdout.rsplit("\n", 1)
body = lines[0] if len(lines) > 1 else r.stdout
code = lines[-1] if len(lines) > 1 else "?"
print(f"http_code={code}")
try:
    d = json.loads(body)
    if "error" in d:
        print(f"ERROR: {d['error'].get('message','')[:300]}")
    else:
        msg = d.get("choices",[{}])[0].get("message",{}).get("content","")
        print(f"RESPONSE: {msg[:400]}")
except:
    print(f"BODY: {body[:400]}")
