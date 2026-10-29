const BASE = "https://api.elevenlabs.io/v1";
async function get(key: string, p: string) {
  const r = await fetch(BASE + p, { headers: { "xi-api-key": key } });
  if (!r.ok) throw new Error(`ElevenLabs request failed (HTTP ${r.status}).`);
  return r.json() as Promise<any>;
}
export async function listVoices(key: string) {
  const j = await get(key, "/voices");
  return (j.voices ?? []).map((v: any) => ({ id: v.voice_id as string, name: v.name as string }));
}
/** Short-lived URL so the renderer never sees the permanent key. */
export async function getSignedUrl(key: string, agentId: string): Promise<string> {
  const j = await get(key, `/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`);
  return j.signed_url as string;
}
