import { Topic } from '../types/index';

export type AIProviderType = 'google' | 'openai' | 'anthropic' | 'deepseek';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
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
 * Universal Unified LLM Query Engine
 * Automatically routes the learning conversation to Google, OpenAI, Anthropic, or DeepSeek.
 */
export async function queryActiveLLMMentor(
  topic: Topic,
  userQuestion: string,
  offlineFallbackAnswer: string
): Promise<string> {
  const config = getActiveAIConfig();
  const apiKey = config.apiKey.trim();

  // If no API key configured, use intelligent offline heuristic engine
  if (!apiKey) {
    return offlineFallbackAnswer;
  }

  const systemInstruction = `
Kamu adalah ${topic.character_name}, 3D AI Mentor untuk topik "${topic.title}" di akademi virtual MetaChain WebXR.
Persona kamu: ${topic.character_persona}.
Gaya bicara: Edukatif, bersahabat, ringkas (maksimal 3-4 kalimat padat), dan nyaman didengarkan via suara (Text-to-Speech).
PENTING: Selalu ingat bahwa seluruh penjelasanmu adalah perspektif/tanggapan pribadi pengajar, bukan standar mutlak atau saran resmi.
Jawab dalam Bahasa Indonesia.
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

