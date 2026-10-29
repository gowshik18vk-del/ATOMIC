export function parseDuration(s: string): number | null {
  const t = s.toLowerCase().trim();
  if (/^half an? hour$/.test(t)) return 1_800_000;
  let total = 0, found = false, m: RegExpExecArray | null;
  const re = /(\d+(?:\.\d+)?|an?|one)\s*-?\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/g;
  while ((m = re.exec(t))) {
    found = true;
    const n = /^\d/.test(m[1]) ? parseFloat(m[1]) : 1;
    const u = m[2][0];
    total += n * (u === "h" ? 3_600_000 : u === "m" ? 60_000 : 1000);
  }
  return found && total > 0 ? Math.round(total) : null;
}

export type ClockResult = { ok: true; date: Date } | { ok: false; error: string };

/** Resolves a clock time ("6:45 PM", "6:30 tomorrow morning") in the local time zone. */
export function parseClock(s: string, now = new Date()): ClockResult {
  const t = s.toLowerCase().trim();
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/);
  if (!m) return { ok: false, error: "No time of day found." };
  let h = +m[1];
  const min = m[2] ? +m[2] : 0;
  let mer = m[3]?.[0];
  if (!mer && /morning/.test(t)) mer = "a";
  if (!mer && /afternoon|evening|night/.test(t)) mer = "p";
  if (min > 59 || h > 24) return { ok: false, error: "That isn't a valid time." };
  if (mer) {
    if (h < 1 || h > 12) return { ok: false, error: "That isn't a valid 12-hour time." };
    h = (h % 12) + (mer === "p" ? 12 : 0);
  } else if (h >= 1 && h <= 12) {
    return { ok: false, error: "Ambiguous: please say AM or PM." };
  }
  const d = new Date(now);
  d.setHours(h === 24 ? 0 : h, min, 0, 0);
  if (/tomorrow/.test(t)) d.setDate(d.getDate() + 1);
  else if (d <= now) d.setDate(d.getDate() + 1);
  return { ok: true, date: d };
}
