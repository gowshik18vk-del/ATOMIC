import { z } from "zod";
export const OpenWebsiteArgs = z.object({ url: z.string().min(1).max(2048) });
export const LaunchAppArgs = z.object({ name: z.string().min(1).max(60) });
export const TimerCreateArgs = z.object({
  label: z.string().max(100).default("Timer"),
  duration: z.string().max(60).optional().describe("Relative length, e.g. '7 minutes'"),
  at: z.string().max(60).optional().describe("Clock time, e.g. '6:45 PM' or '6:30 AM tomorrow'"),
}).refine(a => !!a.duration !== !!a.at, { message: "Provide exactly one of duration or at" });
export const TimerIdArgs = z.object({ id: z.string().optional() });
export const NoArgs = z.object({});
export const NoteArgs = z.object({ title: z.string().min(1).max(100), body: z.string().max(10000).default("") });
