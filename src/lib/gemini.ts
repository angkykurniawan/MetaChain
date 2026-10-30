import { Topic } from '../types/index';
import { isBasicGreeting, isIdentityInquiry, isOutOfContext } from './characterGen';

// Check API Key from Environment variable or Local Storage (configured via Admin Panel)
export function getGeminiApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (envKey && envKey !== 'your-gemini-api-key-here' && !envKey.includes('placeholder')) {
    return envKey;
  }
  return localStorage.getItem('metachain_gemini_api_key') || '';
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem('metachain_gemini_api_key', key.trim());
}

/**
 * Call Google Gemini API directly using lightweight REST endpoint.
 * Includes character persona and topic knowledge in the system instruction.
 */
export async function queryGeminiMentor(
  topic: Topic,
  userQuestion: string,
  offlineFallbackAnswer: string
): Promise<string> {
  const apiKey = getGeminiApiKey();

  // Guardrail check: greetings, identity, or out-of-context
  if (isBasicGreeting(userQuestion) || isIdentityInquiry(userQuestion) || isOutOfContext(userQuestion, topic)) {
    return offlineFallbackAnswer;
  }

  // If no Gemini API Key is configured, use the smart local offline engine
  if (!apiKey) {
    return offlineFallbackAnswer;
  }

  const systemInstruction = `
Kamu adalah ${topic.character_name}, seorang 3D AI Mentor untuk topik "${topic.title}" di akademi virtual MetaChain WebXR.
Persona kamu: ${topic.character_persona}.
Konteks: Kamu HANYA mengajar materi "${topic.title}".

BATASAN RUANG LINGKUP MUTLAK:
- Kamu DILARANG KERAS menjawab pertanyaan di luar topik "${topic.title}".
- Jika pengguna bertanya di luar topik "${topic.title}" (seperti resep masakan, politik, artis, olahraga, kesehatan, dll), kamu WAJIB menolak dengan sopan:
  "Maaf, pertanyaan tersebut di luar tugas dan konteks materi \"${topic.title}\". Sebagai mentor khusus materi ini, saya hanya dapat menjawab pertanyaan yang berkaitan langsung dengan ${topic.title}. Silakan ajukan pertanyaan seputar ${topic.title}!"
- PENGECUALIAN UNTUK SAPAAN & IDENTITAS DASAR:
  Jika pengguna menyapa ("halo", "hai", "selamat pagi") atau menanyakan identitasmu ("siapa kamu", "siapa anda"), jawab dengan ramah, perkenalkan dirimu sebagai ${topic.character_name} mentor materi ${topic.title}, dan ajak mereka mempelajari ${topic.title}.

Gaya bicara: Informatif, edukatif, bersahabat, ringkas (maksimal 3-4 kalimat padat), dan cocok untuk didengarkan via suara (Text-to-Speech).
PENTING: Selalu ingat bahwa AI ini dapat membuat kesalahan. Jawab dengan ramah, jelas, dan edukatif dalam Bahasa Indonesia.
`.trim();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userQuestion }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`Gemini API error ${response.status}: Falling back to local engine`);
      return offlineFallbackAnswer;
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply && reply.trim()) {
      return reply.trim();
    }

    return offlineFallbackAnswer;
  } catch (err) {
    console.error('Failed to query Gemini API:', err);
    return offlineFallbackAnswer;
  }
}

