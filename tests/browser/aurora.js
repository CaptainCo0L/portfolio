// Browser check (not run by `node --test`): the aurora drifts on its own, reacts to scroll,
// freezes completely when paused, is still (with no toggle) under reduced motion, stays fixed
// behind the content, and never widens the page.
//   python -m http.server 8000   then:
//   node scripts/probe.mjs --width 1440 tests/browser/aurora.js
//   node scripts/probe.mjs --width 375 --height 812 tests/browser/aurora.js
//   node scripts/probe.mjs --width 1440 --media prefers-reduced-motion=reduce tests/browser/aurora.js
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.documentElement;
  root.classList.remove("aurora-paused");
  try { localStorage.removeItem("aurora"); } catch (e) {}
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layer = document.querySelector(".aurora--1");
  const wrap = document.querySelector(".aurora-wrap--3");
  const btn = document.querySelector(".motion-toggle");
  const t = (el) => getComputedStyle(el).transform;
  const out = { reduce };

  const anims = document.querySelectorAll(".aurora, .aurora-wrap");
  const running = [...anims].flatMap((el) => el.getAnimations()).length;

  if (reduce) {
    out.still = { running, ok: running === 0 };
    out.noToggle = { ok: btn.hidden };
    return out;
  }

  out.animations = { running, ok: running === 6 };          // 3 drifts + 3 scroll reactions

  // Drift: the layer moves on its own, without scrolling
  scrollTo({ top: 0, behavior: "instant" });
  await wait(100);
  const d0 = t(layer); await wait(1500); const d1 = t(layer);
  out.drifts = { ok: d0 !== d1 };

  // Scroll reaction: the wrap transform and opacity follow scroll position
  const s0 = [t(wrap), getComputedStyle(wrap).opacity];
  scrollTo({ top: (root.scrollHeight - innerHeight) * 0.7, behavior: "instant" });
  await wait(200);
  const s1 = [t(wrap), getComputedStyle(wrap).opacity];
  out.reactsToScroll = { from: s0, to: s1, ok: s0[0] !== s1[0] && s0[1] !== s1[1] };

  // Backdrop stays fixed behind the content
  out.fixed = { ok: document.querySelector(".backdrop").getBoundingClientRect().top === 0 };

  // Pause: a real toggle button; freezes drift and scroll reaction; remembered
  out.toggleShown = { ok: !btn.hidden && btn.getAttribute("aria-pressed") === "false" };
  btn.click();
  await wait(100);
  const p0 = [t(layer), t(wrap)];
  await wait(1200);
  scrollTo({ top: 0, behavior: "instant" });
  await wait(200);
  const p1 = [t(layer), t(wrap)];
  let saved = null; try { saved = localStorage.getItem("aurora"); } catch (e) {}
  out.paused = { pressed: btn.getAttribute("aria-pressed"), saved, ok: p0[0] === p1[0] && p0[1] === p1[1] && btn.getAttribute("aria-pressed") === "true" && saved === "paused" };
  btn.click();                                              // play again, leave things as found
  out.resumed = { ok: btn.getAttribute("aria-pressed") === "false" };

  out.noHScroll = { sw: root.scrollWidth, ok: root.scrollWidth <= innerWidth && innerWidth <= 1440 };
  return out;
})()
