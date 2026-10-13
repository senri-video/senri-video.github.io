(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
   * Hero: a space–time cube (after Hägerstrand's time geography).
   * The floor is a schematic map, the height is time, and the camera’s path is
   * one line rising through it; a pause is a vertical stroke.
   * Event → Space drops a plumb line from a moment down to the map.
   * Space → Event raises a curtain from a stretch of map up through time.
   * The two questions come from two different videos, so each has its
   * own scene. Maps and timing are schematic: the questions give neither
   * coordinates nor clock times.
   * ------------------------------------------------------------------ */
  const svg = document.getElementById("cube");
  const W = 430, D = 150, H = 320, CX = 320, CY = 430;
  const riverL = (y) => 0.05 + 0.014 * Math.sin(y * 7);

  const scenes = {
    es: {
      video: "one video",
      kind: "Event → Space · relation reasoning",
      q: "“When I sat down to rest for the first time, was I closer to the nearest river or closer to the subway station?”",
      a: "Answer: closer to the river.",
      gloss: "Here a moment is projected down onto the map.",
      keys: [[0.24, 0.04, 0], [0.27, 0.34, 0.12], [0.27, 0.34, 0.30], [0.46, 0.50, 0.44], [0.66, 0.60, 0.60], [0.84, 0.78, 0.84], [0.88, 0.84, 0.88], [0.88, 0.84, 1]],
      pauses: [[1, 2, "hot"], [6, 7, ""]],
      map: "river",
    },
    se: {
      video: "another video",
      kind: "Space → Event · trajectory event retrieval",
      q: "“After walking to the end along the canal side and then turning around to walk back along the opposite side, what did I encounter?”",
      a: "Answer: I stopped and observed a reptile experience center.",
      gloss: "Here a route is raised up through time.",
      keys: [[0.10, 0.36, 0], [0.80, 0.36, 0.34], [0.84, 0.50, 0.38], [0.80, 0.64, 0.42], [0.46, 0.64, 0.58], [0.46, 0.64, 0.68], [0.14, 0.64, 0.88], [0.08, 0.78, 1]],
      pauses: [[4, 5, "hot"]],
      route: [2, 6],           // key indices of the return leg along the opposite bank
      map: "canal",
    },
  };

  let theta = -0.6, sway = 0, mode = "es";
  const proj = (x, y, t) => {
    const dx = x - 0.5, dy = y - 0.5, c = Math.cos(theta + sway), s = Math.sin(theta + sway);
    return [CX + (dx * c - dy * s) * W, CY + (dx * s + dy * c) * D - t * H];
  };
  const pts = (arr) => arr.map((p) => proj(...p).map((v) => v.toFixed(1)).join(",")).join(" ");
  const poly = (arr, cls) => `<polyline class="${cls}" points="${pts(arr)}"/>`;
  const gon = (arr, cls) => `<polygon class="${cls}" points="${pts(arr)}"/>`;
  const txt = (x, y, t, s, cls, dx = 0, dy = 0, anchor = "middle") => {
    const [px, py] = proj(x, y, t);
    return `<text class="${cls}" x="${(px + dx).toFixed(1)}" y="${(py + dy).toFixed(1)}" text-anchor="${anchor}">${s}</text>`;
  };
  const sample = (keys, from = 0, to = keys.length - 1) => {
    const out = [];
    for (let i = from; i < to; i++) {
      const [a, b] = [keys[i], keys[i + 1]];
      for (let k = 0; k < 12; k++) { const u = k / 12; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); }
    }
    out.push(keys[to]);
    return out;
  };

  function mapRiver(sc) {
    let s = "";
    const ys = Array.from({ length: 21 }, (_, i) => i / 20);
    const left = ys.map((y) => [riverL(y), y, 0]), right = ys.map((y) => [riverL(y) + 0.06, y, 0]);
    s += gon([...left, ...right.slice().reverse()], "cb-water") + poly(left, "cb-map") + poly(right, "cb-map");
    s += gon([[0.245, 0.33, 0], [0.295, 0.33, 0], [0.295, 0.35, 0], [0.245, 0.35, 0]], "cb-map");
    s += gon([[0.85, 0.82, 0], [0.93, 0.82, 0], [0.93, 0.9, 0], [0.85, 0.9, 0]], "cb-map");
    for (let k = 1; k < 4; k++) s += poly([[0.85 + 0.02 * k, 0.82, 0], [0.85 + 0.02 * k, 0.9, 0]], "cb-map");
    s += txt(riverL(0.9) + 0.03, 0.9, 0, "river", "cb-label", 0, 18);
    s += txt(0.27, 0.34, 0, "bench", "cb-label", 0, 20);
    s += txt(0.89, 0.9, 0, "subway", "cb-label", 0, 22);
    return s;
  }
  function mapCanal() {
    let s = "";
    s += gon([[0.06, 0.45, 0], [0.9, 0.45, 0], [0.9, 0.55, 0], [0.06, 0.55, 0]], "cb-water");
    s += poly([[0.06, 0.45, 0], [0.9, 0.45, 0]], "cb-map") + poly([[0.06, 0.55, 0], [0.9, 0.55, 0]], "cb-map");
    s += gon([[0.82, 0.43, 0], [0.86, 0.43, 0], [0.86, 0.57, 0], [0.82, 0.57, 0]], "cb-map");   // footbridge
    s += gon([[0.40, 0.70, 0], [0.52, 0.70, 0], [0.52, 0.78, 0], [0.40, 0.78, 0]], "cb-map");   // the reptile center
    s += txt(0.3, 0.5, 0, "canal", "cb-label", 0, 5);
    s += txt(0.84, 0.43, 0, "bridge", "cb-label", 0, -8);
    return s;
  }

  function render() {
    const sc = scenes[mode];
    let s = "";
    // floor, top frame and verticals
    const fl = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]];
    s += gon(fl, "cb-floor");
    s += gon(fl.map(([x, y]) => [x, y, 1]), "cb-frame");
    fl.forEach(([x, y]) => { s += poly([[x, y, 0], [x, y, 1]], "cb-frame"); });
    s += sc.map === "river" ? mapRiver(sc) : mapCanal();

    const path = sample(sc.keys);
    s += poly(path.map(([x, y]) => [x, y, 0]), "cb-shadow");

    let over = "";
    if (mode === "es") {
      const [bx, by, t0] = sc.keys[1], t1 = sc.keys[2][2], tm = (t0 + t1) / 2;
      s += gon(fl.map(([x, y]) => [x, y, tm]), "cb-slice");
      s += poly([[bx, by, tm], [bx, by, 0]], "cb-plumb");
      s += poly([[bx - 0.02, by, 0], [riverL(by) + 0.062, by, 0]], "cb-dist");
      s += poly([[bx + 0.02, by + 0.02, 0], [0.86, 0.83, 0]], "cb-dist");
      s += txt((bx + riverL(by) + 0.06) / 2, by, 0, "near", "cb-dist-label", 0, -8);
      s += txt(0.57, 0.585, 0, "far", "cb-dist-label", 0, -8);
      over += `<circle class="cb-spot" cx="${proj(bx, by, 0)[0]}" cy="${proj(bx, by, 0)[1]}" r="4"/>`;
      over += txt(bx, by, t1, "sat down to rest", "cb-hot-label", 12, -6, "start");
    } else {
      const [r0, r1] = sc.route;
      const leg = sample(sc.keys, r0, r1);
      const foot = leg.map(([x, y]) => [x, y, 0]);
      s += gon([...foot, ...leg.slice().reverse()], "cb-curtain");
      s += poly(foot, "cb-route");
      over += poly(leg, "cb-seg");
      const [ex, ey, et] = sc.keys[5];
      over += txt(ex, ey, et, "a reptile experience center", "cb-hot-label", 12, -4, "start");
    }
    s += poly(path, "cb-path") + over;
    sc.pauses.forEach(([i, j, hot]) => { s += poly([sc.keys[i], sc.keys[j]], "cb-pause" + (hot ? " hot" : "")); });
    // start and end of the camera’s path
    const [sx, sy] = proj(...sc.keys[0]);
    s += `<circle cx="${sx}" cy="${sy}" r="4" fill="var(--ink)"/>`;

    // time axis on the left-most vertical edge
    let corner = fl[0], minx = Infinity;
    fl.forEach((c) => { const x = proj(c[0], c[1], 0)[0]; if (x < minx) { minx = x; corner = c; } });
    s += poly([[corner[0], corner[1], 0], [corner[0], corner[1], 1]], "cb-axis");
    [[0, "start"], [1, "end"]].forEach(([t, l]) => { s += txt(corner[0], corner[1], t, l, "cb-tick", 7, -5, "start"); });
    s += txt(corner[0], corner[1], 1, "time ↑", "cb-tick", 7, -20, "start");
    svg.innerHTML = s;
  }

  const qa = document.querySelector(".cube-qa");
  const tabs = document.querySelectorAll(".cube-ctl button");
  function setMode(m) {
    mode = m;
    const sc = scenes[m];
    tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    document.getElementById("cube-q").textContent = sc.q;
    document.getElementById("qa-a").textContent = sc.a;
    qa.classList.remove("swap"); void qa.offsetWidth; qa.classList.add("swap");
    svg.style.opacity = 0;
    setTimeout(() => { render(); svg.style.opacity = 1; }, reduceMotion ? 0 : 180);
  }
  svg.style.transition = "opacity .35s";
  let auto = reduceMotion ? null : setInterval(() => setMode(mode === "es" ? "se" : "es"), 10000);
  tabs.forEach((b) => b.addEventListener("click", () => {
    if (auto) { clearInterval(auto); auto = null; }
    setMode(b.dataset.mode);
  }));

  // drag to turn; a slow sway otherwise
  let dragging = false, lastX = 0, swaying = !reduceMotion;
  svg.addEventListener("pointerdown", (e) => { dragging = true; swaying = false; lastX = e.clientX; svg.classList.add("dragging"); svg.setPointerCapture(e.pointerId); });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    theta = Math.max(-1.45, Math.min(0.25, theta + (e.clientX - lastX) * 0.008));
    lastX = e.clientX; render();
  });
  const endDrag = () => { dragging = false; svg.classList.remove("dragging"); };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  if (swaying) {
    const tick = (now) => {
      if (swaying) { sway = 0.12 * Math.sin(now / 4200); render(); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  setMode("es");
  render();

  /* ------------------------------------------------------------------
   * §01 Ten videos: a contact sheet of 20 frames per uninterrupted take
   * ------------------------------------------------------------------ */
  const N_VIDEOS = 10, N_FRAMES = 20;
  const pad = (n) => String(n).padStart(2, "0");
  const frameSrc = (w, f) => `static/frames/v${pad(w)}/${pad(f)}.jpg`;
  const stageImg = document.getElementById("video-frame");
  const reel = document.getElementById("video-reel");
  const takes = document.getElementById("video-thumbs");
  const burn = document.getElementById("video-burn");
  const playBtn = document.getElementById("video-play");
  let cur = { w: 1, f: 1 }, playing = !reduceMotion, timer = null, visible = false;

  for (let w = 1; w <= N_VIDEOS; w++) {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab");
    b.textContent = `Video ${pad(w)}`;
    b.addEventListener("click", () => selectVideo(w));
    takes.appendChild(b);
  }
  function showFrame(f) {
    cur.f = f;
    const src = frameSrc(cur.w, f);
    const img = new Image();
    img.onload = () => {
      stageImg.style.opacity = 0;
      setTimeout(() => { stageImg.src = src; stageImg.style.opacity = 1; }, reduceMotion ? 0 : 220);
    };
    img.src = src;
    stageImg.alt = `Video ${pad(cur.w)}, frame ${f} of ${N_FRAMES}`;
    burn.textContent = `VIDEO ${pad(cur.w)} · FR ${pad(f)}/${N_FRAMES}`;
    reel.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", String(i + 1 === f)));
  }
  function selectVideo(w) {
    cur.w = w;
    takes.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-selected", String(i + 1 === w)));
    reel.innerHTML = "";
    for (let f = 1; f <= N_FRAMES; f++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Frame ${f}`);
      b.innerHTML = `<img src="${frameSrc(w, f)}" alt="" loading="lazy"><span>${pad(f)}</span>`;
      b.addEventListener("click", () => { showFrame(f); restart(); });
      reel.appendChild(b);
    }
    showFrame(1);
    restart();
    document.getElementById("iq-title").textContent = `Six questions about Video ${pad(w)}`;
    showQuestion(iqTask);
  }
  function restart() {
    clearInterval(timer);
    if (playing && visible) timer = setInterval(() => showFrame(cur.f % N_FRAMES + 1), 2400);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.classList.toggle("paused", !p);
    playBtn.setAttribute("aria-label", p ? "Pause" : "Play");
    restart();
  }
  playBtn.addEventListener("click", () => setPlaying(!playing));

  // six questions about the selected video, one per task type
  const TASKS = {
    L: ["Localization", "es"], RR: ["Relation reasoning", "es"], OC: ["Object counting", "es"],
    NP: ["Navigation planning", "es"], RER: ["Region-conditioned retrieval", "se"], TER: ["Trajectory retrieval", "se"],
  };
  const iqTabs = document.getElementById("iq-tabs");
  const iqOpts = document.getElementById("iq-opts");
  let iqTask = 0;
  function showQuestion(i) {
    iqTask = i;
    const q = (window.SENRI_QUESTIONS || [])[cur.w - 1]?.[i];
    iqTabs.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
    if (!q) return;
    document.getElementById("iq-q").textContent = q.q;
    iqOpts.innerHTML = "";
    q.opts.forEach((o, k) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = `<b>${"ABCD"[k]}</b><span></span>`;
      b.querySelector("span").textContent = o;
      b.addEventListener("click", () => {
        iqOpts.querySelectorAll("button").forEach((x, j) => {
          x.disabled = true;
          if (j === q.ans) x.classList.add("right");
          else if (x === b) x.classList.add("wrong");
        });
      });
      li.appendChild(b);
      iqOpts.appendChild(li);
    });
  }
  Object.entries(TASKS).forEach(([key, [name, dir]], i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.title = name;
    b.innerHTML = `<span class="dot ${dir}"></span>${key}`;
    b.setAttribute("aria-label", name);
    b.addEventListener("click", () => showQuestion(i));
    iqTabs.appendChild(b);
  });
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; restart(); }).observe(document.querySelector(".screen"));
  setPlaying(playing);
  selectVideo(1);

  /* ------------------------------------------------------------------
   * §02 Task explorer: one example per task type (paper Figure 2)
   * ------------------------------------------------------------------ */
  const examples = {
    loc: { kind: "Localization", q: "When I was carefully looking at the art museum’s guide brochure, where was I?", opts: ["The platform on the second floor of the art museum facing the river", "The exhibition hall entrance", "The platform on the second floor of the art museum facing away from the river", "The atrium on the first floor of the art museum"], ans: 0 },
    rr: { kind: "Relation reasoning", q: "When I passed under the rockery, what is the spatial relationship between me one minute later and me now?", opts: ["The former is at a lower altitude than the latter", "The former and the latter have not changed position", "The former is above the latter", "The former is to the east of the latter, at the same altitude"], ans: 2 },
    oc: { kind: "Object counting", q: "When I was looking at the displayed books and other exhibits inside the Chinese-style building, how many glass display cabinets were in the room?", opts: ["4", "3", "2", "8"], ans: 3 },
    np: { kind: "Navigation planning", q: "After I took the green drink, how did I walk?", opts: ["I continued walking forward and entered KFC", "I directly exited the mall and took the escalator up to the ground floor", "I went down to the first basement level at the trash can", "I took the elevator inside the mall to the ground floor"], ans: 1 },
    rer: { kind: "Region-conditioned retrieval", q: "When I was waiting for my food at the Indian restaurant, what did I see?", opts: ["The Indian head chef came to ask me something", "A mother and daughter sat down opposite me", "An Indian guy was playing the piano", "An Indian guy was dancing"], ans: 3 },
    ter: { kind: "Trajectory retrieval", q: "What did I do on the way from home to the metro?", opts: ["Touched a stray kitten", "Ate a meal", "Bought a Starbucks Frappuccino", "Slept"], ans: 2 },
  };
  const chips = document.querySelectorAll("[data-task]");
  const exImg = document.getElementById("ex-img");
  function showTask(key) {
    const ex = examples[key];
    chips.forEach((c) => c.setAttribute("aria-selected", String(c.dataset.task === key)));
    exImg.style.opacity = 0;
    const img = new Image();
    img.onload = () => { exImg.src = img.src; exImg.style.opacity = 1; };
    img.src = `static/img/task_${key}.jpg`;
    exImg.alt = `Four evidence frames for: ${ex.q}`;
    document.getElementById("ex-kind").textContent = ex.kind;
    document.getElementById("ex-q").textContent = ex.q;
    const ol = document.getElementById("ex-opts");
    ol.innerHTML = "";
    ex.opts.forEach((o, i) => {
      const li = document.createElement("li");
      if (i === ex.ans) li.className = "correct";
      li.innerHTML = `<b>${"ABCD"[i]}</b><span></span>`;
      li.querySelector("span").textContent = o;
      ol.appendChild(li);
    });
  }
  chips.forEach((c) => c.addEventListener("click", () => showTask(c.dataset.task)));
  showTask("rr");

  /* ------------------------------------------------------------------
   * §03 Comparison table (paper Table 1)
   * ------------------------------------------------------------------ */
  const Y = 1, N = 0;
  const compare = [
    ["Spatial understanding"],
    ["VSI-Bench", "A/M", [N, N, N, N, N, Y], "≈ 0.03"],
    ["VSI-Super", "A/M", [N, N, N, Y, N, Y], "0.17–4.00"],
    ["VSI-Super-Wild", "A/M", [N, Y, Y, Y, N, Y], "0.64"],
    ["UCS-Bench", "A/M", [N, N, Y, Y, Y, Y], "0.33"],
    ["Long video"],
    ["LVBench", "M", [N, N, Y, Y, Y, N], "1.14"],
    ["LongVideoBench", "M", [N, N, Y, Y, Y, N], "0.13"],
    ["HippoVlog", "A/M", [N, N, Y, Y, Y, N], "0.46"],
    ["HourVideo", "A/M", [N, Y, Y, Y, Y, Y], "0.76"],
    ["EgoLifeQA", "A/M", [Y, Y, Y, Y, Y, N], "44.3"],
    ["Ours"],
    ["SENRI-Bench", "M", [Y, Y, Y, Y, Y, Y], "2.53", true],
  ];
  const cb = document.getElementById("compare-body");
  compare.forEach((r) => {
    const tr = document.createElement("tr");
    if (r.length === 1) { tr.className = "grp"; tr.innerHTML = `<td colspan="9">${r[0]}</td>`; }
    else {
      if (r[4]) tr.className = "ours";
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>` +
        r[2].map((v) => v ? `<td class="mark yes" aria-label="yes">✓</td>` : `<td class="mark no" aria-label="no">✗</td>`).join("") +
        `<td class="num">${r[3]}</td>`;
    }
    cb.appendChild(tr);
  });

  /* ------------------------------------------------------------------
   * §04 Main results (paper Table 2): overall / Event→Space / Space→Event
   * ------------------------------------------------------------------ */
  const results = {
    "Direct perception": [
      ["Gemini 3.1 Pro", "", 47.4, 43.1, 56.0],
      ["Gemini 3.5 Flash", "", 49.8, 45.5, 58.4],
      ["Gemini 3.7 Flash", "", 52.2, 48.5, 59.6],
      ["GPT-5", "", 47.2, 44.6, 52.4],
      ["GPT-5.5", "", 48.2, 46.7, 51.2],
      ["Kimi K3", "", 41.4, 39.5, 45.2],
      ["Cambrian-S-7B", "Qwen2.5-7B*", 34.8, 32.0, 40.4],
      ["Cambrian-S-7B-LFP", "Qwen2.5-7B*", 31.4, 29.3, 35.5],
      ["InternVideo3-8B", "Qwen3-VL-8B*", 39.0, 38.0, 41.0],
      ["VideoChat3-4B", "Qwen3-4B*", 40.8, 40.4, 41.6],
      ["Qwen3.5-9B", "", 41.6, 41.6, 41.6],
      ["Qwen3.5-27B", "", 43.8, 41.6, 48.2],
      ["Qwen3.6-27B", "", 43.8, 41.0, 49.4],
      ["Qwen3.6-35B-A3B", "", 45.6, 46.1, 44.6],
      ["Qwen3.8-27B", "", 41.0, 39.5, 44.0],
    ],
    "Evidence seeking": [
      ["LongVideo-R1", "Qwen3-8B*", 39.0, 36.5, 44.0],
      ["ParaVT-8B", "Qwen3-VL-8B*", 29.8, 28.1, 33.1],
      ["Video-o3", "Qwen2.5-VL-7B*", 40.6, 40.1, 41.6],
      ["VideoARM", "Qwen3.8-27B", 45.0, 43.7, 47.6],
      ["VideoARM", "Gemini 3.7 Flash", 59.0, 56.0, 65.1],
    ],
    "Persistent memory": [
      ["M3-Agent", "Qwen3-32B*", 33.6, 33.2, 34.3],
      ["Light-Omni", "Qwen2.5-Omni-7B*", 37.4, 35.0, 42.2],
      ["EG-Agent", "Qwen3.8-27B", 34.8, 34.1, 36.1],
      ["EG-Agent", "Gemini 3.7 Flash", 52.2, 53.6, 49.4],
      ["WorldMM", "Qwen3.8-27B", 47.6, 42.8, 57.2],
      ["WorldMM", "Gemini 3.7 Flash", 58.8, 56.6, 63.3],
      ["MAGIC-Video", "Qwen3.8-27B", 45.2, 43.1, 49.4],
      ["MAGIC-Video", "Gemini 3.7 Flash", 58.6, 57.2, 61.4],
    ],
  };
  const MAX = 70;
  const pct = (v) => `${(v / MAX) * 100}%`;
  const metricIdx = { total: 2, es: 3, se: 4 };
  const metricName = { total: "Overall", es: "Event → Space", se: "Space → Event" };
  const barsEl = document.getElementById("bars");
  const tooltip = document.getElementById("tooltip");

  function showTip(html, x, y) {
    tooltip.innerHTML = html;
    tooltip.hidden = false;
    const r = tooltip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }
  const hideTip = () => { tooltip.hidden = true; };
  const bindTip = (el, html) => {
    el.addEventListener("mousemove", (e) => showTip(html, e.clientX, e.clientY));
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", () => { const b = el.getBoundingClientRect(); showTip(html, b.left + b.width * 0.6, b.top + b.height / 2); });
    el.addEventListener("blur", hideTip);
  };
  const tipFor = (r) => `<b>${r[0]}${r[1] ? ` · ${r[1]}` : ""}</b>` +
    `<div class="tt-row"><span>Overall</span><span>${r[2].toFixed(1)}%</span></div>` +
    `<div class="tt-row"><span>Event → Space</span><span>${r[3].toFixed(1)}%</span></div>` +
    `<div class="tt-row"><span>Space → Event</span><span>${r[4].toFixed(1)}%</span></div>`;

  const rowEls = [];
  Object.entries(results).forEach(([group, rows]) => {
    const g = document.createElement("div");
    g.className = "bar-group";
    g.innerHTML = `<h4>${group}</h4>`;
    const list = document.createElement("div");
    g.appendChild(list);
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.tabIndex = 0;
      row.setAttribute("role", "img");
      row.innerHTML = `<div class="bar-label">${r[0]}${r[1] ? `<small>${r[1]}</small>` : ""}</div>` +
        `<div class="bar-track"><div class="bar-fill"></div><span class="bar-val"></span></div>`;
      bindTip(row, tipFor(r));
      list.appendChild(row);
      rowEls.push({ row, r, list });
    });
    barsEl.appendChild(g);
  });
  const ref = document.createElement("div");
  ref.className = "ref-line";
  ref.innerHTML = "<span>60%</span>";
  barsEl.appendChild(ref);
  const axis = document.createElement("div");
  axis.className = "bars-axis";
  axis.innerHTML = `<div></div><div class="ticks">${[0, 10, 20, 30, 40, 50, 60, 70].map((t) => `<span style="left:${pct(t)}">${t}</span>`).join("")}</div>`;
  barsEl.after(axis);
  function placeRef() {
    const t = barsEl.querySelector(".bar-track");
    const bb = barsEl.getBoundingClientRect(), tb = t.getBoundingClientRect();
    ref.style.left = `${tb.left - bb.left + tb.width * (60 / MAX)}px`;
    ref.style.top = `${barsEl.querySelector(".bar-row").offsetTop}px`;
  }
  function setMetric(m) {
    const idx = metricIdx[m];
    const best = Math.max(...rowEls.map((o) => o.r[idx]));
    document.querySelectorAll("[data-metric]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.metric === m)));
    const byList = new Map();
    rowEls.forEach((o) => { if (!byList.has(o.list)) byList.set(o.list, []); byList.get(o.list).push(o); });
    byList.forEach((arr, list) => arr.sort((a, b) => b.r[idx] - a.r[idx]).forEach((o) => list.appendChild(o.row)));
    rowEls.forEach(({ row, r }) => {
      const v = r[idx];
      row.querySelector(".bar-fill").style.width = pct(v);
      const val = row.querySelector(".bar-val");
      val.style.left = pct(v);
      val.textContent = v.toFixed(1);
      row.classList.toggle("best", v === best);
      row.setAttribute("aria-label", `${r[0]}${r[1] ? ", " + r[1] : ""}: ${metricName[m]} ${v.toFixed(1)}%`);
    });
  }
  document.querySelectorAll("[data-metric]").forEach((b) => b.addEventListener("click", () => setMetric(b.dataset.metric)));
  setMetric("total");
  placeRef();
  window.addEventListener("resize", placeRef);

  const tb = document.querySelector("#results-table tbody");
  Object.entries(results).forEach(([group, rows]) => rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i === 0 ? group : ""}</td><td>${r[0]}</td><td>${r[1] || r[0]}</td>` +
      `<td class="num">${r[2].toFixed(1)}</td><td class="num">${r[3].toFixed(1)}</td><td class="num">${r[4].toFixed(1)}</td>`;
    tb.appendChild(tr);
  }));

  /* ------------------------------------------------------------------
   * §06 SENRI-Agent gains (paper Table 3)
   * ------------------------------------------------------------------ */
  const gains = [
    ["WorldMM", "Gemini 3.7 Flash", 58.8, 62.6],
    ["MAGIC-Video", "Gemini 3.7 Flash", 58.6, 61.8],
    ["WorldMM", "Qwen3.8-27B", 47.6, 50.4],
    ["MAGIC-Video", "Qwen3.8-27B", 45.2, 47.8],
  ];
  const LO = 40, HI = 65;
  const dpct = (v) => `${((v - LO) / (HI - LO)) * 100}%`;
  const dbEl = document.getElementById("dumbbells");
  gains.forEach(([m, model, a, b]) => {
    const row = document.createElement("div");
    row.className = "db-row";
    row.tabIndex = 0;
    row.setAttribute("role", "img");
    row.setAttribute("aria-label", `${m} with ${model}: ${a.toFixed(1)}% to ${b.toFixed(1)}% with SENRI-Agent`);
    row.innerHTML = `<div class="db-label">${m}<small>${model}</small></div>` +
      `<div class="db-track"><div class="db-line" style="left:${dpct(a)};width:calc(${dpct(b)} - ${dpct(a)})"></div>` +
      `<div class="db-dot orig" style="left:${dpct(a)}"></div><div class="db-dot agent" style="left:${dpct(b)}"></div>` +
      `<span class="db-gain" style="left:${dpct(b)}">+${(b - a).toFixed(1)}</span></div>`;
    bindTip(row, `<b>${m} · ${model}</b><div class="tt-row"><span>Original</span><span>${a.toFixed(1)}%</span></div><div class="tt-row"><span>SENRI-Agent</span><span>${b.toFixed(1)}%</span></div>`);
    dbEl.appendChild(row);
  });
  const dbAxis = document.createElement("div");
  dbAxis.className = "db-axis";
  dbAxis.innerHTML = `<div></div><div class="ticks">${[40, 45, 50, 55, 60, 65].map((t) => `<span style="left:${dpct(t)}">${t}</span>`).join("")}</div>`;
  dbEl.after(dbAxis);

  /* ------------------------------------------------------------------
   * BibTeX copy
   * ------------------------------------------------------------------ */
  const copyBtn = document.getElementById("copy-bib");
  copyBtn.addEventListener("click", async () => {
    const text = document.getElementById("bib-text").innerText;
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = "Copied"; }
    catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("bib-text"));
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      copyBtn.textContent = "Press ⌘C";
    }
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1600);
  });
})();
