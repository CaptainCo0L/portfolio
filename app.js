/* Renders everything from data.js. You shouldn't need to edit this file
   to change content — edit data.js instead. */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Hero ---------- */
  $("#hero-headline").textContent = DATA.headline;
  $("#hero-lede").textContent = DATA.lede;
  $("#hero-status").textContent = DATA.status;

  const mailto = "mailto:" + DATA.contact.email;
  $("#nav-email").href = mailto;
  $("#contact-email").href = mailto;
  $("#hero-linkedin").href = DATA.contact.linkedin;
  $("#contact-linkedin").href = DATA.contact.linkedin;
  $("#hero-cv").href = DATA.contact.cv;
  $("#contact-cv").href = DATA.contact.cv;

  /* ---------- Terminal ---------- */
  $("#term-filename").textContent = DATA.terminal.filename;
  $("#term-chip").textContent = DATA.terminal.chip;

  const termBody = $("#term-body");
  let typedEl = null;
  let typedText = "";

  let afterTyped = false;
  const heldLines = [];

  DATA.terminal.lines.forEach((line) => {
    const div = document.createElement("div");
    div.className = "term__line";
    if (afterTyped && !reduceMotion) { div.style.visibility = "hidden"; heldLines.push(div); }
    if (line.blank) { termBody.appendChild(div); return; }
    if (line.ok) div.classList.add("term__line--ok");
    if (line.scan) div.classList.add("term__line--scan");
    if (line.prompt) {
      const p = document.createElement("span");
      p.className = "p";
      p.textContent = "$ ";
      div.appendChild(p);
    }
    const span = document.createElement("span");
    span.textContent = line.typed && !reduceMotion ? "" : line.text;
    div.appendChild(span);
    if (line.typed && !reduceMotion) {
      typedEl = span;
      typedText = line.text;
      afterTyped = true;
      const caret = document.createElement("span");
      caret.className = "term__caret";
      div.appendChild(caret);
    }
    termBody.appendChild(div);
  });

  /* One-shot type-in of the marked line; result lines print after it lands. */
  if (typedEl) {
    let i = 0;
    const tick = () => {
      typedEl.textContent = typedText.slice(0, ++i);
      if (i < typedText.length) {
        setTimeout(tick, 45);
      } else {
        heldLines.forEach((el, j) =>
          setTimeout(() => { el.style.visibility = ""; }, 120 + j * 100));
      }
    };
    setTimeout(tick, 500);
  }

  /* ---------- Stats ---------- */
  $("#stats").innerHTML = DATA.stats
    .map((s) => `<div><b>${esc(s.value)}${s.unit ? " " + esc(s.unit) : ""}</b><span>${esc(s.label)}</span></div>`)
    .join("");

  /* ---------- Phases ---------- */
  $("#phases").innerHTML = DATA.phases
    .map(
      (ph) => `<li class="reveal">
        <span class="stage">${esc(ph.num)}</span>
        <h3>${esc(ph.title)}</h3>
        <span class="period">${esc(ph.period)}</span>
        <p>${esc(ph.body)}</p>
        <ul class="tags">${ph.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </li>`
    )
    .join("");

  /* ---------- Projects ---------- */
  $("#projects").innerHTML = DATA.projects
    .map(
      (pr) => `<article class="card reveal">
        <h3>${esc(pr.title)}</h3>
        <span class="org">${esc(pr.org)}</span>
        <p>${esc(pr.body)}</p>
        <ul class="tags">${pr.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${pr.link ? `<a class="link-quiet" href="${esc(pr.link)}" target="_blank" rel="noopener">Read more ↗</a>` : ""}
      </article>`
    )
    .join("");

  /* ---------- Skills ---------- */
  $("#skills").innerHTML = DATA.skills
    .map(
      (row) => `<tr>
        <th scope="row">${esc(row.domain)}</th>
        <td>${esc(row.items)}</td>
        <td class="note">${esc(row.note)}</td>
      </tr>`
    )
    .join("");

  $("#education").innerHTML = DATA.education.map((e) => `<li>${esc(e)}</li>`).join("");
  $("#certs").innerHTML = DATA.certs.map((c) => `<li>${esc(c)}</li>`).join("");

  /* ---------- Contact + footer ---------- */
  $("#contact-heading").textContent = DATA.contactHeading;
  $("#contact-body").textContent = DATA.contactBody;
  $("#contact-meta").textContent =
    DATA.contact.email + " · " + DATA.contact.location + " (" + DATA.contact.timezone + ")" +
    (DATA.contact.phone ? " · " + DATA.contact.phone : "");
  $("#foot").textContent =
    "© " + new Date().getFullYear() + " " + DATA.name + " · " + DATA.contact.location + " · " + DATA.contact.timezone;

  /* ---------- Sparse one-shot reveals ---------- */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Ctrl/⌘ K command palette ---------- */
  const cmdk = $("#cmdk");
  const input = $("#cmdk-input");
  const results = $("#cmdk-results");
  let items = [];
  let active = 0;
  let lastFocus = null;

  const COMMANDS = [
    { group: "Sections", label: "The route in — story", hint: "jump", run: () => goto("#route") },
    { group: "Sections", label: "Fieldwork — projects", hint: "jump", run: () => goto("#fieldwork") },
    { group: "Sections", label: "Toolbox — skills", hint: "jump", run: () => goto("#toolbox") },
    { group: "Sections", label: "Contact", hint: "jump", run: () => goto("#contact") },
    { group: "Actions", label: "Email " + DATA.contact.email, hint: "mailto", run: () => (window.location.href = mailto) },
    { group: "Actions", label: "Open LinkedIn", hint: "↗", run: () => window.open(DATA.contact.linkedin, "_blank", "noopener") },
    { group: "Actions", label: "Download CV", hint: "pdf", run: () => (window.location.href = DATA.contact.cv) },
    ...DATA.projects.map((pr) => ({
      group: "Fieldwork",
      label: pr.title,
      hint: pr.org,
      run: () => (pr.link ? window.open(pr.link, "_blank", "noopener") : goto("#fieldwork")),
    })),
  ];

  function goto(hash) {
    document.querySelector(hash).scrollIntoView(reduceMotion ? {} : { behavior: "smooth" });
  }

  function render(filter) {
    const q = (filter || "").trim().toLowerCase();
    items = COMMANDS.filter((c) => !q || (c.label + " " + c.group).toLowerCase().includes(q));
    active = 0;
    if (!items.length) {
      results.innerHTML = `<p class="cmdk__empty">Nothing matches. Try “email” or “cv”.</p>`;
      return;
    }
    let html = "";
    let lastGroup = null;
    items.forEach((c, i) => {
      if (c.group !== lastGroup) {
        html += `<p class="cmdk__group">${esc(c.group)}</p>`;
        lastGroup = c.group;
      }
      html += `<button class="cmdk__item${i === 0 ? " is-active" : ""}" data-i="${i}" type="button">
        ${esc(c.label)}<span class="hint">${esc(c.hint)}</span>
      </button>`;
    });
    results.innerHTML = html;
  }

  function setActive(i) {
    const els = results.querySelectorAll(".cmdk__item");
    if (!els.length) return;
    active = (i + els.length) % els.length;
    els.forEach((el, j) => el.classList.toggle("is-active", j === active));
    els[active].scrollIntoView({ block: "nearest" });
  }

  function open() {
    lastFocus = document.activeElement;
    cmdk.classList.add("is-open");
    cmdk.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    input.value = "";
    render("");
    input.focus({ preventScroll: true });
  }

  function close() {
    cmdk.classList.remove("is-open");
    cmdk.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  const isOpen = () => cmdk.classList.contains("is-open");

  $("#searchpill").addEventListener("click", open);
  cmdk.querySelector("[data-close]").addEventListener("click", close);

  results.addEventListener("click", (e) => {
    const btn = e.target.closest(".cmdk__item");
    if (!btn) return;
    const cmd = items[Number(btn.dataset.i)];
    close();
    cmd.run();
  });

  input.addEventListener("input", () => render(input.value));

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isOpen() ? close() : open();
      return;
    }
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) { const cmd = items[active]; close(); cmd.run(); }
    }
  });
})();
