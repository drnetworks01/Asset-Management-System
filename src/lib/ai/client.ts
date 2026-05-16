import 'server-only';

const BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

export function aiEnabled(): boolean {
  return !!KEY && KEY.length > 10;
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
};

type ChatOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

type ChatResponse = {
  choices: Array<{ message: { content: string } }>;
  error?: { message: string };
};

export async function aiChat(opts: ChatOptions): Promise<string> {
  if (!aiEnabled()) {
    throw new Error('AI not configured. Set OPENROUTER_API_KEY in .env.local.');
  }
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010',
      'X-Title': 'Kurikara Assets',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as ChatResponse;
  if (data.error) throw new Error(data.error.message);
  return data.choices[0]?.message?.content ?? '';
}

export async function aiJson<T>(opts: ChatOptions): Promise<T> {
  const messages = [...opts.messages];
  // Ensure last message asks for JSON
  const last = messages[messages.length - 1];
  if (last && typeof last.content === 'string') {
    last.content = `${last.content}\n\nReply with ONLY valid JSON, no markdown, no commentary.`;
  }
  const raw = await aiChat({ ...opts, messages });
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
