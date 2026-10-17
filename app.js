/* Progressive enhancement only. The content is already in index.html
   (generated from data.js by build/build.mjs); this file adds the
   current-stage marker, the popover's hover and placement, and the nav
   spy. The page — popover included — works without it. */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Footer year ---------- */
  $("#foot-year").textContent = new Date().getFullYear() + " ";

  /* ---------- Watch which element sits in the middle band of the viewport ---------- */
  // A thin band across the middle: at most one stage / section counts as "in view".
  const MIDDLE = { rootMargin: "-45% 0px -50% 0px" };
  function spy(elements, onEnter, onLeave) {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? onEnter(en.target) : onLeave(en.target)));
    }, MIDDLE);
    elements.forEach((el) => io.observe(el));
  }

  /* ---------- Story: mark the stage being read ---------- */
  const stages = [...document.querySelectorAll(".stage")];
  spy(
    stages,
    (el) => {
      stages.forEach((s) => s.classList.remove("is-current"));
      el.classList.add("is-current");
    },
    (el) => el.classList.remove("is-current")
  );

  /* ---------- Nav: mark the section in view ---------- */
  const links = new Map(
    [...document.querySelectorAll('.nav__links a[href^="#"]')].map((a) => [a.hash.slice(1), a])
  );
  spy(
    [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean),
    (el) => {
      links.forEach((a) => a.removeAttribute("aria-current"));
      links.get(el.id).setAttribute("aria-current", "location");
    },
    (el) => links.get(el.id).removeAttribute("aria-current")
  );

  /* ---------- "By the numbers" popover ----------
     Native popover does the work: click/tap/Enter toggles, Esc and outside
     clicks close. This adds placement under the chip and, for mouse users,
     hover intent. Hover never closes a popover the user opened on purpose. */
  (function numbers() {
    const chip = $(".chip");
    const pop = $("#numbers");
    if (!chip || !pop || !pop.showPopover) return;

    let openedBy = null; // "hover" | "click"
    let timer = 0;
    const later = (fn, ms) => {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };

    // Below the chip (above it if there's no room), left-aligned, kept 16px inside
    // the viewport. The popover is position: fixed, so it's re-placed while the page
    // scrolls — otherwise it would float over other sections.
    function place() {
      const c = chip.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      // Chip scrolled out of view: close rather than float over another section.
      if (c.bottom < 0 || c.top > vh) return pop.hidePopover();
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      const left = Math.min(Math.max(c.left, 16), vw - w - 16);
      const below = c.bottom + 8;
      const above = c.top - 8 - h;
      const flip = below + h > vh - 16 && above >= 16;
      const top = Math.min(Math.max(flip ? above : below, 16), vh - h - 16);
      // The UA centres popovers (inset: 0; margin: auto); without JS that default stays.
      pop.style.inset = "auto";
      pop.style.margin = "0";
      pop.style.left = left + "px";
      pop.style.top = top + "px";
      // Grow from the chip's side: top edge when below it, bottom edge when above.
      pop.style.transformOrigin = `${Math.round(c.left + c.width / 2 - left)}px ${flip ? "100%" : "0"}`;
    }
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };

    pop.addEventListener("toggle", (e) => {
      if (e.newState !== "open") {
        openedBy = null;
        window.removeEventListener("scroll", follow);
        window.removeEventListener("resize", follow);
        return;
      }
      place();
      window.addEventListener("scroll", follow, { passive: true });
      window.addEventListener("resize", follow, { passive: true });
    });

    chip.addEventListener("click", (e) => {
      // A click on a hover-opened popover pins it instead of toggling it shut.
      if (openedBy === "hover" && pop.matches(":popover-open")) e.preventDefault();
      openedBy = "click";
      clearTimeout(timer);
    });

    if (!finePointer) return;

    const enter = (e) => {
      if (e.pointerType !== "mouse") return;
      if (pop.matches(":popover-open")) return clearTimeout(timer);
      later(() => {
        openedBy = "hover";
        pop.showPopover();
      }, 120);
    };
    const leave = (e) => {
      if (e.pointerType !== "mouse") return;
      if (openedBy === "click") return;
      later(() => {
        if (openedBy === "hover") pop.hidePopover();
      }, 200);
    };
    chip.addEventListener("pointerenter", enter);
    chip.addEventListener("pointerleave", leave);
    pop.addEventListener("pointerenter", () => clearTimeout(timer));
    pop.addEventListener("pointerleave", leave);
  })();

  /* ---------- One-shot heading reveals ---------- */
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
