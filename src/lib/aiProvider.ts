import { Topic } from '../types/index';
import { isBasicGreeting, isIdentityInquiry, isOutOfContext } from './characterGen';

export type AIProviderType = 'google' | 'openai' | 'anthropic' | 'deepseek';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  availableModels?: string[];
}

export const PROVIDER_PRESETS: Record<AIProviderType, { name: string; defaultModel: string; models: string[]; docsUrl: string }> = {
  google: {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    docsUrl: 'https://aistudio.google.com/apikey'
  },
  openai: {
    name: 'OpenAI (ChatGPT)',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    defaultModel: 'claude-3-5-haiku-latest',
    models: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest', 'claude-3-haiku-20240307'],
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  deepseek: {
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    docsUrl: 'https://platform.deepseek.com/api_keys'
  }
};

const STORAGE_KEY = 'metachain_active_ai_config_v2';

export function getActiveAIConfig(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse AI config from localStorage:', err);
  }

  // Check from environment variables fallback
  const envProvider = (import.meta.env.VITE_AI_PROVIDER as AIProviderType) || 'google';
  const envModel = import.meta.env.VITE_AI_MODEL as string | undefined;
  let envKey = '';

  if (envProvider === 'openai') {
    envKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  } else if (envProvider === 'anthropic') {
    envKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  } else if (envProvider === 'deepseek') {
    envKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  } else {
    envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  return {
    provider: envProvider,
    apiKey: envKey,
    model: envModel || PROVIDER_PRESETS[envProvider]?.defaultModel || 'gemini-2.5-flash'
  };
}

export function saveActiveAIConfig(config: AIProviderConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Fetch live available models directly from the provider API using the user's API Key.
 * Dynamically determines which models are unlocked and accessible for this specific key.
 */
export async function fetchLiveAvailableModels(
  provider: AIProviderType,
  apiKey: string
): Promise<string[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return [];
  }

  // 1. Google Gemini Live Model Listing
  if (provider === 'google') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || `Google API error: HTTP ${res.status}`);
    }
    const data = await res.json();
    const rawModels = data.models || [];
    const models: string[] = rawModels
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => (m.name as string).replace(/^models\//, ''))
      .filter((name: string) => !name.includes('embedding') && !name.includes('aqa') && !name.includes('bison'));

    // Sort so newest / flash / pro models appear at top
    models.sort((a, b) => {
      if (a.includes('flash') && !b.includes('flash')) return -1;
      if (!a.includes('flash') && b.includes('flash')) return 1;
      return a.localeCompare(b);
    });

    return models.length > 0 ? models : PROVIDER_PRESETS.google.models;
  }

  // 2. OpenAI (ChatGPT) Live Model Listing
  if (provider === 'openai') {
    const url = 'https://api.openai.com/v1/models';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cleanKey}` }
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || `OpenAI API error: HTTP ${res.status}`);
    }
    const data = await res.json();
    const models: string[] = (data.data || [])
      .map((m: any) => m.id as string)
      .filter((id: string) => 
        (id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.includes('chat')) &&
        !id.includes('realtime') && !id.includes('audio') && !id.includes('transcription') && !id.includes('moderation')
      );

    models.sort((a, b) => {
      if (a.includes('4o') && !b.includes('4o')) return -1;
      if (!a.includes('4o') && b.includes('4o')) return 1;
      return a.localeCompare(b);
    });

    return models.length > 0 ? models : PROVIDER_PRESETS.openai.models;
  }

  // 3. DeepSeek Live Model Listing
  if (provider === 'deepseek') {
    const url = 'https://api.deepseek.com/models';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cleanKey}` }
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || `DeepSeek API error: HTTP ${res.status}`);
    }
    const data = await res.json();
    const models: string[] = (data.data || []).map((m: any) => m.id as string);
    return models.length > 0 ? models : PROVIDER_PRESETS.deepseek.models;
  }

  // 4. Anthropic Claude Model Listing
  if (provider === 'anthropic') {
    try {
      const url = 'https://api.anthropic.com/v1/models';
      const res = await fetch(url, {
        headers: {
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const models: string[] = (data.data || []).map((m: any) => m.id as string);
        if (models.length > 0) return models;
      }
    } catch {
      // Direct client CORS fallback
    }
    return PROVIDER_PRESETS.anthropic.models;
  }

  return [];
}

export interface MentorResult {
  text: string;
  engine: 'ai' | 'rule_based';
  modelName?: string;
}

/**
 * Strips conversational fluff, preambles, and unprompted self-introductions from responses.
 */
export function cleanMentorResponse(rawText: string, isIdentity: boolean): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // If user didn't ask an identity inquiry, remove any accidental self-introduction or preamble filler
  if (!isIdentity) {
    // 1. Remove self-introductions: "Halo, saya...", "Saya adalah...", "Sebagai mentor...", "Perkenalkan..."
    cleaned = cleaned.replace(/^(halo|hai|hello|hi|hey)[,!.]*\s*(saya|aku|nama saya|i am|my name is)\s+[^.,!?]+[,.!?]\s*/i, '');
    cleaned = cleaned.replace(/^(saya|aku|i am)\s+(adalah\s+)?(mentor|ai mentor|virtual mentor)[^.,!?]*[,.!?]\s*/i, '');
    cleaned = cleaned.replace(/^sebagai\s+(3d\s+)?(ai\s+)?mentor[^.,!?]*[,.!?]\s*/i, '');
    cleaned = cleaned.replace(/^(perkenalkan|let me introduce)[^.,!?]*[,.!?]\s*/i, '');

    // 2. Remove conversational preamble fillers: "Tentu saja!", "Pertanyaan bagus!", "Mari kita bahas...", etc.
    cleaned = cleaned.replace(/^(tentu saja|tentu|sure thing|sure|certainly|baiklah|baik)[,!.]*\s*/i, '');
    cleaned = cleaned.replace(/^(pertanyaan yang (sangat )?bagus|pertanyaan bagus|pertanyaan menarik|great question|interesting question)[,!.]*\s*/i, '');
    cleaned = cleaned.replace(/^(mari kita (bahas|pelajari|simak|bedah)|let's explore|let's discuss)[,!.]*\s*/i, '');

    // 3. Remove standalone greeting prefixes before the real answer
    cleaned = cleaned.replace(/^(halo|hai|hello|hi|hey|selamat (pagi|siang|sore|malam)|good (morning|afternoon|evening))[,!.]+\s+(?=[A-Z0-9a-z])/i, '');

    // 4. Remove perspective boilerplate if model parrots it into spoken response
    cleaned = cleaned.replace(/^(AI ini dapat membuat kesalahan[,.]*|Perlu diingat bahwa AI ini dapat membuat kesalahan[,.]*)\s*(namun|tetapi|tapi)?\s*/i, '');
    cleaned = cleaned.replace(/^(Keep in mind that AI can make mistakes[,.]*|AI can make mistakes[,.]*)\s*(but|however)?\s*/i, '');
  }

  // Capitalize first character
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned.trim() || rawText.trim();
}

