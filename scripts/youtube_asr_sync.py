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
CHANNELS_FILE = Path(os.environ.get("YOUTUBE_CHANNELS_FILE", str(Path(__file__).with_name("youtube_business_channels.json"))))
LIMIT = max(1, int(os.environ.get("YOUTUBE_LIMIT", "3")))
MAX_TOTAL = max(0, int(os.environ.get("YOUTUBE_MAX_TOTAL", "0")))
DRY_RUN = os.environ.get("YOUTUBE_DRY_RUN", "false").lower() == "true"
STRICT = os.environ.get("YOUTUBE_STRICT", "false").lower() == "true"
MODEL = os.environ.get(
    "ASR_MODEL",
    str(Path.home() / ".cache/modelscope/models/qwen--Qwen3-ASR-0.6B/snapshots/master"),
)
ATOM = "http://www.w3.org/2005/Atom"
YT = "http://www.youtube.com/xml/schemas/2015"


def fetch_feed(channel_id: str) -> tuple[str, list[dict[str, str]]]:
    query = urllib.parse.urlencode({"channel_id": channel_id})
    with urllib.request.urlopen(f"https://www.youtube.com/feeds/videos.xml?{query}", timeout=30) as response:
        root = ET.fromstring(response.read())
    channel_name = (root.findtext(f"{{{ATOM}}}title") or channel_id).strip()
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
    return channel_name, items


def load_channels() -> list[dict[str, object]]:
    """Load curated channels, while retaining the old comma-separated env fallback."""
    if CHANNELS_FILE.exists():
        channels = json.loads(CHANNELS_FILE.read_text(encoding="utf-8"))
        if not isinstance(channels, list):
            raise SystemExit(f"{CHANNELS_FILE} must contain a JSON array")
        return [c for c in channels if isinstance(c, dict) and c.get("enabled", True)]
    return [{"id": channel_id, "slug": channel_id.lower(), "name": channel_id} for channel_id in CHANNEL_IDS]


def transcript_text(path: Path) -> str | None:
    for candidate in (path, Path(f"{path}.txt")):
        if candidate.exists():
            text = candidate.read_text(encoding="utf-8").strip()
            if text:
                return text
    return None


def transcribe(audio: Path, output: Path) -> str:
    subprocess.run([
        "python3", "-m", "mlx_audio.stt.generate", "--model", MODEL,
        "--audio", str(audio), "--output-path", str(output), "--format", "txt",
        "--language", "auto", "--chunk-duration", "30",
    ], check=True)
    # mlx_audio appends the format suffix even when output-path already has it
    # (for example, ``episode.txt`` becomes ``episode.txt.txt``).
    candidates = (output, Path(f"{output}.txt"))
    for candidate in candidates:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8").strip()
    raise FileNotFoundError(f"ASR output not found: {', '.join(map(str, candidates))}")


def main() -> int:
    channels = load_channels()
    if not channels:
        raise SystemExit(f"no channels configured; set YOUTUBE_CHANNELS_FILE or YOUTUBE_CHANNEL_IDS (missing {CHANNELS_FILE})")
    if not DRY_RUN and (not INGEST_URL or not INGEST_TOKEN):
        raise SystemExit("AIHOT_INGEST_URL and INGEST_TOKEN are required unless YOUTUBE_DRY_RUN=true")
    if shutil.which("yt-dlp") is None:
        raise SystemExit("yt-dlp not found; install with: brew install yt-dlp ffmpeg")
    workdir = Path(os.environ.get("YOUTUBE_WORKDIR", tempfile.mkdtemp(prefix="aihot-youtube-")))
    workdir.mkdir(parents=True, exist_ok=True)
    try:
        total = 0
        for channel in channels:
            channel_id = str(channel.get("id", "")).strip()
            if not channel_id:
                continue
            slug = str(channel.get("slug") or channel_id.lower()).strip()
            configured_name = str(channel.get("name") or channel_id).strip()
            try:
                feed_name, videos = fetch_feed(channel_id)
            except Exception as error:
                print(f"{channel_id} feed failed: {error}")
                if STRICT:
                    raise
                continue
            print(f"{configured_name} ({channel_id}): {len(videos)} candidate(s)")
            if DRY_RUN:
                continue
            items = []
            for video in videos:
                if MAX_TOTAL and total >= MAX_TOTAL:
                    break
                audio = workdir / f"{video['id']}.m4a"
                transcript = workdir / f"{video['id']}.txt"
                if not audio.exists():
                    subprocess.run(["yt-dlp", "--no-playlist", "-x", "--audio-format", "m4a", "-o", str(audio), video["url"]], check=True)
                text = transcript_text(transcript) or transcribe(audio, transcript)
                if text:
                    items.append({
                        "title": video["title"], "url": video["url"], "publishedAt": video["publishedAt"],
                        "author": video["author"], "language": "zh-or-en", "bodyText": text,
                        "raw": {"youtubeVideoId": video["id"], "channelId": channel_id, "channelName": feed_name or configured_name, "_aihot": {"transcribedBy": "mlx-qwen3-asr"}},
                    })
                    total += 1
            if not items:
                continue
            payload = json.dumps({"sourceId": f"youtube-{slug}", "sourceName": f"YouTube · {configured_name}", "items": items}).encode()
            request = urllib.request.Request(INGEST_URL, data=payload, method="POST", headers={"Authorization": f"Bearer {INGEST_TOKEN}", "Content-Type": "application/json"})
            with urllib.request.urlopen(request, timeout=60) as response:
                print(f"{configured_name}: {response.read().decode()}")
    finally:
        if "YOUTUBE_WORKDIR" not in os.environ:
            shutil.rmtree(workdir, ignore_errors=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
