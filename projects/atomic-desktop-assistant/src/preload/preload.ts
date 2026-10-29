import { contextBridge, ipcRenderer } from "electron";
const call = (ch: string, ...a: unknown[]) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld("atomic", {
  send: (text: string) => call("chat:send", String(text)),
  status: () => call("status:check"),
  stats: () => call("stats:get"),
  timers: () => call("timers:list"),
  voices: () => call("voices:list"),
  getPermissions: () => call("perm:get"),
  setPermission: (name: string, value: boolean) => call("perm:set", String(name), !!value),
  onTimerDone: (cb: (label: string) => void) => ipcRenderer.on("timer:done", (_e, l) => cb(String(l))),
});