/**
 * Universal Unified LLM Query Engine
 * Automatically routes the learning conversation to Google, OpenAI, Anthropic, or DeepSeek.
 */
export async function queryActiveLLMMentor(
  topic: Topic,
  userQuestion: string,
  offlineFallbackAnswer: string,
  _lang: 'id' | 'en' = 'id'
): Promise<MentorResult> {
  const config = getActiveAIConfig();
  const apiKey = config.apiKey.trim();
  const isIdentity = isIdentityInquiry(userQuestion);

  // Instant Guardrail Check: Greetings, Identity queries, or Out-of-Context queries are handled by rule-based heuristic
  if (isBasicGreeting(userQuestion) || isIdentity || isOutOfContext(userQuestion, topic)) {
    return {
      text: offlineFallbackAnswer,
      engine: 'rule_based'
    };
  }

  // If no API key configured, use intelligent offline heuristic engine
  if (!apiKey) {
    return {
      text: offlineFallbackAnswer,
      engine: 'rule_based'
    };
  }

  const systemInstruction = `
Kamu adalah edukator handal yang mengajar materi "${topic.title}" di akademi virtual MetaChain WebXR.
Konteks Materi: "${topic.title}" - ${topic.description}.
Persona: ${topic.character_persona}.

ATURAN MUTLAK (WAJIB DIPATUHI):
1. DILARANG MEMBERIKAN INTRODUKSI, SALAM, ATAU BASA-BASI PEMBUKA:
   - DILARANG KERAS memperkenalkan diri di awal jawaban (JANGAN katakan "Halo, saya [nama]...", "Nama saya...", "Sebagai mentor...").
   - DILARANG KERAS menggunakan basa-basi atau kata pembuka (JANGAN katakan "Halo!", "Hai!", "Tentu saja!", "Pertanyaan yang bagus!", "Mari kita bahas...", "Baiklah...").
   - LANGSUNG jelaskan jawaban/konsep materi secara to-the-point dan lugas.
   - Nama karakter (${topic.character_name}) HANYA boleh diucapkan jika pengguna secara eksplisit menanyakan siapa kamu.

2. BATASAN RUANG LINGKUP MUTLAK:
   - Kamu HANYA mengajar materi "${topic.title}".
   - Jika pengguna bertanya di luar materi "${topic.title}" (resep masakan, makanan, politik, artis, bola, obat, cinta, dsb.), jawab HANYA:
     "Maaf, pertanyaan tersebut di luar tugas dan konteks materi \"${topic.title}\". Sebagai mentor khusus materi ini, saya hanya dapat menjawab pertanyaan yang berkaitan langsung dengan ${topic.title}."

3. FORMAT & PANJANG JAWABAN:
   - Padat, jelas, akurat, edukatif (maksimal 2-3 kalimat to-the-point).
   - Nyaman dan natural didengarkan via suara (Text-to-Speech).
   - Jawab selalu dalam Bahasa Indonesia.
`.trim();

  try {
    // ==========================================
    // 1. GOOGLE GEMINI
    // ==========================================
    if (config.provider === 'google') {
      const model = config.model || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userQuestion }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
        })
      });

      if (!res.ok) throw new Error(`Google API error: ${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return {
          text: cleanMentorResponse(text.trim(), isIdentity),
          engine: 'ai',
          modelName: `Google Gemini (${model})`
        };
      }
      return { text: offlineFallbackAnswer, engine: 'rule_based' };
    }

    // ==========================================
    // 2. OPENAI (ChatGPT)
    // ==========================================
    if (config.provider === 'openai') {
      const model = config.model || 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userQuestion }
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text && text.trim()) {
        return {
          text: cleanMentorResponse(text.trim(), isIdentity),
          engine: 'ai',
          modelName: `OpenAI (${model})`
        };
      }
      return { text: offlineFallbackAnswer, engine: 'rule_based' };
    }

    // ==========================================
    // 3. ANTHROPIC (Claude)
    // ==========================================
    if (config.provider === 'anthropic') {
      const model = config.model || 'claude-3-5-haiku-latest';
      const url = 'https://api.anthropic.com/v1/messages';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model,
          system: systemInstruction,
          messages: [{ role: 'user', content: userQuestion }],
          max_tokens: 350,
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
      const data = await res.json();
      const text = data?.content?.[0]?.text;
      if (text && text.trim()) {
        return {
          text: cleanMentorResponse(text.trim(), isIdentity),
          engine: 'ai',
          modelName: `Anthropic Claude (${model})`
        };
      }
      return { text: offlineFallbackAnswer, engine: 'rule_based' };
    }

    // ==========================================
    // 4. DEEPSEEK
    // ==========================================
    if (config.provider === 'deepseek') {
      const model = config.model || 'deepseek-chat';
      const url = 'https://api.deepseek.com/chat/completions';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userQuestion }
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text && text.trim()) {
        return {
          text: cleanMentorResponse(text.trim(), isIdentity),
          engine: 'ai',
          modelName: `DeepSeek (${model})`
        };
      }
      return { text: offlineFallbackAnswer, engine: 'rule_based' };
    }

    return { text: offlineFallbackAnswer, engine: 'rule_based' };
  } catch (err) {
    console.error(`AI Provider (${config.provider}) execution error:`, err);
    return { text: offlineFallbackAnswer, engine: 'rule_based' };
  }
}

