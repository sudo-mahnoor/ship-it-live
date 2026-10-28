// Polls for a new deploy so every phone in the room updates on its own.
const POLL_MS = 10000;
let currentDeploy = null;

async function fetchJson(path) {
  // Query string bypasses the GitHub Pages CDN cache
  const res = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function render() {
  const data = await fetchJson("data.json");
  document.getElementById("message").textContent = data.message;
  document.getElementById("vote").textContent = data.vote;
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
