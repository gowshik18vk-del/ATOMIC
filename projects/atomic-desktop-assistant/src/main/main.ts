import { app, BrowserWindow, ipcMain, shell, Notification, globalShortcut, session, dialog, IpcMainInvokeEvent } from "electron";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { execFile } from "node:child_process";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { TimerStore } from "../timers/store";
import { Registry, Permission, Ctx } from "../tools/registry";
import { runTurn, verifyModel } from "../agent/claude";
import { listVoices } from "../voice/elevenlabs";
dotenv.config();
const PERMS = ["openWebsite", "launchApps", "notes", "timers", "microphone"];
let win: BrowserWindow;
const history: Anthropic.MessageParam[] = [];
const data = () => app.getPath("userData");
const readJson = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(path.join(data(), f), "utf8")); } catch { return d; } };
const writeJson = (f: string, v: unknown) => fs.writeFileSync(path.join(data(), f), JSON.stringify(v, null, 2));
const clean = (e: unknown) => String((e as Error)?.message ?? e).replace(/(sk-|xi-)[\w-]+/g, "[redacted]").slice(0, 200);
function handle(ch: string, fn: (...a: any[]) => Promise<unknown> | unknown) {
  ipcMain.handle(ch, (e: IpcMainInvokeEvent, ...a) => {
    if (e.sender !== win.webContents || !e.senderFrame?.url.startsWith("file://")) throw new Error("Untrusted sender");
    return fn(...a);
  });
}
app.whenReady().then(() => {
  const timers = new TimerStore(path.join(data(), "timers.json"));
  const perms = () => readJson<Record<string, boolean>>("permissions.json", {});
  const ctx: Ctx = {
    timers, notesDir: path.join(data(), "notes"),
    granted: (p: Permission) => perms()[p] === true,
    confirm: async m => (await dialog.showMessageBox(win, { type: "question", buttons: ["Allow", "Cancel"], defaultId: 1, cancelId: 1, message: m })).response === 0,
    openExternal: u => shell.openExternal(u),
    launch: p => new Promise((res, rej) => { execFile(p, [], () => {}).once("spawn", () => res()).once("error", rej); }),
    get apps() { return readJson<Record<string, string>>("apps.json", {}); },
  };
  const reg = new Registry(ctx);
  win = new BrowserWindow({ width: 1280, height: 800, backgroundColor: "#0a0f1a", webPreferences: {
    preload: path.join(__dirname, "../preload/preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", e => e.preventDefault());
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === "media" && perms().microphone === true));
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
  const key = process.env.ANTHROPIC_API_KEY, model = process.env.ATOMIC_CLAUDE_MODEL, xi = process.env.ELEVENLABS_API_KEY;
  const client = key ? new Anthropic({ apiKey: key }) : null;
  handle("chat:send", async (text: string) => {
    if (!client || !model) return { ok: false, error: "Claude isn't configured. Set ANTHROPIC_API_KEY and ATOMIC_CLAUDE_MODEL." };
    try { history.push({ role: "user", content: String(text).slice(0, 4000) }); return { ok: true, text: await runTurn(client, model, history, reg) }; }
    catch (e) { return { ok: false, error: clean(e) }; }
  });
  handle("status:check", async () => {
    const out: any = { claude: { ok: false, detail: "Not configured" }, elevenlabs: { ok: false, detail: "Not configured" } };
    if (client && model) { try { await verifyModel(client, model); out.claude = { ok: true, detail: model }; } catch (e) { out.claude = { ok: false, detail: clean(e) }; } }
    if (xi) { try { out.elevenlabs = { ok: true, detail: `${(await listVoices(xi)).length} voices` }; } catch (e) { out.elevenlabs = { ok: false, detail: clean(e) }; } }
    return out;
  });
  let prev = os.cpus();
  handle("stats:get", () => {
    const cur = os.cpus(); let idle = 0, total = 0;
    cur.forEach((c, i) => { const p = prev[i]; total += Object.values(c.times).reduce((a, b) => a + b, 0) - Object.values(p.times).reduce((a, b) => a + b, 0); idle += c.times.idle - p.times.idle; });
    prev = cur;
    return { cpu: total ? Math.round(100 * (1 - idle / total)) : 0, mem: Math.round(100 * (1 - os.freemem() / os.totalmem())) };
  });
  handle("timers:list", () => timers.list());
  handle("voices:list", async () => { if (!xi) return { ok: false, error: "ELEVENLABS_API_KEY not set." }; try { return { ok: true, voices: await listVoices(xi) }; } catch (e) { return { ok: false, error: clean(e) }; } });
  handle("perm:get", () => { const p = perms(); return PERMS.map(n => ({ name: n, granted: p[n] === true })); });
  handle("perm:set", (n: string, v: boolean) => { if (!PERMS.includes(n)) throw new Error("Unknown permission"); writeJson("permissions.json", { ...perms(), [n]: v }); return true; });
  setInterval(() => timers.completeDue().forEach(t => {
    new Notification({ title: "Atomic", body: `${t.label} is done` }).show();
    win.webContents.send("timer:done", t.label);
  }), 1000);
  globalShortcut.register("Control+Alt+Space", () => { win.show(); win.focus(); });
});
app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());
