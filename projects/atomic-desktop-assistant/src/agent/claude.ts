import Anthropic from "@anthropic-ai/sdk";
import { Registry } from "../tools/registry";
export const SYSTEM = `You are Atomic, a warm, quick, expressive personal assistant on the user's Windows PC.
Match the user's language and tone; keep replies short and natural. Use tools for real actions and only say an action succeeded after its tool result has ok:true. If a tool fails, say so plainly and suggest an alternative. Ask a brief question when a time, date, or target is ambiguous. Never claim abilities you don't have.`;
export async function verifyModel(client: Anthropic, model: string) { await client.models.retrieve(model); }
export async function runTurn(client: Anthropic, model: string, history: Anthropic.MessageParam[], reg: Registry): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({ model, max_tokens: 1024, system: SYSTEM, tools: reg.anthropicTools() as any, messages: history });
    history.push({ role: "assistant", content: res.content });
    const uses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (!uses.length) return res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map(b => b.text).join("\n");
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const u of uses) { const r = await reg.execute(u.name, u.input); results.push({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(r), is_error: !r.ok }); }
    history.push({ role: "user", content: results });
  }
  return "I ran out of tool steps before finishing. Want me to try again?";
}
