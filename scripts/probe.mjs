// Run JavaScript against the page in headless Chrome and print the results.
// For behaviour checks that a screenshot can't show (focus, aria, timings).
//
//   node scripts/probe.mjs --url http://localhost:8000/ --width 1440 checks.js
//
// checks.js is evaluated in the page; it must evaluate to a Promise (or value)
// that is JSON-serialisable. Exits 1 if the result contains `"ok":false`.

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
};
const url = arg("--url", "http://localhost:8000/");
const width = Number(arg("--width", "1440"));
const height = Number(arg("--height", "900"));
const media = arg("--media", ""); // e.g. "prefers-reduced-motion=reduce"
const shot = arg("--shot", "");   // optional: save a PNG of the viewport after the checks
const key = arg("--key", "");     // optional: press a real key (e.g. Escape) after the checks…
const after = arg("--after", ""); // …then evaluate this second check file
const tabs = Number(arg("--tabs", "0")); // optional: real keyboard walk — press Tab N times, record focus
const file = process.argv[process.argv.length - 1];

const port = 9334;
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(tmpdir(), "portfolio-probe-cdp")}`,
  "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let nextId = 1;
const pending = new Map();
const problems = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.method === "Runtime.exceptionThrown") problems.push("exception: " + msg.params.exceptionDetails.exception?.description);
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") problems.push("console.error: " + msg.params.args.map((a) => a.value ?? a.description).join(" "));
  if (msg.method === "Network.responseReceived" && msg.params.response.status >= 400) problems.push(`HTTP ${msg.params.response.status}: ${msg.params.response.url}`);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

let failed = false;
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  // Headless pages aren't focused, so :focus-visible never matches without this.
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 1024 });
  if (media) {
    const [name, value] = media.split("=");
    await send("Emulation.setEmulatedMedia", { features: [{ name, value }] });
  }
  await send("Page.navigate", { url });
  await sleep(2000);
  const evaluate = async (path) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression: readFileSync(path, "utf8"),
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
    return result.value;
  };
  const value = { checks: await evaluate(file) };
  if (key) {
    for (const type of ["keyDown", "keyUp"]) {
      await send("Input.dispatchKeyEvent", { type, key, code: key, windowsVirtualKeyCode: key === "Escape" ? 27 : key === "Tab" ? 9 : 0 });
    }
    await sleep(300);
  }
  if (after) value.after = await evaluate(after);
  if (tabs) {
    const walk = [];
    for (let i = 0; i < tabs; i++) {
      for (const type of ["keyDown", "keyUp"]) {
        await send("Input.dispatchKeyEvent", { type, key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      }
      await sleep(60);
      const { result } = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => { const el = document.activeElement; const cs = getComputedStyle(el);
          return { el: (el.id ? "#" + el.id : el.className || el.tagName) + " " + (el.textContent || "").trim().slice(0, 24),
                   ring: el.matches(":focus-visible") && cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 }; })()`,
      });
      walk.push(result.value);
    }
    value.keyboardWalk = { stops: walk.map((w) => (w.ring ? "" : "NO RING ") + w.el), ok: walk.every((w) => w.ring) };
  }
  value.pageProblems = { list: problems, ok: problems.length === 0 };
  const out = JSON.stringify(value, null, 2);
  console.log(out);
  if (shot) {
    const png = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(shot, Buffer.from(png.data, "base64"));
  }
  failed = out.includes('"ok": false');
} finally {
  ws.close();
  chrome.kill();
}
process.exit(failed ? 1 : 0);
