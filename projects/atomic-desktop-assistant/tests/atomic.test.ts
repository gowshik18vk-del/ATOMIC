import { describe, it, expect } from "vitest";
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { parseDuration, parseClock } from "../src/timers/parse";
import { TimerStore } from "../src/timers/store";
import { Registry, normalizeUrl, Ctx } from "../src/tools/registry";
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "atomic-"));
const mk = (over: Partial<Ctx> = {}, dir = tmp()) => {
  const opened: string[] = [];
  const ctx: Ctx = { timers: new TimerStore(path.join(dir, "t.json")), granted: () => true, confirm: async () => true,
    openExternal: async u => { opened.push(u); }, launch: async () => {}, apps: {}, notesDir: path.join(dir, "n"), ...over };
  return { reg: new Registry(ctx), ctx, opened, dir };
};
describe("parsing", () => {
  it("durations", () => {
    expect(parseDuration("7 minutes")).toBe(420000); expect(parseDuration("90-second")).toBe(90000);
    expect(parseDuration("half an hour")).toBe(1800000); expect(parseDuration("1h 30m")).toBe(5400000);
    expect(parseDuration("banana")).toBeNull();
  });
  it("clock times", () => {
    const now = new Date(2026, 9, 25, 12, 0);
    const a = parseClock("6:45 PM", now); expect(a.ok && a.date.getHours()).toBe(18);
    const b = parseClock("11:30 AM", now); expect(b.ok && b.date.getDate()).toBe(26);
    const c = parseClock("6:30 tomorrow morning", now); expect(c.ok && c.date.getDate()).toBe(26);
    expect(parseClock("6:45", now).ok).toBe(false);
  });
});
describe("tools", () => {
  it("creates, lists, cancels timers and persists across reload", async () => {
    const { reg, ctx, dir } = mk();
    const r: any = await reg.execute("timer_create", { duration: "7 minutes", label: "tea" });
    expect(r.ok).toBe(true); expect(ctx.timers.list()).toHaveLength(1);
    expect(new TimerStore(path.join(dir, "t.json")).list()).toHaveLength(1);
    expect(((await reg.execute("timer_cancel", {})) as any).ok).toBe(true);
    expect(ctx.timers.list()).toHaveLength(0);
  });
  it("rejects bad arguments and ambiguous clock times", async () => {
    const { reg } = mk();
    expect((await reg.execute("timer_create", {})).ok).toBe(false);
    expect((await reg.execute("timer_create", { at: "6:45" })).ok).toBe(false);
  });
  it("enforces permissions", async () => {
    const { reg, opened } = mk({ granted: () => false });
    const r: any = await reg.execute("open_website", { url: "youtube.com" });
    expect(r.code).toBe("permission_denied"); expect(opened).toHaveLength(0);
  });
  it("opens https only", async () => {
    const { reg, opened } = mk();
    expect(((await reg.execute("open_website", { url: "youtube.com" })) as any).ok).toBe(true);
    expect(opened).toEqual(["https://youtube.com/"]);
    expect(normalizeUrl("file:///etc/passwd")).toBeNull(); expect(normalizeUrl("http://x.com")).toBeNull();
  });
  it("reports unknown apps truthfully", async () => {
    const { reg } = mk(); const r: any = await reg.execute("launch_app", { name: "WhatsApp" });
    expect(r.ok).toBe(false); expect(r.error).toContain("not in the app registry");
  });
  it("recovers from a corrupt timer file", () => {
    const d = tmp(); const f = path.join(d, "t.json"); fs.writeFileSync(f, "{oops");
    expect(new TimerStore(f).list()).toEqual([]); expect(fs.existsSync(f + ".corrupt")).toBe(true);
  });
  it("does not overwrite notes", async () => {
    const { reg } = mk(); await reg.execute("note_create", { title: "Ideas" });
    expect(((await reg.execute("note_create", { title: "Ideas" })) as any).ok).toBe(false);
  });
});
