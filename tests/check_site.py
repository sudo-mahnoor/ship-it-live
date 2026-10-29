"""Quality gate for the site. The pipeline runs this before every deploy.

Any failed check exits non-zero, which turns the pipeline red and blocks the deploy.
"""
import json
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
MAX_ROCKET_LENGTH = 20
CHAPTERS = (1, 2, 3, 4)
TEXT_SUFFIXES = {".html", ".css", ".js", ".json"}

# Common credential shapes. Real projects use a dedicated scanner (gitleaks, GitHub secret scanning).
SECRET_PATTERNS = {
    "AWS access key": r"AKIA[0-9A-Z]{16}",
    "OpenAI-style API key": r"sk-[A-Za-z0-9_-]{20,}",
    "GitHub token": r"gh[pousr]_[A-Za-z0-9]{36}",
    "Private key": r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
}

failures = []


def check(ok, message):
    print(f"{'PASS' if ok else 'FAIL'}  {message}")
    if not ok:
        failures.append(message)


# 1. Required files exist
for name in ("index.html", "style.css", "app.js", "data.json", "assets/logo.png"):
    check((SITE / name).is_file(), f"{name} exists")

# 2. data.json is valid and the story data is sensible
try:
    data = json.loads((SITE / "data.json").read_text(encoding="utf-8"))
    check(True, "data.json is valid JSON")
    check(type(data.get("chapter")) is int and data.get("chapter") in CHAPTERS, f"chapter is one of {CHAPTERS}")
    rocket = str(data.get("rocket", "")).strip()
    check(bool(rocket), "rocket name is not empty")
    check(len(rocket) <= MAX_ROCKET_LENGTH, f"rocket name is at most {MAX_ROCKET_LENGTH} characters")
except (OSError, json.JSONDecodeError) as err:
    check(False, f"data.json is valid JSON ({err})")

# 3. No secrets in anything we ship
for path in sorted(SITE.rglob("*")):
    if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for label, pattern in SECRET_PATTERNS.items():
        check(not re.search(pattern, text), f"no {label} in {path.name}")

print()
if failures:
    print(f"❌ {len(failures)} check(s) failed. Deploy blocked.")
    sys.exit(1)
print("✅ All checks passed. Safe to deploy.")
