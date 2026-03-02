#!/usr/bin/env python3
"""
update_readme.py
Fetches commit data from GitHub API and updates the README.md STATS section.
Run by GitHub Actions on every push.
"""

import os
import re
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

# ── Config ────────────────────────────────────────────────────────────────────
REPO_OWNER   = os.environ.get("GITHUB_ACTOR", "rushikeshxdev")
REPO_NAME    = "Seratek_Internship"
START_DATE   = datetime(2026, 3, 1, tzinfo=timezone.utc)
END_DATE     = datetime(2026, 8, 28, 23, 59, 59, tzinfo=timezone.utc)
TOTAL_DAYS   = 180
README_PATH  = "README.md"
GH_TOKEN     = os.environ.get("GITHUB_TOKEN", "")

FILLED  = "▓"   # committed
EMPTY   = "░"   # no commit, past
FUTURE  = "·"   # future day
TODAY_C = "◉"   # today marker

# ── Fetch commits ─────────────────────────────────────────────────────────────
def fetch_commit_counts():
    counts = {}
    page = 1
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GH_TOKEN:
        headers["Authorization"] = f"token {GH_TOKEN}"

    while True:
        url = (
            f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits"
            f"?per_page=100&page={page}"
            f"&since={START_DATE.isoformat()}"
            f"&until={END_DATE.isoformat()}"
        )
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            print(f"GitHub API error: {e.code} {e.reason}")
            break

        if not data:
            break

        for commit in data:
            date_str = commit["commit"]["author"]["date"][:10]
            counts[date_str] = counts.get(date_str, 0) + 1

        if len(data) < 100:
            break
        page += 1

    return counts


# ── Build stats ───────────────────────────────────────────────────────────────
def build_stats(counts):
    now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    days_done = len([d for d in counts if counts[d] > 0])
    days_left  = TOTAL_DAYS - days_done
    pct        = round((days_done / TOTAL_DAYS) * 100)
    total_commits = sum(counts.values())

    # Streak
    streak = 0
    d = now
    while True:
        k = d.strftime("%Y-%m-%d")
        if counts.get(k, 0) > 0:
            streak += 1
            d -= timedelta(days=1)
        else:
            break

    return {
        "days_done": days_done,
        "days_left": days_left,
        "pct": pct,
        "total_commits": total_commits,
        "streak": streak,
        "today": now.strftime("%Y-%m-%d"),
    }


# ── Build 180-day bar ─────────────────────────────────────────────────────────
def build_commit_bar(counts, stats):
    now_str = stats["today"]
    cells = []
    for i in range(TOTAL_DAYS):
        d = START_DATE + timedelta(days=i)
        k = d.strftime("%Y-%m-%d")
        if k == now_str:
            cells.append(TODAY_C)
        elif d.date() > datetime.now(timezone.utc).date():
            cells.append(FUTURE)
        elif counts.get(k, 0) > 0:
            cells.append(FILLED)
        else:
            cells.append(EMPTY)

    # Split into 6 rows of 30 (one per month)
    month_labels = ["MAR", "APR", "MAY", "JUN", "JUL", "AUG"]
    lines = []
    for i, label in enumerate(month_labels):
        chunk = "".join(cells[i*30:(i+1)*30])
        lines.append(f"{label}  {chunk}")

    return "\n".join(lines)


# ── Build markdown block ──────────────────────────────────────────────────────
def build_stats_block(counts, stats):
    bar = build_commit_bar(counts, stats)
    streak_label = f"{stats['streak']} day{'s' if stats['streak'] != 1 else ''}"

    return f"""<!-- STATS:START -->
## 📊 Live Progress

| 🗓️ Days Done | ⏳ Days Left | 💻 Total Commits | 🔥 Streak | ✅ Complete |
|:---:|:---:|:---:|:---:|:---:|
| `{stats['days_done']}` | `{stats['days_left']}` | `{stats['total_commits']}` | `{streak_label}` | `{stats['pct']}%` |

### 180-Day Commit Map
```
{bar}
```
> {FILLED} = committed · {EMPTY} = no commit · {TODAY_C} = today · {FUTURE} = future
> *Last updated: {stats['today']}*
<!-- STATS:END -->"""


# ── Update README ─────────────────────────────────────────────────────────────
def update_readme(new_block):
    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"<!-- STATS:START -->.*?<!-- STATS:END -->"
    updated = re.sub(pattern, new_block, content, flags=re.DOTALL)

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(updated)

    print("✅ README.md updated successfully!")


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🔄 Fetching commit data...")
    counts = fetch_commit_counts()
    print(f"   Found commits on {len(counts)} days")

    stats = build_stats(counts)
    print(f"   Days done: {stats['days_done']} | Commits: {stats['total_commits']} | Streak: {stats['streak']}")

    block = build_stats_block(counts, stats)
    update_readme(block)