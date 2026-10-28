# Ship It Live 🚀

A tiny website with a real CI/CD pipeline, built for a live talk.
Every push to `main` is **tested → built → deployed** to GitHub Pages automatically.

**Live site:** https://sudo-mahnoor.github.io/ship-it-live/

```
push ──► Test ──► Build ──► Deploy ──► 📱 every phone updates
           │
           └── fails? ❌ deploy blocked, live site stays safe
```

## What's inside

| Path | What it is |
|---|---|
| `site/` | The website (HTML, CSS, JS). `data.json` holds the text shown on screen |
| `tests/check_site.py` | Quality gate: valid JSON, sensible vote, no leaked secrets |
| `.github/workflows/pipeline.yml` | The pipeline: Test → Build → Deploy |

Open phones poll for a new deploy every 10 seconds, so the page updates on its own.

## One-time setup

1. Create a **public** repo named `ship-it-live` on GitHub.
2. Push this code to `main`.
3. Go to **Settings → Pages → Build and deployment → Source** and pick **GitHub Actions**.
4. Open the **Actions** tab, then wait for the green run. The site is now live.
5. Optional, for the PR demo: **Settings → Branches → Add rule** for `main`, then turn on
   *Require status checks to pass* and pick **Test**.

## Live demo steps

### 1. Ship a change (audience vote)
Edit `site/data.json` and change `"vote"` to the word the room picked:
```json
"vote": "Biryani 🍛",
```
Commit and push to `main`. Show the Actions tab: Test → Build → Deploy. About a minute later, every phone updates.

### 2. Break my pipeline
Pick one:

- **Broken JSON:** delete a closing quote in `data.json`
- **Leaked secret:** add a line with AWS's public example key, `AKIA` followed by `IOSFODNN7EXAMPLE`
- **Bad data:** set `"vote"` to an empty string, or one longer than 30 characters

Push it. **Test** turns red ❌, Build and Deploy never run, and **the live site stays on the last good version.**
Then fix it, push again, and it goes green ✅.

### 3. Pull request flow (optional)
Make the change on a branch and open a PR. The pipeline runs **Test only**, with no deploy.
With branch protection on, GitHub blocks the merge until Test passes.

## Run the checks locally
```bash
python3 tests/check_site.py
```

## Reset after rehearsal
```bash
git checkout demo-start -- site/data.json
git commit -m "Reset demo" && git push
```
