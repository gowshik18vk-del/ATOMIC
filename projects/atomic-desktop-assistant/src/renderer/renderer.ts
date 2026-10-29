declare const atomic: any;
const $ = (id: string) => document.getElementById(id)!;
const el = (tag: string, text = "", cls = "") => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };
const say = (t: string, cls: string) => { const m = el("div", t, "m " + cls); $("log").append(m); m.scrollIntoView(); };
const act = (title: string, detail: string, ok: boolean) => { const r = el("div", "", "act"); const b = el("div"); b.append(el("b", title), el("span", detail)); r.append(el("i", "", "dot " + (ok ? "ok" : "no")), b); return r; };
async function refresh() {
  const s = await atomic.status(), p = await atomic.getPermissions();
  const names: any = { claude: "Claude reasoning", elevenlabs: "ElevenLabs voice" };
  $("svc").replaceChildren(...Object.entries(s).map(([k, v]: any) => act(names[k] + (v.ok ? " verified" : " unavailable"), v.detail, v.ok)), act("Voice interface", "Not wired in this build", false));
  const all = Object.values(s).every((v: any) => v.ok);
  $("chip").textContent = all ? "SERVICES VERIFIED" : "SETUP NEEDED"; $("chip").className = "chip " + (all ? "ok" : "no");
  if (!$("perms").childElementCount) $("perms").replaceChildren(...p.map((x: any) => {
    const l = el("label"), c = document.createElement("input"); c.type = "checkbox"; c.checked = x.granted;
    c.onchange = () => atomic.setPermission(x.name, c.checked); l.append(c, el("span", x.name)); return l;
  }));
  const t = await atomic.timers();
  $("tm").replaceChildren(...(t.length ? t : [{ label: "None", dueAt: "" }]).map((x: any) => {
    const r = el("div", "", "row"); r.append(el("span", x.label), el("span", x.dueAt ? new Date(x.dueAt).toLocaleTimeString() : "")); return r;
  }));
}
async function stats() {
  const s = await atomic.stats();
  $("cpu").textContent = s.cpu + "%"; $("mem").textContent = s.mem + "%";
  ($("cpub") as HTMLElement).style.width = s.cpu + "%"; ($("memb") as HTMLElement).style.width = s.mem + "%";
}
const input = $("in") as HTMLInputElement;
document.querySelectorAll<HTMLButtonElement>(".card[data-p]").forEach(b => b.onclick = () => { input.value = b.dataset.p!; input.focus(); });
$("f").addEventListener("submit", async e => {
  e.preventDefault(); const text = input.value.trim(); if (!text) return;
  input.value = ""; say(text, "u"); $("main").classList.add("busy"); $("state").textContent = "Thinking…";
  const r = await atomic.send(text); $("main").classList.remove("busy"); $("state").textContent = "Ready for text commands";
  r.ok ? say(r.text, "") : say(r.error, "e"); refresh();
});
atomic.onTimerDone((l: string) => { say(`${l} is done.`, ""); refresh(); });
refresh(); stats(); setInterval(refresh, 15000); setInterval(stats, 3000);
