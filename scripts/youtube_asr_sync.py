#!/usr/bin/env python3
"""Discover YouTube videos, transcribe them on this Mac, and push them to AIHOT."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

INGEST_URL = os.environ.get("AIHOT_INGEST_URL", "").strip()
INGEST_TOKEN = os.environ.get("INGEST_TOKEN", "").strip()
CHANNEL_IDS = [x.strip() for x in os.environ.get("YOUTUBE_CHANNEL_IDS", "").split(",") if x.strip()]
LIMIT = max(1, int(os.environ.get("YOUTUBE_LIMIT", "3")))
MODEL = os.environ.get(
    "ASR_MODEL",
    str(Path.home() / ".cache/modelscope/models/qwen--Qwen3-ASR-0.6B/snapshots/master"),
)
ATOM = "http://www.w3.org/2005/Atom"
YT = "http://www.youtube.com/xml/schemas/2015"


def fetch_feed(channel_id: str) -> list[dict[str, str]]:
    query = urllib.parse.urlencode({"channel_id": channel_id})
    with urllib.request.urlopen(f"https://www.youtube.com/feeds/videos.xml?{query}", timeout=30) as response:
        root = ET.fromstring(response.read())
    items: list[dict[str, str]] = []
    for entry in root.findall(f"{{{ATOM}}}entry")[:LIMIT]:
        video_id = (entry.findtext(f"{{{YT}}}videoId") or "").strip()
        if not video_id:
            continue
        text = lambda name: (entry.findtext(f"{{{ATOM}}}{name}") or "").strip()
        items.append({
            "id": video_id,
            "title": text("title"),
            "publishedAt": text("published"),
            "author": (entry.findtext(f"{{{ATOM}}}author/{{{ATOM}}}name") or "").strip(),
            "url": f"https://www.youtube.com/watch?v={video_id}",
        })
    return items


def transcribe(audio: Path, output: Path) -> str:
    subprocess.run([
        "python3", "-m", "mlx_audio.stt.generate", "--model", MODEL,
        "--audio", str(audio), "--output-path", str(output), "--format", "txt",
        "--language", "auto", "--chunk-duration", "30",
    ], check=True)
    return output.read_text(encoding="utf-8").strip()


def main() -> int:
    if not INGEST_URL or not INGEST_TOKEN or not CHANNEL_IDS:
        raise SystemExit("AIHOT_INGEST_URL, INGEST_TOKEN and YOUTUBE_CHANNEL_IDS are required")
    if shutil.which("yt-dlp") is None:
        raise SystemExit("yt-dlp not found; install with: brew install yt-dlp ffmpeg")
    workdir = Path(os.environ.get("YOUTUBE_WORKDIR", tempfile.mkdtemp(prefix="aihot-youtube-")))
    workdir.mkdir(parents=True, exist_ok=True)
    try:
        for channel_id in CHANNEL_IDS:
            items = []
            for video in fetch_feed(channel_id):
                audio = workdir / f"{video['id']}.m4a"
                transcript = workdir / f"{video['id']}.txt"
                if not audio.exists():
                    subprocess.run(["yt-dlp", "--no-playlist", "-x", "--audio-format", "m4a", "-o", str(audio), video["url"]], check=True)
                text = transcript.read_text(encoding="utf-8").strip() if transcript.exists() else transcribe(audio, transcript)
                if text:
                    items.append({
                        "title": video["title"], "url": video["url"], "publishedAt": video["publishedAt"],
                        "author": video["author"], "language": "zh-or-en", "bodyText": text,
                        "raw": {"youtubeVideoId": video["id"], "channelId": channel_id, "_aihot": {"transcribedBy": "mlx-qwen3-asr"}},
                    })
            if not items:
                continue
            payload = json.dumps({"sourceId": f"youtube-{channel_id.lower()}", "sourceName": f"YouTube · {channel_id}", "items": items}).encode()
            request = urllib.request.Request(INGEST_URL, data=payload, method="POST", headers={"Authorization": f"Bearer {INGEST_TOKEN}", "Content-Type": "application/json"})
            with urllib.request.urlopen(request, timeout=60) as response:
                print(channel_id, response.read().decode())
    finally:
        if "YOUTUBE_WORKDIR" not in os.environ:
            shutil.rmtree(workdir, ignore_errors=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
