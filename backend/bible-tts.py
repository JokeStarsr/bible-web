#!/usr/bin/env python3
"""Bible TTS - 使用 Microsoft Edge TTS 生成希伯来语/希腊语母语发音"""
import sys
import asyncio
import edge_tts

VOICES = {
    "he": "he-IL-AvriNeural",    # 希伯来语男声
    "el": "el-GR-AthinaNeural",  # 希腊语女声
}


async def main():
    if len(sys.argv) < 3:
        print("Usage: bible-tts.py <lang> <text>", file=sys.stderr)
        sys.exit(1)

    lang = sys.argv[1]
    text = sys.argv[2]
    voice = VOICES.get(lang, "en-US-AriaNeural")

    communicate = edge_tts.Communicate(text, voice, rate="-10%")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            sys.stdout.buffer.write(chunk["data"])
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    asyncio.run(main())