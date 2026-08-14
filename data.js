/* ============================================================
   EDIT THIS FILE — everything on the page comes from here.
   Change a value, save, refresh the browser. No build step.
   ============================================================ */

const DATA = {
  name: "Aswin Sunil",
  wordmark: "Aswin Sunil",

  /* ---- Hero ---------------------------------------------- */
  headline: "Three years reading the baseline. Now reading the alerts.",
  lede:
    "Three years of QA automation at Aspire Systems — 250+ regression cases against Fortune 500 applications, defect leakage held under 2%. Now seven labs into a security program at Offenso Academy, with a Wazuh SIEM running at home. Anomaly hunting is the job I already do. The domain is changing, not the discipline.",

  /* ---- Contact (used in nav, hero, contact) --------------- */
  contact: {
    email: "aswinsunil8089@gmail.com",
    linkedin: "https://www.linkedin.com/in/aswin-sunil-07189b188",
    cv: "assets/Aswin-Sunil-CV.pdf", // drop your CV PDF at this path
    location: "Ernakulam, Kerala, India",
    timezone: "IST",
    // phone: "8301881343",  // uncomment to show publicly (invites spam)
  },
  status: "Open to SOC / security analyst roles",

  /* ---- Readout rail under the signal band ------------------
     Figures come from the CV — keep them real.               */
  stats: [
    { value: "3",    unit: "yrs", label: "QA engineering, Fortune 500 apps" },
    { value: "250+", unit: "",    label: "test cases automated" },
    { value: "60%",  unit: "",    label: "manual effort cut" },
    { value: "<2%",  unit: "",    label: "defect leakage rate" },
  ],

  /* ---- The record -----------------------------------------
     Each entry is an event on the signal band above.
       flag:  true  → sodium, a turn in the story
              false → mint, steady baseline work
       mark:  0–1, where it sits on the band (left → right)   */
  phases: [
    {
      year: "2022",
      flag: false,
      mark: 0.05,
      title: "Foundation",
      period: "2022 – 2023 · Aspire Systems",
      body:
        "Trainee to Associate Software Engineer. Built web application features against RESTful APIs for enterprise clients — learned how large systems fit together before learning how they break.",
      tags: ["REST APIs", "Web apps", "Enterprise"],
    },
    {
      year: "2023",
      flag: false,
      mark: 0.28,
      title: "Automation at scale",
      period: "2023 – 2026 · Aspire Systems",
      body:
        "Automated 250+ regression and functional cases with Selenium, TestNG and JUnit across 100+ modules on bi-weekly release cycles. Manual effort down 60%, QA cycles down 35%, defect leakage under 2%. Ran quarterly knowledge-sharing sessions for the QA team.",
      tags: ["Selenium", "TestNG", "JUnit", "100+ modules"],
    },
    {
      year: "2025",
      flag: true,
      mark: 0.71,
      title: "First security work",
      period: "Offenso Academy · Blue Team exercise",
      body:
        "Prepared the technical environment for a Blue Team cybersecurity exercise — stood up the Windows VM and the pcap packet-capture file used for network traffic analysis. First hands-on security work; it confirmed the direction.",
      tags: ["Windows VM", "pcap", "Blue Team"],
    },
    {
      year: "Now",
      flag: true,
      mark: 0.94,
      title: "Retraining for SOC",
      period: "Jun 2026 – Nov 2026 · Offenso Academy",
      body:
        "Five-month cybersecurity program, in progress. Seven labs done so far across SOC fundamentals and network packet analysis. The detection instinct transferred; the tooling is what I'm here to learn.",
      tags: ["SOC fundamentals", "Packet analysis", "7 labs"],
    },
  ],

  /* ---- Fieldwork — add new security work here ------------- */
  projects: [
    {
      title: "Home lab — Wazuh SIEM",
      org: "Self-hosted · ongoing",
      body:
        "Wazuh 4.14.6 deployed and ingesting from Windows Server and Windows 10 endpoints, with a Kali box generating the traffic worth alerting on. Reading your own alerts is a different skill from reading someone else's slides.",
      tags: ["Wazuh", "SIEM", "Log ingestion", "Kali"],
      link: "",
    },
    {
      title: "Boot2root machines — 6 rooted",
      org: "Home lab · Jul–Aug 2026",
      body:
        "CryptoBank, GreenOptic, HF2019-Linux, Metasploitable, pwnlab and SickOS, all rooted on the same lab network Wazuh is watching. Attacking a box teaches you what the alert should have looked like.",
      tags: ["Privilege escalation", "Enumeration", "Kali"],
      link: "",
    },
    {
      title: "Security program labs — 7 completed",
      org: "Offenso Academy · Jun 2026 – present",
      body:
        "Seven hands-on labs so far in a five-month program, covering SOC fundamentals and network packet analysis. Ongoing — this entry gets split into individual labs as the write-ups go up.",
      tags: ["SOC fundamentals", "Packet analysis"],
      link: "",
    },
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
  fieldworkNote: "Both sides of the wire. This section grows as the labs do.",

  /* ---- Toolbox (spec-sheet rows) -------------------------- */
  skills: [
    { domain: "Test automation", items: "Selenium WebDriver · TestNG · JUnit", note: "daily driver, 3 yrs" },
    { domain: "Testing practice", items: "Regression · smoke · exploratory · test strategy", note: "enterprise release cycles" },
    { domain: "Security",        items: "Wazuh SIEM · log ingestion · SOC fundamentals · packet/network traffic analysis", note: "self-hosted lab + 7 labs, Offenso" },
    { domain: "Offensive practice", items: "Privilege escalation · enumeration · exploitation", note: "6 boot2root machines rooted" },
    { domain: "Lab",             items: "Kali · Windows Server · Windows 10 · Windows VM environments", note: "attacker and target hosts" },
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

  /* ---- Contact section ------------------------------------ */
  contactHeading: "Hiring for a SOC seat?",
  contactBody:
    "Email is the fastest way to reach me. Based in Ernakulam (IST) — open to on-site, hybrid and remote. For roles in Europe I need visa sponsorship, and I'd rather say that now than in week three.",
};
