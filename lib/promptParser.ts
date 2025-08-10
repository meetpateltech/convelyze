// lib/promptParser.ts
// Central parser: extraherar prompt-text från olika exportformat.

export type ParsedPrompt = string;

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(i => typeof i === 'string');
}

export function parseTextToPrompts(txt: string): ParsedPrompt[] {
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt as string);
    // array of strings
    if (isStringArray(parsed)) return parsed;
    // array of objects with messages
    if (Array.isArray(parsed)) {
      const out: string[] = [];
      for (const item of parsed) {
        if (!item) continue;
        if (typeof item === 'string') out.push(item);
        // common Chat export shape: item.messages
        if (Array.isArray((item as any).messages)) {
          for (const m of (item as any).messages) {
            if (typeof m?.content === 'string') out.push(m.content);
            else if (m?.content?.parts && Array.isArray(m.content.parts)) out.push(m.content.parts.join(' '));
          }
        } else {
          // fallback: common keys
          for (const k of ['content', 'text', 'message', 'prompt']) {
            if (typeof (item as any)[k] === 'string') out.push((item as any)[k]);
          }
        }
      }
      return out;
    }
    // object with conversations
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).conversations)) {
      const out: string[] = [];
      for (const conv of (parsed as any).conversations) {
        if (!conv?.messages) continue;
        for (const m of conv.messages) {
          if (typeof m?.content === 'string') out.push(m.content);
          else if (m?.content?.parts && Array.isArray(m.content.parts)) out.push(m.content.parts.join(' '));
        }
      }
      return out;
    }
  } catch (e) {
    // not JSON — fall through to newline splitting
  }
  return (txt as string).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}
