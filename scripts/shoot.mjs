// Screenshots at the three target viewports, light and dark, via the Chrome
// DevTools Protocol. Headless window sizing can't go below ~500px on Windows,
// so viewports are emulated instead.
//
//   node scripts/shoot.mjs --url http://localhost:8000/ --out qa/after [--reduced-motion]
//
//   node scripts/shoot.mjs --url http://localhost:8000/ --out qa/nojs --no-js
//
// Writes <out>/<w>x<h>-<scheme>.png (viewport) and <out>/<w>x<h>-<scheme>-full.png
// (whole page), and prints scrollWidth per shot so horizontal overflow shows up.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIEWPORTS = [
  { w: 375, h: 812, mobile: true },
  { w: 768, h: 1024, mobile: true },
  { w: 1440, h: 900, mobile: false },
];
const SCHEMES = ["light", "dark"];

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
};
const url = arg("--url", "http://localhost:8000/");
const out = arg("--out");
const reducedMotion = process.argv.includes("--reduced-motion");
const noJs = process.argv.includes("--no-js");
if (!out) {
  console.error("usage: node scripts/shoot.mjs --url <url> --out <dir> [--reduced-motion] [--no-js]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const port = 9333;
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(tmpdir(), "portfolio-shoot-cdp")}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocketUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome DevTools endpoint did not come up");
}

const ws = new WebSocket(await pageSocketUrl());
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

await send("Page.enable");
// Always fetch fresh files — a cached app.js from an older build once broke the trace here.
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
// Page scripts off; Runtime.evaluate below still works for measuring.
if (noJs) await send("Emulation.setScriptExecutionDisabled", { value: true });
try {
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile,
      });
      await send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-color-scheme", value: scheme },
          { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
        ],
      });
      await send("Page.navigate", { url });
      await sleep(2500); // load + draw-in + reveals settle

      const { result } = await send("Runtime.evaluate", {
        expression: "JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight})",
        returnByValue: true,
      });
      const m = JSON.parse(result.value);
      const base = join(out, `${vp.w}x${vp.h}-${scheme}`);

      const shot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(`${base}.png`, Buffer.from(shot.data, "base64"));

      // Scroll through once so one-shot reveals fire, then capture the whole page.
      // (Skipped without JS: there are no reveals, and page timers never fire.)
      if (!noJs) {
        await send("Runtime.evaluate", {
          expression: "(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0)})()",
          awaitPromise: true,
        });
        await sleep(700);
      }
      const full = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: vp.w, height: m.h, scale: 1 },
      });
      writeFileSync(`${base}-full.png`, Buffer.from(full.data, "base64"));

      const overflow = m.sw > m.iw ? `  OVERFLOW (scrollWidth ${m.sw} > ${m.iw})` : "";
      console.log(`${vp.w}x${vp.h}-${scheme}: innerWidth ${m.iw}, page height ${m.h}${overflow}`);
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
