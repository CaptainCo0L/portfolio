// Run JavaScript against the page in headless Chrome and print the results.
// For behaviour checks that a screenshot can't show (focus, aria, timings).
//
//   node scripts/probe.mjs --url http://localhost:8000/ --width 1440 checks.js
//
// checks.js is evaluated in the page; it must evaluate to a Promise (or value)
// that is JSON-serialisable. Exits 1 if the result contains `"ok":false`.

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
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
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
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
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 1024 });
  if (media) {
    const [name, value] = media.split("=");
    await send("Emulation.setEmulatedMedia", { features: [{ name, value }] });
  }
  await send("Page.navigate", { url });
  await sleep(2000);
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression: readFileSync(file, "utf8"),
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  const out = JSON.stringify(result.value, null, 2);
  console.log(out);
  failed = out.includes('"ok": false');
} finally {
  ws.close();
  chrome.kill();
}
process.exit(failed ? 1 : 0);
