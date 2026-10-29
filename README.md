# Ship It Live 🚀

**A DevFusion client rescue story**, told live with a real CI/CD pipeline.
Lahore Bites is a fictional client made for the demo.
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
| `site/` | The website (HTML, CSS, JS, DevFusion logo). `data.json` holds the chapter and today's special |
| `tests/check_site.py` | Quality gate: valid JSON, chapter 1 to 4, sensible special, no leaked secrets |
| `.github/workflows/pipeline.yml` | The pipeline: Test → Build → Deploy |

Open phones poll for a new deploy every 10 seconds, so the page updates on its own.

## One-time setup

1. Create a **public** repo named `ship-it-live` on GitHub.
2. Push this code to `main`.
3. Go to **Settings → Pages → Build and deployment → Source** and pick **GitHub Actions**.
4. Open the **Actions** tab, then wait for the green run. The site is now live.
5. Optional, for the PR demo: **Settings → Branches → Add rule** for `main`, then turn on
   *Require status checks to pass* and pick **Test**.

## Live demo steps: the story

Everything is driven by two lines in `site/data.json`:
```json
"chapter": 1,
"special": "Chicken Karahi 🍲",
```

| Chapter | On every phone | What you do |
|---|---|---|
| **1. The 3am call** | Store crashed, grey, 502 error | Starting state. Tell the story: manual edits on the live server broke it |
| **2. The rescue** | Store back online, pipeline on | Set `"chapter": 2` and the room's vote as `"special"`. Push and show Test → Build → Deploy |
| **3. The Friday test** | "Someone pushes a broken menu..." | Set `"chapter": 3`, push. Then do *Break my pipeline* below |
| **4. Back in business** | Happy ending + DevFusion call to action | Set `"chapter": 4`, push. Close the talk |

### Break my pipeline (during chapter 3)
Pick one:

- **Broken JSON:** delete a closing quote in `data.json`
- **Leaked secret:** add a line with AWS's public example key, `AKIA` followed by `IOSFODNN7EXAMPLE`
- **Bad data:** set `"special"` to an empty string, or `"chapter": 5`

Push it. **Test** turns red ❌, Build and Deploy never run, and **every phone stays on chapter 3.**
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
git checkout story-start -- site/data.json
git commit -m "Reset demo" && git push
```
