// Browser check (not run by `node --test`): the glow backdrop stays fixed and visible while the
// content scrolls over it, covers the viewport, and never widens the page.
//   python -m http.server 8000   then:
//   node scripts/probe.mjs --width 1440 tests/browser/backdrop.js
//   node scripts/probe.mjs --width 375 --height 812 tests/browser/backdrop.js
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const bd = document.querySelector(".backdrop");
  const h1 = document.querySelector("h1");
  const at = async (y) => {
    scrollTo({ top: y, behavior: "instant" });
    await wait(150);
    const r = bd.getBoundingClientRect();
    return { y: Math.round(scrollY), top: Math.round(r.top), height: Math.round(r.height), h1Top: Math.round(h1.getBoundingClientRect().top),
             shown: getComputedStyle(bd).display !== "none" && +getComputedStyle(bd).opacity === 1 };
  };
  const max = document.documentElement.scrollHeight - innerHeight;
  const s = [await at(0), await at(max / 2), await at(max)];
  return {
    samples: s,
    fixed: { ok: s.every((x) => x.top === 0) },
    coversViewport: { ok: s.every((x) => x.height >= innerHeight) },
    visibleThroughout: { ok: s.every((x) => x.shown) },
    contentScrolls: { ok: s[1].h1Top < s[0].h1Top && s[2].h1Top < s[1].h1Top },
    noHScroll: { sw: document.documentElement.scrollWidth, ok: document.documentElement.scrollWidth <= innerWidth && innerWidth <= 1440 },
  };
})()
