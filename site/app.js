// Rocket to the Cloud: a live CI/CD story.
// The presenter only changes "chapter" and "rocket" in data.json and pushes.
// Every open phone polls for the new deploy and plays the next chapter.
// Plain ES5 on purpose, so it runs on old phones too.
(function () {
  var POLL_MS = 10000;
  var TYPE_MS = 32;
  var HOLD_MS = 1500;

  var TITLES = {
    1: "Manual launch",
    2: "The pipeline",
    3: "The Friday bug",
    4: "Liftoff"
  };

  var currentDeploy = null;
  var rocketName = "";
  var timers = [];

  function $(id) { return document.getElementById(id); }

  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function stopAll() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function getJson(path, cb) {
    var xhr = new XMLHttpRequest();
    // Query string bypasses the GitHub Pages CDN cache
    xhr.open("GET", path + "?t=" + Date.now());
    xhr.onload = function () {
      if (xhr.status !== 200) return cb(new Error(path + ": " + xhr.status));
      try { cb(null, JSON.parse(xhr.responseText)); } catch (err) { cb(err); }
    };
    xhr.onerror = function () { cb(new Error(path + ": network error")); };
    xhr.send();
  }

  // Restart a CSS animation class on an element
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // ---------- Fusion's speech bubble ----------

  function say(text, done) {
    var out = $("bubble-text");
    // Split by code point so emoji never show half drawn
    var chars = text.replace("{rocket}", rocketName).match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || [];
    var i = 0;
    out.textContent = "";
    replay($("bubble"), "pop");
    (function type() {
      if (i < chars.length) {
        out.textContent += chars[i++];
        later(TYPE_MS, type);
      } else {
        later(HOLD_MS, done);
      }
    })();
  }

  // Runs steps one after another: {say: "..."} or {run: fn, wait: ms}
  function play(steps, i) {
    i = i || 0;
    if (i >= steps.length) return;
    var step = steps[i];
    var next = function () { play(steps, i + 1); };
    if (step.say) {
      say(step.say, next);
    } else {
      step.run();
      later(step.wait || 0, next);
    }
  }

  // ---------- Scene helpers ----------

  function pipeline(test, build, deploy) {
    $("chip-test").className = "chip " + test;
    $("chip-build").className = "chip " + build;
    $("chip-deploy").className = "chip " + deploy;
  }

  function rocket(cls) { $("rocket").className = "rocket" + (cls ? " " + cls : ""); }

  function explode() {
    var boom = $("boom");
    var colors = ["#fbbf24", "#f97316", "#f87171", "#c08cff", "#ffffff"];
    var html = '<div class="fireball"></div>';
    for (var i = 0; i < 24; i++) {
      var angle = (Math.PI * 2 * i) / 24;
      var dist = 14 + Math.random() * 20;
      html += '<span class="bit" style="background:' + colors[i % colors.length] +
        ";--dx:" + (Math.cos(angle) * dist).toFixed(1) + "vh" +
        ";--dy:" + (Math.sin(angle) * dist).toFixed(1) + 'vh"></span>';
    }
    boom.innerHTML = html;
  }

  function confetti() {
    var colors = ["#c08cff", "#a535ff", "#ffffff", "#4ade80", "#fbbf24"];
    var html = "";
    for (var i = 0; i < 70; i++) {
      html += '<i style="left:' + (Math.random() * 100).toFixed(1) + "%" +
        ";background:" + colors[i % colors.length] +
        ";animation-duration:" + (2.5 + Math.random() * 2.5).toFixed(2) + "s" +
        ";animation-delay:" + (Math.random() * 1.5).toFixed(2) + 's"></i>';
    }
    $("confetti").innerHTML = html;
  }

  function count(n) {
    var el = $("countdown");
    el.textContent = n;
    replay(el, "tick");
  }

  function show(id, on) { $(id).classList.toggle("show", on); }

  function reset(n) {
    stopAll();
    document.body.className = "ch-" + n;
    rocket("");
    pipeline("off", "off", "off");
    $("boom").innerHTML = "";
    $("confetti").innerHTML = "";
    $("bug").className = "bug";
    $("shield").className = "shield";
    $("countdown").className = "countdown";
    show("alert", false);
    show("finale", false);
    $("plate").textContent = n === 1 ? "Untested rocket" : rocketName;
    $("finale-name").textContent = rocketName;
    $("chapter-pill").textContent = "Chapter " + n + " · " + TITLES[n];

    $("banner").textContent = "Chapter " + n + ": " + TITLES[n];
    show("banner", true);
    later(2600, function () { show("banner", false); });
  }

  // ---------- The four chapters ----------

  var CHAPTERS = {
    1: [
      { say: "Hi! I'm Fusion, mission control. 👋" },
      { say: "Tonight's rocket was built and launched by hand. No tests. No checks." },
      { run: function () { rocket("shake"); }, wait: 1600 },
      { run: function () { rocket("exploded"); explode(); }, wait: 900 },
      { run: function () { show("alert", true); }, wait: 600 },
      { say: "BOOM. 💥 One small typo and the rocket is gone." },
      { say: "There has to be a better way to launch..." }
    ],
    2: [
      { say: "Good news! We built a CI/CD pipeline. 🛠️" },
      { run: function () { pipeline("run", "off", "off"); }, wait: 1200 },
      { run: function () { pipeline("ok", "run", "off"); }, wait: 1200 },
      { run: function () { pipeline("ok", "ok", "run"); }, wait: 1200 },
      { run: function () { pipeline("ok", "ok", "ok"); }, wait: 500 },
      { say: "Every change is now tested, built and deployed. Automatically." },
      { say: "Meet our new rocket: {rocket}! 🚀" },
      { say: "It's on the pad. Next stop: the cloud. ☁️" }
    ],
    3: [
      { run: function () { pipeline("ok", "ok", "ok"); }, wait: 400 },
      { say: "Friday. 4:55pm. 😅" },
      { say: "Someone just pushed broken code. Here comes the bug..." },
      { run: function () { pipeline("run", "off", "off"); $("bug").className = "bug crawl"; }, wait: 2700 },
      { run: function () { pipeline("fail", "off", "off"); replay($("shield"), "hit"); $("bug").className = "bug bounce"; }, wait: 1400 },
      { say: "Blocked! 🛡️ The test failed, so nothing launched. The rocket is safe." },
      { say: "Now let's try it for real. Watch the big screen! 👀" }
    ],
    4: [
      { run: function () { pipeline("ok", "ok", "ok"); }, wait: 300 },
      { say: "All checks passed. Ready for launch! 🚀" },
      { run: function () { count(3); rocket("ignite"); }, wait: 1000 },
      { run: function () { count(2); }, wait: 1000 },
      { run: function () { count(1); }, wait: 1000 },
      { run: function () { rocket("ignite launch"); }, wait: 2600 },
      { run: function () { confetti(); show("finale", true); }, wait: 800 },
      { say: "Welcome to the cloud, {rocket}! ☁️" },
      { say: "Code to cloud. Safely. That's CI/CD. 💜" }
    ]
  };

  function start(data) {
    var n = CHAPTERS[data.chapter] ? data.chapter : 1;
    rocketName = data.rocket || "Our rocket";
    reset(n);
    later(700, function () { play(CHAPTERS[n]); });
  }

  // ---------- Live updates ----------

  function load(label) {
    getJson("data.json", function (err, data) {
      if (err) return;
      start(data);
      if (label) $("deploy").textContent = label;
    });
  }

  function check() {
    getJson("version.json", function (err, version) {
      if (err) {
        // version.json only exists after a pipeline build
        if (currentDeploy === null) {
          currentDeploy = "local";
          load("Local preview (not deployed)");
        }
        return;
      }
      if (version.sha === currentDeploy) return;
      currentDeploy = version.sha;
      load("Deploy #" + version.run + " · " + version.sha.slice(0, 7) + " · " +
        new Date(version.time).toLocaleTimeString());
    });
  }

  // Tap Fusion to replay the current chapter
  $("crew").onclick = function () { currentDeploy = null; check(); };

  check();
  setInterval(check, POLL_MS);
})();
