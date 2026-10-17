/* Line illustrations for "Off the clock", inlined into the page at build time.
   One monoline set on a 24-unit grid (like SF Symbols): 1.5px strokes in
   currentColor, one detail per drawing marked .accent for the blue.
   Decorative — every svg is aria-hidden; the text next to it carries the meaning. */

const svg = (body) =>
  `<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const ILLUSTRATIONS = {
  // Ball: a pentagon panel with seams running out to the edge.
  football: svg(
    `<circle cx="12" cy="12" r="9"/>` +
    `<path class="accent" d="M12 8.6l3.2 2.3-1.2 3.8h-4l-1.2-3.8z"/>` +
    `<path d="M12 8.6V3M15.2 10.9l5.4-1.8M14 14.7l3.3 4.6M10 14.7l-3.3 4.6M8.8 10.9L3.4 9.1"/>`
  ),
  // Gamepad: d-pad on the left, two buttons on the right.
  controller: svg(
    `<path d="M7.2 8h9.6a4 4 0 0 1 3.9 3.1l1 4.6a2.5 2.5 0 0 1-4.3 2.2L15.5 16h-7l-1.9 1.9a2.5 2.5 0 0 1-4.3-2.2l1-4.6A4 4 0 0 1 7.2 8z"/>` +
    `<path d="M7.5 10.8v3.4M5.8 12.5h3.4"/>` +
    `<circle class="accent" cx="15.6" cy="11.6" r=".8"/><circle class="accent" cx="17.6" cy="13.4" r=".8"/>`
  ),
  // Home lab: two rack units with status lights.
  server: svg(
    `<rect x="3.5" y="4" width="17" height="7" rx="2"/><rect x="3.5" y="13" width="17" height="7" rx="2"/>` +
    `<path d="M12 7.5h4.5M12 16.5h4.5"/>` +
    `<circle class="accent" cx="7.5" cy="7.5" r=".9"/><circle class="accent" cx="7.5" cy="16.5" r=".9"/>`
  ),
  // Acoustic guitar: round body, sound hole, neck and head.
  guitar: svg(
    `<circle cx="8.5" cy="15.5" r="5"/>` +
    `<circle class="accent" cx="8.5" cy="15.5" r="1.4"/>` +
    `<path d="M12 12l7-7M17.6 3.6l2.8 2.8M6.4 17.6l2.1-2.1"/>`
  ),
  // Ringed planet and a small star.
  planet: svg(
    `<circle cx="11" cy="13" r="5"/>` +
    `<ellipse class="accent" cx="11" cy="13" rx="9.5" ry="3.2" transform="rotate(-20 11 13)"/>` +
    `<path d="M19.5 3v3M18 4.5h3"/>`
  ),
  // Dumbbell.
  dumbbell: svg(
    `<path class="accent" d="M7.5 12h9"/>` +
    `<rect x="4.5" y="7.5" width="3" height="9" rx="1"/><rect x="16.5" y="7.5" width="3" height="9" rx="1"/>` +
    `<path d="M2.5 10.5v3M21.5 10.5v3"/>`
  ),
  // Quiet place: two peaks and a sun.
  mountain: svg(
    `<path d="M2.5 19.5l6.5-10 4.2 6 2.6-3.6 5.7 7.6z"/>` +
    `<circle class="accent" cx="17" cy="6" r="2"/>`
  ),
  // Languages: two speech bubbles.
  speech: svg(
    `<path d="M4.5 4.5h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3.5 3v-3h-1a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>` +
    `<path class="accent" d="M18 9.5h1.5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5v2.8l-3.2-2.8H13a2 2 0 0 1-2-2v-.3"/>`
  ),
};
