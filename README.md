# Ship It Live 🚀

**Rocket to the Cloud**: a live CI/CD story told by Fusion, DevFusion's mission control robot.
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
| `site/` | The website (HTML, CSS, JS, DevFusion logo). `data.json` holds the chapter and the rocket's name |
| `tests/check_site.py` | Quality gate: valid JSON, chapter 1 to 4, sensible rocket name, no leaked secrets |
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
"rocket": "Codrithm One"
```
Edit them on GitHub (pencil icon), commit to `main`, and every phone plays the next chapter.
Tap the robot to replay the current chapter.

| Chapter | On every phone | What you do |
|---|---|---|
| **1. Manual launch** | Rocket launched by hand, shakes and explodes. "MANUAL LAUNCH FAILED" | Starting state |
| **2. The pipeline** | TEST, BUILD, DEPLOY light up green. New rocket with the room's name | Set `"chapter": 2` and the room's name as `"rocket"`. Push |
| **3. The Friday bug** | A bug crawls in, TEST blocks it, rocket stays safe | Set `"chapter": 3`, push. Then do *Break my pipeline* below |
| **4. Liftoff** | Countdown 3, 2, 1, liftoff, confetti, "Welcome to the cloud" + DevFusion | Set `"chapter": 4`, push. Close the talk |

### Break my pipeline (during chapter 3)
Pick one:

- **Broken JSON:** delete a closing quote in `data.json`
- **Leaked secret:** add a line with AWS's public example key, `AKIA` followed by `IOSFODNN7EXAMPLE`
- **Bad data:** set `"rocket"` to an empty string, or `"chapter": 5`

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
git checkout rocket-start -- site/data.json
git commit -m "Reset demo" && git push
```

## Slides
- **Present:** https://sudo-mahnoor.github.io/ship-it-live/slides/ (arrow keys, space or a clicker)
- **PDF backup:** `site/slides/From-Code-to-Cloud-Mahnoor-Saeed.pdf`
- **Rebuild the PDF** after editing `site/slides/index.html` (serve `site/` locally first, e.g. `python3 -m http.server 8766`):
  ```bash
  wkhtmltopdf --page-width 338.67mm --page-height 190.5mm -T 0 -B 0 -L 0 -R 0 --dpi 96 \
    --javascript-delay 2500 --background "http://127.0.0.1:8766/slides/index.html?print" \
    site/slides/From-Code-to-Cloud-Mahnoor-Saeed.pdf
  ```
