/* ============================================================
   EDIT THIS FILE — everything on the page comes from here.
   Change a value, save, refresh the browser. No build step.
   ============================================================ */

const DATA = {
  name: "Aswin Sunil",
  wordmark: "Aswin Sunil",

  /* ---- Hero ---------------------------------------------- */
  headline: "Systematic detection, applied to security.",
  lede:
    "Three years automating tests against Fortune 500 applications at Aspire Systems — 250+ regression cases, defect leakage held under 2%. Now aiming that same discipline at SOC work: alert triage, SIEM, network traffic analysis.",

  /* ---- Contact (used in nav, hero, contact, ⌘K) ----------- */
  contact: {
    email: "aswinsunil8089@gmail.com",
    linkedin: "https://www.linkedin.com/in/aswin-sunil-07189b188",
    cv: "assets/Aswin-Sunil-CV.pdf", // drop your CV PDF at this path
    location: "Ernakulam, Kerala, India",
    timezone: "IST",
    // phone: "8301881343",  // uncomment to show publicly (invites spam)
  },
  status: "Open to SOC / security analyst roles",

  /* ---- Hero terminal (right card) -------------------------
     Each line: { prompt: true } renders a "$ " prefix.
     "typed: true" on ONE line gives it the one-shot type-in.  */
  terminal: {
    filename: "candidate-scan.sh",
    lines: [
      { prompt: true, text: "whoami" },
      { text: "aswin-sunil — qa automation → security" },
      { blank: true },
      { prompt: true, text: "./scan --self", typed: true },
      { ok: true,   text: "selenium · testng · junit — 3 yrs" },
      { ok: true,   text: "linux · windows vm · pcap capture" },
      { scan: true, text: "siem · alert triage — in progress" },
    ],
    chip: "OPEN TO WORK",
  },

  /* ---- Stat strip (all figures from cv.md — keep them real) */
  stats: [
    { value: "3",    unit: "yrs",  label: "QA engineering, Fortune 500 apps" },
    { value: "250+", unit: "",     label: "test cases automated" },
    { value: "60%",  unit: "",     label: "manual effort cut" },
    { value: "<2%",  unit: "",     label: "defect leakage rate" },
  ],

  /* ---- The route in (numbered phases) --------------------- */
  phases: [
    {
      num: "1.0",
      title: "Foundation",
      period: "2022 – 2023 · Aspire Systems",
      body:
        "Trainee to Associate Software Engineer. Built web application features against RESTful APIs for enterprise clients — learned how large systems fit together before learning how they break.",
      tags: ["REST APIs", "Web apps", "Enterprise"],
    },
    {
      num: "2.0",
      title: "Automation at scale",
      period: "2023 – 2026 · Aspire Systems",
      body:
        "Automated 250+ regression and functional cases with Selenium, TestNG and JUnit across 100+ modules on bi-weekly release cycles. Manual effort down 60%, QA cycles down 35%, defect leakage under 2%. Ran quarterly knowledge-sharing sessions for the QA team.",
      tags: ["Selenium", "TestNG", "JUnit", "100+ modules"],
    },
    {
      num: "3.0",
      title: "The pivot",
      period: "Offenso Academy · Blue Team event",
      body:
        "Prepared the technical environment for a Blue Team cybersecurity exercise — stood up the Windows VM and the pcap packet-capture file used for network traffic analysis. First hands-on security work; it confirmed the direction.",
      tags: ["Windows VM", "pcap", "Blue Team"],
    },
    {
      num: "4.0",
      title: "Target: SOC",
      period: "Now",
      body:
        "Hunting anomalies is the job I already do — the domain is changing, not the discipline. Building toward alert triage, SIEM operations and incident response, with an MCA (minor in AI) underneath it.",
      tags: ["Alert triage", "SIEM", "Incident response"],
    },
  ],

  /* ---- Fieldwork (dark band) — add new projects here ------ */
  projects: [
    {
      title: "Blue Team exercise — environment prep",
      org: "Offenso Academy",
      body:
        "Set up the Windows VM and prepared the pcap capture file for a Blue Team network-traffic-analysis exercise. The unglamorous half of security events: if the environment is wrong, nobody learns anything.",
      tags: ["Windows VM", "pcap", "network analysis"],
      link: "", // optional: URL to a write-up or repo
    },
    /* Add the next one like this:
    {
      title: "Home SIEM lab",
      org: "Personal lab",
      body: "What you did, in two sentences.",
      tags: ["Wazuh", "Sysmon"],
      link: "https://github.com/you/repo",
    },
    */
  ],

  /* ---- Toolbox (spec-sheet rows) --------------------------- */
  skills: [
    { domain: "Test automation", items: "Selenium WebDriver · TestNG · JUnit", note: "daily driver, 3 yrs" },
    { domain: "Testing practice", items: "Regression · smoke · exploratory · test strategy", note: "enterprise release cycles" },
    { domain: "Security",        items: "pcap analysis · Windows VM environments", note: "hands-on via Blue Team prep" },
    { domain: "Systems",         items: "Linux · Windows", note: "" },
    { domain: "Languages",       items: "Java · Python · C++ · JavaScript · HTML", note: "" },
    { domain: "Data",            items: "MySQL · PhpMyAdmin", note: "" },
  ],

  certs: [
    "Machine Learning — Internshala, 2021",
    "DevOps Fundamentals — Smartbridge, 2022",
    "Design Thinking — Smartbridge, 2022",
    "Agile Training Module — Smartbridge, 2022",
    "IBM Watson ML project — Smartbridge, 2022",
  ],

  education: [
    "MCA, minor in AI — Union Christian College Aluva, 2022",
    "BCA, minor in Banking — Chinmaya Vidhyapeet, 2020",
  ],

  /* ---- Contact section ------------------------------------- */
  contactHeading: "Hiring for a SOC seat?",
  contactBody:
    "Email is the fastest way to reach me. Based in Ernakulam (IST) — open to on-site, hybrid and remote. For roles in Europe, I'll need visa sponsorship and I say so upfront.",
};
