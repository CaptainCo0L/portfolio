/* ============================================================
   EDIT THIS FILE — everything on the page comes from here.
   Change a value, save, then run `node build/build.mjs`.
   ============================================================ */

const DATA = {
  name: "Aswin Sunil",
  wordmark: "Aswin Sunil",

  /* ---- Hero ---------------------------------------------- */
  headline: "Not a straight line. A few good turns.",
  lede:
    "I'm Aswin. I've lived my whole life in Kochi. This page is the story so far: college, three years testing software that changed my direction, a pause to reset, and the turn into security. Football, games and a home lab fill in the gaps.",

  /* ---- Contact (used in nav, hero, contact) --------------- */
  contact: {
    email: "aswinsunil8089@gmail.com",
    linkedin: "https://www.linkedin.com/in/aswin-sunil-07189b188",
    cv: "assets/Aswin-Sunil-CV.pdf", // drop your CV PDF at this path
    location: "Kochi, Kerala, India",  // city level only — never more exact
    timezone: "IST",
    // phone: "",  // fill in to show publicly (invites spam)
  },
  status: "Open to SOC / security analyst roles",

  /* ---- The story -------------------------------------------
     One entry per stage, oldest first. On the page it's a vertical
     timeline whose line is grey until the first turning point, then blue.
       turn:    true  → a turning point (blue node + "Turning point")
       future:  true  → hasn't happened yet (dashed line, hollow node)
       numbers: true  → shows the "By the numbers" popover (one stage only)
       body:    one string per paragraph                               */
  stages: [
    {
      id: "college",
      years: "2017 – 2020",
      title: "College",
      place: "BCA · Chinmaya Vidhyapeet",
      body: [
        "I came in good at maths, science and computers — less so at languages — and shy. Chinmaya is where the shy part changed. Somewhere in those three years I stopped being the quiet one.",
      ],
      tags: ["Maths", "Science", "Computers", "Football"],
    },
    {
      id: "postgrad",
      years: "2020 – 2022",
      title: "Postgrad",
      place: "MCA, minor in AI · Union Christian College, Aluva",
      body: [
        "Honest answer: I didn't choose computer applications with a grand plan. It was what I was good at, so I kept going — and it got me to the door of my first job.",
      ],
      tags: ["MCA", "AI minor"],
    },
    {
      id: "aspire",
      years: "2022 – 2026",
      title: "Aspire Systems",
      place: "Trainee → Associate Software Engineer",
      turn: true,
      numbers: true,
      body: [
        "I started as a trainee building web features against REST APIs, then moved into testing — and testing changed my whole career path. Three years of regression suites on Fortune 500 applications taught me to read what “normal” looks like, so I'd notice when something wasn't.",
        "I was good at it. I wasn't enjoying it. And one lesson had nothing to do with code: network more — the people you know matter more than I'd assumed.",
      ],
      tags: ["Selenium", "TestNG", "JUnit", "100+ modules"],
    },
    {
      id: "pause",
      years: "Jan – Jun 2026",
      title: "The pause",
      place: "",
      body: [
        "After Aspire I stepped away. Mostly a detox: clearing my head and getting ready for security training.",
      ],
    },
    {
      id: "security",
      years: "Jun 2026 – now",
      title: "Security",
      place: "Offenso Academy · home lab",
      turn: true,
      body: [
        "Testing felt like the step before. Security felt like the next one. A five-month program at Offenso Academy, seven labs so far, a Wazuh SIEM watching my own home network, six boot2root machines rooted, and web exploitation on CMU's CyLab track. The detection instinct carried over; the tooling is what I'm here to learn.",
      ],
      tags: ["SOC fundamentals", "Wazuh", "Packet analysis", "Burp Suite"],
      link: { href: "#fieldwork", text: "See the fieldwork" },
    },
    {
      id: "next",
      years: "",
      title: "Next",
      place: "",
      future: true,
      body: [
        "A seat in a SOC — that's the plan everything above is pointing at. And Spanish — still in progress.",
      ],
    },
  ],

  /* ---- "By the numbers" (popover on the Aspire stage) ------
     Figures come from the CV — keep them real.               */
  numbers: [
    { value: "3",    unit: "yrs", label: "QA engineering, Fortune 500 apps" },
    { value: "250+", unit: "",    label: "test cases automated" },
    { value: "60%",  unit: "",    label: "manual effort cut" },
    { value: "<2%",  unit: "",    label: "defect leakage rate" },
  ],

  /* ---- Off the clock --------------------------------------
     icon: football · controller · server · guitar · planet ·
           dumbbell · mountain · speech  (see build/illustrations.mjs) */
  offClock: [
    { icon: "football",   title: "Football",          text: "I play, and I watch every FC Barcelona match." },
    { icon: "controller", title: "Gaming, since 2014", text: "FIFA, GTA V, Need for Speed: Most Wanted, Crysis." },
    { icon: "server",     title: "The home lab",      text: "The thing I'm proudest of: TrueNAS, Pi-hole, and a Wazuh SIEM that watches it all." },
    { icon: "guitar",     title: "Guitar",            text: "Learned for a year; still pick it up now and then." },
    { icon: "planet",     title: "Astrophysics",      text: "Not much of a reader, but Neil deGrasse Tyson's two in a Hurry books stuck." },
    { icon: "dumbbell",   title: "Getting stronger",  text: "Underweight most of my life; morning gym since 2024, and my weight's where it should be now." },
    { icon: "mountain",   title: "Travel",            text: "A city kid who goes looking for quiet places; mostly within Kerala so far, a few trips beyond." },
    { icon: "speech",     title: "Languages",         text: "English, Malayalam, Tamil, Hindi. Spanish: in progress." },
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
      title: "Web exploitation — CyLab Academy & picoCTF",
      org: "Self-directed · Jul 2026",
      body:
        "Seven challenges on CMU CyLab Academy's web track: request interception in Burp, source and include-file disclosure, content discovery, path traversal and 403 bypass, and client-side auth bypass including JWT forging. Plus recursive directory enumeration against picoCTF targets with feroxbuster, and steghide/stegseek on the steganography side. Every one of these leaves something in a log worth alerting on.",
      tags: ["Burp Suite", "Path traversal", "JWT", "feroxbuster", "steghide"],
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
    { domain: "Web exploitation", items: "Burp Suite · path traversal · content discovery · client-side auth bypass · feroxbuster", note: "CyLab Academy web track, 7 solved" },
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
  contactHeading: "Say hello.",
  contactBody:
    "Email is the fastest way to reach me. Based in Ernakulam (IST) — open to on-site, hybrid and remote. For roles in Europe I need visa sponsorship, and I'd rather say that now than in week three.",
};
