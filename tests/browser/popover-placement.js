// Browser check (not run by `node --test`): the popover stays on screen near the bottom of a
// phone screen, follows the chip while scrolling, and closes when the chip leaves the screen.
//   python -m http.server 8000   then:
//   node scripts/probe.mjs --width 375 --height 812 tests/browser/popover-placement.js
//   node scripts/probe.mjs --width 812 --height 375 tests/browser/popover-placement.js
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const chip = document.querySelector(".chip");
  const pop = document.getElementById("numbers");
  const inside = () => {
    const r = pop.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, ok: r.top >= 15.5 && r.bottom <= innerHeight - 15.5 };
  };
  const out = {};
  // Chip near the bottom of the screen, then open
  const chipTop = chip.getBoundingClientRect().top + scrollY;
  scrollTo({ top: chipTop - innerHeight + 60, behavior: "instant" });
  await wait(150);
  chip.click();
  await wait(300);
  out.nearBottomOpen = inside();
  // Scroll while open: it must stay attached to the chip (or close), never float over other content
  scrollBy({ top: 120, behavior: "instant" });
  await wait(250);
  const c = chip.getBoundingClientRect(), r = pop.getBoundingClientRect(), h = r.height;
  const attached = Math.abs(r.bottom - (c.top - 8)) < 2 || Math.abs(r.top - (c.bottom + 8)) < 2;
  const noRoom = c.top - 8 - h < 16 && c.bottom + 8 + h > innerHeight - 16;
  out.followsOnScroll = { open: pop.matches(":popover-open"), attached, noRoom, ...inside(),
    ok: !pop.matches(":popover-open") || (inside().ok && (attached || noRoom)) };
  // Chip scrolled off screen → the popover closes instead of floating over other sections
  scrollBy({ top: innerHeight * 2, behavior: "instant" });
  await wait(250);
  out.closesWhenChipLeaves = { ok: !pop.matches(":popover-open") };
  if (pop.matches(":popover-open")) pop.hidePopover();
  return out;
})()
