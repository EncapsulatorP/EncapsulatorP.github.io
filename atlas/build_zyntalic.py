#!/usr/bin/env python3
"""Attach authentic Zyntalic records to generated HTML reading configurations.

Normal rebuilds reuse the checked-in cache without an engine or network call.
For changed English, use --translate with Zyntalic 0.4.0 installed, or provide
--runner /path/to/the/translator/skill/scripts/run.py. Every input, full target,
sidecar, context tail, warning and actual engine identity stays in the cache.
The readable endpoint is the exact original English, not reverse translation.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import gzip
import importlib.metadata
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "atlas/zyntalic-passages.json.gz"
CONFIG = re.compile(r'(<script\b[^>]*\bid=["\']reader-config["\'][^>]*>)(.*?)(</script>)', re.S)
TAIL = re.compile(r"\s*⟦ctx:[^⟧]*⟧")
METADATA = {
    "engine": "core", "version": "0.4.0", "mirror_rate": 0.8,
    "wheel_sha256": "4389e91e55a97a977df4efc796a6e38706e3c15a323fb9d98dd2a58ef2696f0a",
    "translation_note": "Each passage is an independent request; document-level state resets per passage.",
    "readback_note": "The English endpoint is the preserved original source, not an automatically decoded translation.",
    "display_note": "Context tails are omitted only from the visible surface; full targets, sidecars and returned Unicode remain in this file.",
}


def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def script_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def save_cache(cache):
    # Deterministic compression preserves complete engine sidecars without making
    # every deployment carry a large uncompressed linguistic provenance file.
    payload = json.dumps(cache, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    temporary = CACHE.with_suffix(".tmp")
    temporary.write_bytes(gzip.compress(payload, mtime=0))
    temporary.replace(CACHE)


def translate(english, runner=None):
    if not english.strip() or len(english) > 20000:
        raise ValueError("One passage must contain 1–20,000 characters.")
    if runner:
        command = [sys.executable, str(runner), "invoke"]
        payload = json.dumps({"tool": "translate", "text": english, "engine": "core", "mirror_rate": 0.8}, ensure_ascii=False)
    else:
        if importlib.metadata.version("zyntalic") != "0.4.0":
            raise ValueError("Install the pinned Zyntalic 0.4.0 engine before regenerating translations.")
        command = [sys.executable, "-m", "zyntalic.cli", "translate", "--engine", "core", "--mirror-rate", "0.8", "--format", "json"]
        payload = english
    result = subprocess.run(command, input=payload, text=True, encoding="utf-8", capture_output=True, timeout=150, env=dict(os.environ, PYTHONHASHSEED="0", PYTHONUTF8="1", PYTHONIOENCODING="utf-8"))
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "Zyntalic returned an error; no replacement was fabricated.")
    rows = json.loads(result.stdout)
    if not isinstance(rows, list) or not rows or any(not isinstance(row.get("target"), str) or not row["target"] for row in rows):
        raise ValueError("Invalid engine output.")
    actual = sorted({row.get("engine", "unspecified") for row in rows})
    if actual != ["core"]:
        raise ValueError(f"Requested core; actual engine identities: {actual}")
    target = "\n".join(row["target"] for row in rows)
    return {
        "english": english, "source_sha256": digest(english),
        "zyntalic": TAIL.sub("", target).strip(), "full_target": target,
        "context_tails": TAIL.findall(target), "actual_engines": actual,
        "warnings": [w for row in rows for w in row.get("rule_warnings", [])],
        "rows": rows, "stderr": result.stderr,
    }


def readers():
    result = []
    for path in sorted((ROOT / "atlas").rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        match = CONFIG.search(text)
        if match:
            result.append((path, text, match, json.loads(match[2])))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--translate", action="store_true", help="Generate missing records with the real pinned engine.")
    parser.add_argument("--runner", type=Path, help="Use a supplied translator skill's stdin-only runner.")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    old_cache = CACHE.with_suffix("")
    cache = json.loads(gzip.decompress(CACHE.read_bytes())) if CACHE.exists() else json.loads(old_cache.read_text()) if old_cache.exists() else {"metadata": METADATA, "records": {}}
    if any(cache["metadata"].get(k) != METADATA[k] for k in ("engine", "version", "mirror_rate")):
        raise ValueError("Translation cache provenance mismatch.")
    pages = readers()
    inputs = {}
    for _, _, _, config in pages:
        for passage in config.get("passages", []):
            if passage.get("english", "").strip():
                inputs[digest(passage["english"])] = passage["english"]
    missing = {key: value for key, value in inputs.items() if key not in cache["records"]}
    if missing and not args.translate:
        raise SystemExit(f"{len(missing)} changed passages require authentic translation. Run with --translate and the pinned engine; English HTML remains complete.")
    if missing:
        print(f"Translating {len(missing)} unique passages with Zyntalic core 0.4.0", flush=True)
        with ThreadPoolExecutor(max_workers=max(1, min(6, args.workers))) as pool:
            jobs = {pool.submit(translate, text, args.runner): key for key, text in missing.items()}
            for n, future in enumerate(as_completed(jobs), 1):
                key = jobs[future]
                cache["records"][key] = future.result()
                if n % 20 == 0 or n == len(jobs):
                    save_cache(cache)
                    print(f"Translated {n}/{len(jobs)}", flush=True)
    cache["metadata"] = METADATA
    save_cache(cache)
    total = 0
    for path, text, match, config in pages:
        for passage in config.get("passages", []):
            if not passage.get("english", "").strip():
                continue
            record = cache["records"][digest(passage["english"])]
            if record["english"] != passage["english"]:
                raise ValueError("Source cache mismatch")
            passage["zyntalic"] = record["zyntalic"]
            passage["sourceSha256"] = record["source_sha256"]
            total += 1
        config["translation"] = METADATA
        config["translationRecord"] = "../" * (len(path.relative_to(ROOT).parts) - 1) + "atlas/zyntalic-passages.json.gz"
        path.write_text(text[:match.start(2)] + script_json(config) + text[match.end(2):], encoding="utf-8")
    warnings = sum(len(cache["records"][key]["warnings"]) for key in inputs)
    print(json.dumps({"readers": len(pages), "passages": total, "unique_passages": len(inputs), "warnings": warnings, "engine": "core", "version": "0.4.0"}))


if __name__ == "__main__":
    main()
