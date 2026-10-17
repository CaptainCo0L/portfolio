/* Progressive enhancement only. The content is already in index.html
   (generated from data.js by build/build.mjs); this file adds motion and
   the trace → record links. The page works without it. */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  $("#foot-year").textContent = new Date().getFullYear() + " ";

  /* ---------- Signal band ---------- */
  (function band() {
    const plot = $("#band");

    if (reduceMotion) {
      plot.classList.add("band--in");
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => plot.classList.add("band--in")));
    }

    /* A flag is a link into the record. */
    plot.addEventListener("click", (e) => {
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

  /* ---------- Nav: mark the section in view ---------- */
  if ("IntersectionObserver" in window) {
    const links = new Map(
      [...document.querySelectorAll('.nav__links a[href^="#"]')].map((a) => [a.hash.slice(1), a])
    );
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const link = links.get(en.target.id);
          if (en.isIntersecting) {
            links.forEach((a) => a.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      // A thin band across the middle of the viewport: at most one section is "in view".
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((_, id) => spy.observe(document.getElementById(id)));
  }

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
