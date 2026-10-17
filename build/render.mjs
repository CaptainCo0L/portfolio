/* Turns DATA (data.js) into the HTML that build.mjs writes into index.html.
   Every string from DATA goes through esc(); nothing here touches the DOM. */

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const tags = (list) => `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

/* ---------- Head: title, description, previews, structured data ---------- */
const TITLE = "Aswin Sunil — SOC Analyst Candidate · QA Automation";
const DESCRIPTION =
  "QA automation engineer moving into SOC analyst work: 3 years on Fortune 500 apps, 250+ automated tests, a Wazuh SIEM home lab and 6 rooted boot2root boxes.";

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

/* ---------- Readout rail ---------- */
export const renderStats = (stats) =>
  stats
    .map(
      (s) => `<div>
        <dt>${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</dt>
        <dd>${esc(s.label)}</dd>
      </div>`
    )
    .join("");

/* ---------- The record ---------- */
export const renderPhases = (phases) =>
  phases
    .map(
      (ph, i) => `<li${ph.flag ? ` class="is-flagged"` : ""} id="event-${i}" tabindex="-1">
        <div class="when">
          ${esc(ph.year)}
          <span class="class">${ph.flag ? "Flagged" : "Baseline"}</span>
        </div>
        <div>
          <h3>${esc(ph.title)}</h3>
          <span class="period">${esc(ph.period)}</span>
          <p>${esc(ph.body)}</p>
          ${tags(ph.tags)}
        </div>
      </li>`
    )
    .join("");

/* ---------- Signal band ----------
   One bar per slot. Routine work draws a short tick; each phase draws a tall
   bar you can click. Deterministic, so the build output is stable. */
export function renderBand(phases, slots = 168) {
  // Deterministic wobble, so the trace looks sampled rather than random.
  const noise = (i) => {
    const v = Math.sin(i * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };

  // Nearest free slot for each phase mark: look right first, then left,
  // so a mark at the far edge can't be pushed off the end.
  const flagAt = new Map();
  phases.forEach((ph, i) => {
    const want = Math.min(slots - 1, Math.max(0, Math.round(ph.mark * (slots - 1))));
    let slot = want;
    while (flagAt.has(slot) && slot < slots - 1) slot += 1;
    if (flagAt.has(slot)) {
      slot = want;
      while (flagAt.has(slot) && slot > 0) slot -= 1;
    }
    flagAt.set(slot, { phase: ph, index: i });
  });

  let html = "";
  for (let i = 0; i < slots; i++) {
    const delay = `${+(i * 2.5).toFixed(1)}ms`;
    const flag = flagAt.get(i);
    if (flag) {
      const on = flag.phase.flag;
      html += `<button class="flagbtn${on ? "" : " flagbtn--base"}" type="button"
          style="height:${on ? 100 : 72}%;--d:${delay}"
          data-event="${flag.index}"
          aria-label="${esc(flag.phase.year)} — ${esc(flag.phase.title)}. ${on ? "Flagged" : "Baseline"}. Jump to this entry.">
          <span class="flag__label">${esc(flag.phase.year)}</span>
        </button>`;
    } else {
      // Baseline sits low; a slow swell through the middle years reads as volume.
      const swell = Math.sin((i / slots) * Math.PI) * 8;
      const h = 10 + swell + noise(i) * 16;
      html += `<span class="tick" aria-hidden="true"
          style="height:${h.toFixed(1)}%;--d:${delay}"></span>`;
    }
  }
  return html;
}

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
        <p class="contact__meta mono" id="contact-meta">${esc(renderContactMeta(c))}</p>`;
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
    stats: renderStats(data.stats),
    band: renderBand(data.phases),
    phases: renderPhases(data.phases),
    projects: renderProjects(data.projects),
    "fieldwork-note": esc(data.fieldworkNote),
    skills: renderSkills(data.skills),
    education: renderList(data.education),
    certs: renderList(data.certs),
    contact: renderContact(data),
    foot: renderFoot(data),
  };
}
