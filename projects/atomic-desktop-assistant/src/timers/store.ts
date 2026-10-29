import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
export interface TimerRecord { id: string; label: string; dueAt: string; createdAt: string; status: "active" | "cancelled" | "completed"; }
export class TimerStore {
  private items: TimerRecord[] = [];
  constructor(private file: string) { this.load(); }
  private load() {
    try { this.items = JSON.parse(fs.readFileSync(this.file, "utf8")); }
    catch (e: any) {
      if (e.code !== "ENOENT") { try { fs.renameSync(this.file, this.file + ".corrupt"); } catch {} }
      this.items = [];
    }
  }
  private save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(this.items, null, 2));
    fs.renameSync(tmp, this.file);
  }
  create(label: string, dueAt: Date, now = new Date()): TimerRecord {
    const r: TimerRecord = { id: randomUUID(), label, dueAt: dueAt.toISOString(), createdAt: now.toISOString(), status: "active" };
    this.items.push(r); this.save(); return r;
  }
  list(all = false) { return this.items.filter(t => all || t.status === "active"); }
  private pick(id?: string) { const a = this.list(); return id ? a.find(x => x.id === id) : a[a.length - 1]; }
  cancel(id?: string): TimerRecord | null {
    const t = this.pick(id); if (!t) return null;
    t.status = "cancelled"; this.save(); return t;
  }
  remainingMs(id?: string, now = new Date()): number | null {
    const t = this.pick(id);
    return t ? Math.max(0, new Date(t.dueAt).getTime() - now.getTime()) : null;
  }
  completeDue(now = new Date()): TimerRecord[] {
    const due = this.list().filter(t => new Date(t.dueAt) <= now);
    due.forEach(t => (t.status = "completed"));
    if (due.length) this.save();
    return due;
  }
}
