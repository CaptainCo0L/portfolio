// Browser check (not run by `node --test`): the hero backdrop fades as the first screen scrolls,
// reverses on the way back, stays still under reduced motion, and never widens the page.
//   python -m http.server 8000   then:
//   node scripts/probe.mjs --width 1440 tests/browser/hero-glow.js
//   node scripts/probe.mjs --width 375 --height 812 tests/browser/hero-glow.js
//   node scripts/probe.mjs --width 1440 --media prefers-reduced-motion=reduce tests/browser/hero-glow.js
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const glow = document.querySelector(".hero__glow");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const at = async (y) => {
    scrollTo({ top: y, behavior: "instant" });
    await wait(150);
    return { y, opacity: +(+getComputedStyle(glow).opacity).toFixed(2), transform: getComputedStyle(glow).transform };
  };
  const top = await at(0);
  const mid = await at(innerHeight * 0.6);
  const back = await at(0);
  return {
    supported: CSS.supports("animation-timeline: scroll()"),
    reduce,
    samples: [top, mid, back],
    fullAtTop: { ok: top.opacity === 1 },
    reacts: reduce
      ? { ok: mid.opacity === 1 && mid.transform === "none" }       // static under reduced motion
      : { ok: mid.opacity < 0.5 && mid.transform !== "none" },
    reverses: { ok: back.opacity === 1 },
    noHScroll: { sw: document.documentElement.scrollWidth, ok: document.documentElement.scrollWidth <= innerWidth && innerWidth <= 1440 },
  };
})()
