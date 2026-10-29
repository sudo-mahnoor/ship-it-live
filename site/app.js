// Polls for a new deploy so every phone in the room updates on its own.
const POLL_MS = 10000;

// The story. The presenter only changes "chapter" and "special" in data.json.
const CHAPTERS = {
  1: {
    title: "The 3am call",
    story: "Friday night. Lahore Bites updates its menu by hand, straight on the live server. One typo. The whole store goes down. Orders are lost all weekend.",
    status: ["down", "Down"],
    crashed: true,
  },
  2: {
    title: "The rescue",
    story: "Monday. DevFusion steps in. No more hand edits on the live server. Every change now goes through a pipeline: test, build, deploy.",
    status: ["fixing", "Pipeline on"],
  },
  3: {
    title: "The Friday test",
    story: "4:55pm on Friday. Someone pushes a broken menu. The pipeline catches it before customers ever see it. Watch the big screen.",
    status: ["up", "Online"],
  },
  4: {
    title: "Back in business",
    story: "Changes ship in minutes, not nights. Bad code gets stopped at the door. The team sleeps through the weekend again.",
    status: ["up", "Online"],
    cta: true,
  },
};

let currentDeploy = null;

async function fetchJson(path) {
  // Query string bypasses the GitHub Pages CDN cache
  const res = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function render() {
  const data = await fetchJson("data.json");
  const n = CHAPTERS[data.chapter] ? data.chapter : 1;
  const chapter = CHAPTERS[n];

  document.getElementById("chapter-no").textContent = `Chapter ${n} of 4`;
  document.getElementById("title").textContent = chapter.title;
  document.getElementById("story").textContent = chapter.story;

  const status = document.getElementById("status");
  status.className = `status ${chapter.status[0]}`;
  status.textContent = chapter.status[1];

  document.getElementById("store").classList.toggle("crashed", Boolean(chapter.crashed));
  document.getElementById("store-label").textContent = chapter.crashed ? "Error" : "Today's special";
  document.getElementById("special").textContent = chapter.crashed
    ? "502 Bad Gateway. Menu file broken."
    : data.special;

  document.getElementById("cta").hidden = !chapter.cta;

  document.querySelectorAll("#tracker li").forEach((li, i) => {
    li.className = i + 1 < n ? "done" : i + 1 === n ? "current" : "";
  });
}

async function check() {
  try {
    const version = await fetchJson("version.json");
    if (version.sha === currentDeploy) return;

    const isUpdate = currentDeploy !== null;
    currentDeploy = version.sha;
    await render();

    document.getElementById("deploy").textContent =
      `Deploy #${version.run} · ${version.sha.slice(0, 7)} · ${new Date(version.time).toLocaleTimeString()}`;

    if (isUpdate) {
      document.body.classList.remove("updated");
      void document.body.offsetWidth; // restart the animation
      document.body.classList.add("updated");
    }
  } catch (err) {
    // version.json only exists after a pipeline build; fall back to data.json locally
    if (currentDeploy === null) {
      await render().catch(() => {});
      document.getElementById("deploy").textContent = "Local preview (not deployed)";
    }
  }
}

check();
setInterval(check, POLL_MS);
