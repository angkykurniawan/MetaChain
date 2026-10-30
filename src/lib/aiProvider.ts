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

/**
 * Universal Unified LLM Query Engine
 * Automatically routes the learning conversation to Google, OpenAI, Anthropic, or DeepSeek.
 */
export async function queryActiveLLMMentor(
  topic: Topic,
  userQuestion: string,
  offlineFallbackAnswer: string,
  lang: 'id' | 'en' = 'id'
): Promise<string> {
  const config = getActiveAIConfig();
  const apiKey = config.apiKey.trim();

  // Instant Guardrail Check: Greetings, Identity queries, or Out-of-Context queries
  if (isBasicGreeting(userQuestion) || isIdentityInquiry(userQuestion) || isOutOfContext(userQuestion, topic)) {
    return offlineFallbackAnswer;
  }

  // If no API key configured, use intelligent offline heuristic engine
  if (!apiKey) {
    return offlineFallbackAnswer;
  }

  const systemInstruction = lang === 'en'
    ? `
You are ${topic.character_name}, a dedicated 3D AI Mentor for "${topic.title}" at MetaChain WebXR Academy.
Your persona: ${topic.character_persona}.
Scope: You teach ONLY "${topic.title}".

CRITICAL SCOPE RESTRICTION (STRICT ZERO-TOLERANCE):
- You must NOT answer any question outside the domain of "${topic.title}".
- If the user asks about anything outside of "${topic.title}" (e.g., cooking recipes, food, politics, celebrities, sports, medical advice, romance, general trivia), you MUST refuse without exception:
  "I apologize, but that question is outside my scope and duty for the topic \"${topic.title}\". As the dedicated mentor for this module, I can only assist with questions directly related to ${topic.title}. Please feel free to ask anything about ${topic.title}!"
- EXCEPTION FOR BASIC GREETINGS & IDENTITY:
  If the user asks basic greetings ("hello", "hi") or asks who you are ("who are you"), reply warmly, state you are ${topic.character_name} the mentor for ${topic.title}, and invite them to explore ${topic.title}.

Tone: Highly educational, clear, articulate, warm, and concise (maximum 3-4 sentences), optimized to sound clear and natural on text-to-speech voice.
MANDATORY: Always remember that AI can make mistakes. Provide clear, accurate pedagogical insights.
Answer strictly in English with clear pronunciation-friendly vocabulary.
`.trim()
    : `
Kamu adalah ${topic.character_name}, 3D AI Mentor untuk topik "${topic.title}" di akademi virtual MetaChain WebXR.
Persona kamu: ${topic.character_persona}.
Konteks: Kamu HANYA mengajar materi "${topic.title}".

BATASAN RUANG LINGKUP MUTLAK (TANPA PENGECUALIAN):
- Kamu DILARANG KERAS menjawab pertanyaan di luar topik "${topic.title}".
- Jika pengguna menanyakan hal apapun di luar "${topic.title}" (contohnya: resep masakan, makanan, politik, artis, sepak bola, kesehatan/obat, percintaan, gosip, atau topik di luar ${topic.title}), kamu WAJIB menolak dengan tegas dan sopan:
  "Maaf, pertanyaan tersebut di luar tugas dan konteks materi \"${topic.title}\". Sebagai mentor khusus materi ini, saya hanya dapat menjawab pertanyaan yang berkaitan langsung dengan ${topic.title}. Silakan ajukan pertanyaan seputar ${topic.title}!"
- PENGECUALIAN UNTUK SAPAAN & IDENTITAS DASAR:
  Jika pengguna menyapa ("halo", "hai", "selamat pagi") atau menanyakan identitasmu ("siapa kamu", "siapa anda"), jawab dengan ramah, perkenalkan dirimu sebagai ${topic.character_name} mentor materi ${topic.title}, dan ajak mereka mempelajari ${topic.title}.

Gaya bicara: Edukatif, bersahabat, sangat jelas, ringkas (maksimal 3-4 kalimat padat), dan nyaman didengarkan via suara (Text-to-Speech).
PENTING: Selalu ingat bahwa AI ini dapat membuat kesalahan. Berikan penjelasan edukatif yang jelas dan akurat.
Jawab dengan tegas dan jelas dalam Bahasa Indonesia.
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
      return text?.trim() || offlineFallbackAnswer;
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
      return text?.trim() || offlineFallbackAnswer;
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
      return text?.trim() || offlineFallbackAnswer;
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
      return text?.trim() || offlineFallbackAnswer;
    }

    return offlineFallbackAnswer;
  } catch (err) {
    console.error(`AI Provider (${config.provider}) execution error:`, err);
    return offlineFallbackAnswer;
  }
}

