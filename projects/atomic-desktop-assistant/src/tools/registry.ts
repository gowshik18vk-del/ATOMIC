import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { TimerStore } from "../timers/store";
import { parseClock, parseDuration } from "../timers/parse";
import * as S from "../shared/schemas";
export type Permission = "openWebsite" | "launchApps" | "notes" | "timers";
export interface Ctx {
  timers: TimerStore; granted: (p: Permission) => boolean; confirm: (message: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<void>; launch: (exePath: string) => Promise<void>;
  apps: Record<string, string>; notesDir: string; now?: () => Date;
}
export type ToolResult = { ok: boolean; [k: string]: unknown };
interface Tool { name: string; description: string; schema: z.ZodType<any>; perm: Permission; confirmMsg?: (a: any) => string | null; run: (a: any, c: Ctx) => Promise<ToolResult>; }
export function normalizeUrl(raw: string): URL | null {
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "https://" + raw);
    if (u.protocol !== "https:" || !u.hostname.includes(".") || u.username || u.password) return null;
    return u;
  } catch { return null; }
}
const fmt = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}m ${s % 60}s`; };
const tools: Tool[] = [
  { name: "open_website", description: "Open an https website in the user's default browser.", schema: S.OpenWebsiteArgs, perm: "openWebsite",
    run: async (a, c) => { const u = normalizeUrl(a.url); if (!u) return { ok: false, error: "Only valid https URLs with a real hostname are allowed." }; await c.openExternal(u.href); return { ok: true, opened: u.href }; } },
  { name: "launch_app", description: "Launch an application from Atomic's registry of approved apps.", schema: S.LaunchAppArgs, perm: "launchApps",
    run: async (a, c) => {
      const key = Object.keys(c.apps).find(k => k.toLowerCase() === a.name.toLowerCase());
      if (!key) return { ok: false, error: `"${a.name}" is not in the app registry.`, known: Object.keys(c.apps) };
      if (!fs.existsSync(c.apps[key])) return { ok: false, error: `"${key}" is registered but its file was not found at the saved path.` };
      await c.launch(c.apps[key]); return { ok: true, launched: key };
    } },
  { name: "timer_create", description: "Create a timer/alarm/reminder. Use duration for relative times, at for clock times.", schema: S.TimerCreateArgs, perm: "timers",
    run: async (a, c) => {
      const now = c.now?.() ?? new Date(); let due: Date;
      if (a.duration) { const ms = parseDuration(a.duration); if (!ms) return { ok: false, error: `Couldn't understand duration "${a.duration}".` }; due = new Date(now.getTime() + ms); }
      else { const r = parseClock(a.at, now); if (!r.ok) return { ok: false, error: r.error }; due = r.date; }
      const t = c.timers.create(a.label, due, now); return { ok: true, id: t.id, label: t.label, dueAt: t.dueAt };
    } },
  { name: "timer_list", description: "List active timers and reminders.", schema: S.NoArgs, perm: "timers", run: async (_a, c) => ({ ok: true, timers: c.timers.list() }) },
  { name: "timer_cancel", description: "Cancel a timer by id, or the most recent active one if no id given.", schema: S.TimerIdArgs, perm: "timers",
    run: async (a, c) => { const t = c.timers.cancel(a.id); return t ? { ok: true, cancelled: t.id, label: t.label } : { ok: false, error: "No matching active timer." }; } },
  { name: "timer_status", description: "Time remaining on a timer (latest active if no id).", schema: S.TimerIdArgs, perm: "timers",
    run: async (a, c) => { const ms = c.timers.remainingMs(a.id, c.now?.()); return ms === null ? { ok: false, error: "No matching active timer." } : { ok: true, remainingMs: ms, remaining: fmt(ms) }; } },
  { name: "note_create", description: "Create a text note in Atomic's notes folder.", schema: S.NoteArgs, perm: "notes",
    run: async (a, c) => {
      const safe = a.title.replace(/[^\w \-]/g, "").trim().slice(0, 80) || "note";
      fs.mkdirSync(c.notesDir, { recursive: true });
      const p = path.join(c.notesDir, safe + ".txt");
      try { fs.writeFileSync(p, a.body, { flag: "wx" }); } catch (e: any) { return { ok: false, error: e.code === "EEXIST" ? "A note with that title already exists." : "Could not write note." }; }
      return { ok: true, path: p };
    } },
];
export class Registry {
  constructor(private ctx: Ctx) {}
  anthropicTools() {
    return tools.map(t => { const { $schema, ...input_schema } = z.toJSONSchema(t.schema) as any; return { name: t.name, description: t.description, input_schema }; });
  }
  async execute(name: string, args: unknown): Promise<ToolResult> {
    const t = tools.find(x => x.name === name);
    if (!t) return { ok: false, error: `Unknown tool "${name}".` };
    const p = t.schema.safeParse(args);
    if (!p.success) return { ok: false, error: "Invalid arguments: " + p.error.issues.map(i => i.message).join("; ") };
    if (!this.ctx.granted(t.perm)) return { ok: false, code: "permission_denied", error: `Permission "${t.perm}" has not been granted.` };
    const msg = t.confirmMsg?.(p.data);
    if (msg && !(await this.ctx.confirm(msg))) return { ok: false, code: "declined", error: "The user declined." };
    try { return await t.run(p.data, this.ctx); } catch { return { ok: false, error: "The action failed unexpectedly." }; }
  }
}
