/* Turns DATA (data.js) into the HTML that build.mjs writes into index.html.
   Every string from DATA goes through esc(); nothing here touches the DOM. */

import { ILLUSTRATIONS } from "./illustrations.mjs";

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const tags = (list) => `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

/* ---------- Head: title, description, previews, structured data ---------- */
const TITLE = "Aswin Sunil — The story so far · QA to security";
const DESCRIPTION =
  "Aswin Sunil from Kochi: college, three years of QA automation that changed direction, a reset, and the turn into security — plus football, games and a home lab.";
const LANGUAGES = ["English", "Malayalam", "Tamil", "Hindi"];

export function renderHead(data, site) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    url: site.url,
    description: data.lede,
    sameAs: [data.contact.linkedin],
    address: { "@type": "PostalAddress", addressLocality: data.contact.location.split(",")[0] },
    knowsAbout: data.skills.map((s) => s.domain),
    knowsLanguage: LANGUAGES,
  };
  // "<" escaped so no string in DATA can close the script element early.
  const jsonLd = JSON.stringify(person).replace(/</g, "\\u003c");
  return [
    `<title>${esc(TITLE)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}" />`,
    `<link rel="canonical" href="${esc(site.url)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${esc(TITLE)}" />`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}" />`,
    `<meta property="og:url" content="${esc(site.url)}" />`,
    `<meta property="og:image" content="${esc(site.ogImage)}" />`,
    `<meta property="og:image:alt" content="${esc(data.name + " — " + data.headline)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join("\n  ");
}

/* ---------- Hero ---------- */
function renderHero(data) {
  return `<h1 class="hero__headline" id="hero-headline">${esc(data.headline)}</h1>
        <div class="hero__row">
          <p class="hero__lede" id="hero-lede">${esc(data.lede)}</p>
          <div class="hero__actions">
            <a class="btn" id="hero-cv" href="${esc(data.contact.cv)}" download>Download CV</a>
            <a class="quiet" id="hero-linkedin" href="${esc(data.contact.linkedin)}" rel="me noopener" target="_blank">LinkedIn</a>
          </div>
        </div>`;
}

/* ---------- "By the numbers" (popover on one stage) ---------- */
export const renderNumbers = (numbers) =>
  numbers
    .map(
      (s) => `<div>
            <dt>${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</dt>
            <dd>${esc(s.label)}</dd>
          </div>`
    )
    .join("");

/* ---------- The story: a vertical timeline ----------
   The line is grey until the first turning point and blue from there on,
   so every stage at or after it gets .is-after-turn. Turning points also
   say so in words — colour is never the only signal. */
export function renderStory(stages, numbers) {
  const firstTurn = stages.findIndex((s) => s.turn);
  return stages
    .map((st, i) => {
      const cls = ["stage"];
      if (st.turn) cls.push("is-turn");
      if (firstTurn !== -1 && i >= firstTurn) cls.push("is-after-turn");
      if (st.future) cls.push("is-future");
      const popover = st.numbers
        ? `<button class="chip" type="button" popovertarget="numbers">By the numbers</button>
          <div id="numbers" class="numbers" popover aria-label="${esc(st.title)}, by the numbers">
            <dl>${renderNumbers(numbers)}</dl>
          </div>`
        : "";
      return `<li class="${cls.join(" ")}" id="stage-${esc(st.id)}" tabindex="-1">
        <div class="stage__when">
          ${st.years ? `<span class="stage__years">${esc(st.years)}</span>` : ""}
          ${st.turn ? `<span class="stage__turn">Turning point</span>` : ""}
        </div>
        <span class="stage__node" aria-hidden="true"></span>
        <div class="stage__body">
          <h3>${esc(st.title)}</h3>
          ${st.place ? `<p class="stage__place">${esc(st.place)}</p>` : ""}
          ${st.body.map((p) => `<p>${esc(p)}</p>`).join("\n          ")}
          ${st.tags && st.tags.length ? tags(st.tags) : ""}
          ${popover}
          ${st.link ? `<p class="stage__link"><a class="quiet" href="${esc(st.link.href)}">${esc(st.link.text)}</a></p>` : ""}
        </div>
      </li>`;
    })
    .join("");
}

/* ---------- Off the clock ---------- */
export const renderOffClock = (items) =>
  items
    .map(
      (o) => `<li class="off__item">${ILLUSTRATIONS[o.icon] || ""}<h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></li>`
    )
    .join("");

/* ---------- Fieldwork ---------- */
export const renderProjects = (projects) =>
  projects
    .map(
      (pr) => `<article class="case">
        <span class="case__org">${esc(pr.org)}</span>
        <h3>${esc(pr.title)}</h3>
        <p>${esc(pr.body)}</p>
        ${tags(pr.tags)}
        ${pr.link ? `<p style="margin-top:var(--space-md)"><a class="quiet" href="${esc(pr.link)}" target="_blank" rel="noopener">Read the write-up</a></p>` : ""}
      </article>`
    )
    .join("");

/* ---------- Toolbox ---------- */
export const renderSkills = (skills) =>
  skills
    .map(
      (row) => `<tr>
        <th scope="row">${esc(row.domain)}</th>
        <td>${esc(row.items)}</td>
        <td>${esc(row.note)}</td>
      </tr>`
    )
    .join("");

export const renderList = (items) => items.map((e) => `<li>${esc(e)}</li>`).join("");

/* ---------- Contact + footer ---------- */
export const renderContactMeta = (c) =>
  `${c.email} · ${c.location} (${c.timezone})` + (c.phone ? ` · ${c.phone}` : "");

function renderContact(data) {
  const c = data.contact;
  return `<h2 id="contact-heading">${esc(data.contactHeading)}</h2>
        <p class="contact__body" id="contact-body">${esc(data.contactBody)}</p>
        <div class="hero__actions">
          <a class="btn" id="contact-email" href="mailto:${esc(c.email)}">Email me</a>
          <a class="btn btn--ghost" id="contact-cv" href="${esc(c.cv)}" download>Download CV</a>
          <a class="quiet" id="contact-linkedin" href="${esc(c.linkedin)}" rel="me noopener" target="_blank">LinkedIn</a>
        </div>
        <p class="contact__meta caption" id="contact-meta">${esc(renderContactMeta(c))}</p>`;
}

// The year is filled in by app.js; baking it in would make the build stale every January.
const renderFoot = (data) =>
  `© <span id="foot-year"></span>${esc(data.name)} · ${esc(data.contact.location)} · ${esc(data.contact.timezone)}`;

/* ---------- Everything, keyed by index.html marker name ---------- */
export function renderSections(data, site) {
  return {
    head: renderHead(data, site),
    "nav-status": esc(data.status),
    hero: renderHero(data),
    story: renderStory(data.stages, data.numbers),
    "off-clock": renderOffClock(data.offClock),
    projects: renderProjects(data.projects),
    "fieldwork-note": esc(data.fieldworkNote),
    skills: renderSkills(data.skills),
    education: renderList(data.education),
    certs: renderList(data.certs),
    contact: renderContact(data),
    foot: renderFoot(data),
  };
}
