/* Renders everything from data.js. You shouldn't need to edit this file
   to change content — edit data.js instead. */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Hero + links ---------- */
  $("#hero-headline").textContent = DATA.headline;
  $("#hero-lede").textContent = DATA.lede;
  $("#nav-status").textContent = DATA.status;

  const mailto = "mailto:" + DATA.contact.email;
  $("#contact-email").href = mailto;
  $("#hero-linkedin").href = DATA.contact.linkedin;
  $("#contact-linkedin").href = DATA.contact.linkedin;
  $("#hero-cv").href = DATA.contact.cv;
  $("#contact-cv").href = DATA.contact.cv;

  /* ---------- Readout rail ---------- */
  $("#stats").innerHTML = DATA.stats
    .map(
      (s) => `<div>
        <dt>${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</dt>
        <dd>${esc(s.label)}</dd>
      </div>`
    )
    .join("");

  /* ---------- The record ---------- */
  $("#phases").innerHTML = DATA.phases
    .map(
      (ph, i) => `<li class="reveal${ph.flag ? " is-flagged" : ""}" id="event-${i}">
        <div class="when">
          ${esc(ph.year)}
          <span class="class">${ph.flag ? "Flagged" : "Baseline"}</span>
        </div>
        <div>
          <h3>${esc(ph.title)}</h3>
          <span class="period">${esc(ph.period)}</span>
          <p>${esc(ph.body)}</p>
          <ul class="tags">${ph.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>
      </li>`
    )
    .join("");

  /* ---------- Signal band ----------
     One bar per slot. Routine work draws a short, cool tick; the four
     events from DATA.phases draw a tall sodium bar you can click. */
  (function buildBand() {
    const band = $("#band");
    const slots = window.innerWidth < 640 ? 96 : 168;

    // Deterministic wobble, so the trace looks sampled rather than random.
    const noise = (i) => {
      const v = Math.sin(i * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };

    // Nearest slot for each phase mark, de-duplicated.
    const flagAt = new Map();
    DATA.phases.forEach((ph, i) => {
      let slot = Math.round(ph.mark * (slots - 1));
      while (flagAt.has(slot)) slot += 1;
      flagAt.set(slot, { phase: ph, index: i });
    });

    let html = "";
    for (let i = 0; i < slots; i++) {
      const delay = Math.round(i * 4.5);
      const flag = flagAt.get(i);
      if (flag) {
        const on = flag.phase.flag;
        html += `<button class="flagbtn${on ? "" : " flagbtn--base"}" type="button"
          style="height:${on ? 100 : 72}%;--d:${delay}ms"
          data-event="${flag.index}"
          aria-label="${esc(flag.phase.year)} — ${esc(flag.phase.title)}. ${on ? "Flagged" : "Baseline"}. Jump to this entry.">
          <span class="flag__label">${esc(flag.phase.year)}</span>
        </button>`;
      } else {
        // Baseline sits low; a slow swell through the middle years reads as volume.
        const swell = Math.sin((i / slots) * Math.PI) * 8;
        const h = 10 + swell + noise(i) * 16;
        html += `<span class="tick" aria-hidden="true"
          style="height:${h.toFixed(1)}%;--d:${delay}ms"></span>`;
      }
    }

    band.classList.add("band--draw");
    band.innerHTML = html;

    if (reduceMotion) {
      band.classList.add("band--in");
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => band.classList.add("band--in")));
    }

    /* A flag is a link into the record. */
    band.addEventListener("click", (e) => {
      const btn = e.target.closest(".flagbtn");
      if (!btn) return;
      const target = document.getElementById("event-" + btn.dataset.event);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      document.querySelectorAll(".record .is-target").forEach((el) => el.classList.remove("is-target"));
      target.classList.add("is-target");
      setTimeout(() => target.classList.remove("is-target"), 2200);
    });
  })();

  /* ---------- Fieldwork ---------- */
  $("#projects").innerHTML = DATA.projects
    .map(
      (pr) => `<article class="case reveal">
        <span class="case__org">${esc(pr.org)}</span>
        <h3>${esc(pr.title)}</h3>
        <p>${esc(pr.body)}</p>
        <ul class="tags">${pr.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${pr.link ? `<p style="margin-top:var(--space-md)"><a class="quiet" href="${esc(pr.link)}" target="_blank" rel="noopener">Read the write-up</a></p>` : ""}
      </article>`
    )
    .join("");
  $("#fieldwork-note").textContent = DATA.fieldworkNote;

  /* ---------- Toolbox ---------- */
  $("#skills").innerHTML = DATA.skills
    .map(
      (row) => `<tr>
        <th scope="row">${esc(row.domain)}</th>
        <td>${esc(row.items)}</td>
        <td>${esc(row.note)}</td>
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

  /* ---------- One-shot reveals ---------- */
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
})();
