import { AvatarModelType, CharacterConfig, Topic } from '../types/index';

const AVATAR_TYPES: AvatarModelType[] = ['cyber_humanoid', 'floating_orb', 'mech_guard', 'holo_sage'];

const PALETTES = [
  { primary: '#06b6d4', secondary: '#3b82f6', vibe: 'Cyber Blue' },
  { primary: '#10b981', secondary: '#059669', vibe: 'Emerald Matrix' },
  { primary: '#8b5cf6', secondary: '#6d28d9', vibe: 'Quantum Purple' },
  { primary: '#f59e0b', secondary: '#d97706', vibe: 'Solar Amber' },
  { primary: '#ec4899', secondary: '#be185d', vibe: 'Neon Magenta' },
  { primary: '#ef4444', secondary: '#991b1b', vibe: 'Crimson Defense' },
  { primary: '#14b8a6', secondary: '#0f766e', vibe: 'Voxel Teal' },
  { primary: '#6366f1', secondary: '#4338ca', vibe: 'Deep Indigo' }
];

export function generateCharacterForTopic(topicTitle: string, topicDescription: string = ''): CharacterConfig {
  const titleLower = (topicTitle || '').toLowerCase();
  
  let avatarType: AvatarModelType = 'cyber_humanoid';
  let primaryColor = '#06b6d4';
  let secondaryColor = '#3b82f6';
  let charName = '';
  let persona = '';
  let greeting = '';
  let pitch = 1.0;
  let rate = 1.0;

  if (titleLower.includes('cloud') || titleLower.includes('server')) {
    avatarType = 'holo_sage';
    primaryColor = '#60a5fa';
    secondaryColor = '#93c5fd';
    charName = 'Nimbus-' + Math.floor(10 + Math.random() * 89);
    persona = 'Arsitek komputasi awan yang tenang, holistik, dan berfokus pada efisiensi infrastruktur skala global.';
    pitch = 0.95;
    rate = 1.0;
  } else if (titleLower.includes('block') || titleLower.includes('web3') || titleLower.includes('crypto')) {
    avatarType = 'cyber_humanoid';
    primaryColor = '#f59e0b';
    secondaryColor = '#10b981';
    charName = 'Cipher-' + Math.floor(100 + Math.random() * 900);
    persona = 'Kriptografer terdesentralisasi yang analitis dan mengutamakan konsensus matematis murni tanpa otoritas terpusat.';
    pitch = 1.0;
    rate = 1.0;
  } else if (titleLower.includes('sec') || titleLower.includes('cyber') || titleLower.includes('hack') || titleLower.includes('guard')) {
    avatarType = 'mech_guard';
    primaryColor = '#ef4444';
    secondaryColor = '#991b1b';
    charName = 'Aegis-' + Math.floor(10 + Math.random() * 89);
    persona = 'Penjaga pertahanan siber taktis dengan fokus pada mitigasi eksploitasi dan arsitektur Zero Trust.';
    pitch = 0.88;
    rate = 1.02;
  } else if (titleLower.includes('net') || titleLower.includes('data') || titleLower.includes('ai') || titleLower.includes('learn')) {
    avatarType = 'floating_orb';
    primaryColor = '#a855f7';
    secondaryColor = '#06b6d4';
    charName = 'Synapse-' + Math.floor(10 + Math.random() * 89);
    persona = 'Entitas analitis berkecepatan tinggi yang memproses pola informasi dan komunikasi sinyal spasial.';
    pitch = 1.1;
    rate = 1.05;
  } else if (titleLower.includes('devops') || titleLower.includes('infra') || titleLower.includes('docker')) {
    avatarType = 'mech_guard';
    primaryColor = '#f59e0b';
    secondaryColor = '#b45309';
    charName = 'Nexus-Ops';
    persona = 'Insinyur otomasi yang berfokus pada zero-downtime deployment dan pipeline CI/CD tangguh.';
    pitch = 0.9;
    rate = 1.08;
  } else {
    // Procedural generation
    const randColor = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    primaryColor = randColor.primary;
    secondaryColor = randColor.secondary;
    avatarType = AVATAR_TYPES[Math.floor(Math.random() * AVATAR_TYPES.length)];
    const prefixes = ['Vector', 'Nova', 'Apex', 'Helix', 'Chronos', 'Kuro', 'Orion', 'Pulse'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    charName = `${p}-${Math.floor(10 + Math.random() * 89)}`;
    persona = `Mentor spesialis ${topicTitle || 'teknologi'} yang komunikatif, ramah, dan memprioritaskan pemahaman konsep fundamental hingga tingkat mahir.`;
    pitch = 0.95 + Math.random() * 0.15;
    rate = 0.98 + Math.random() * 0.08;
  }

  greeting = `Halo! Saya ${charName}, mentor virtual Anda untuk materi ${topicTitle || 'ini'}. Harap diingat bahwa AI ini dapat membuat kesalahan. Mari kita mulai belajar!`;

  return {
    character_name: charName,
    character_persona: persona,
    character_avatar_type: avatarType,
    character_primary_color: primaryColor,
    character_secondary_color: secondaryColor,
    character_greeting: greeting,
    character_voice_pitch: parseFloat(pitch.toFixed(2)),
    character_voice_rate: parseFloat(rate.toFixed(2))
  };
}

/**
 * Generate AI Fallback learning outline when admin hasn't provided a curriculum
 */
export function generateAIFallbackCurriculum(topicTitle: string, lang: 'id' | 'en' = 'id'): string {
  if (lang === 'en') {
    return `## Smart Curriculum (AI Fallback) — ${topicTitle}
> 🤖 *Auto Mode: This curriculum outline is generated dynamically by the AI Mentor because no custom guide was uploaded by the Admin.*

### 1. Core Principles & Why It Matters
* Historical context and the necessity of ${topicTitle} in modern distributed computing.
* Fundamental value proposition and architectural comparisons.

### 2. Primary Architectural Components
* Structural pillars, protocol standards, and data lifecycle mechanisms.
* Execution flows and industry design standards.

### 3. Real-World Industry Application
* Production-grade case studies from modern tech companies.
* Trade-offs: Balancing performance, latency, security, and cost.

### 4. Hands-On Exploration Roadmap
* Essential developer toolkits, SDKs, and foundational step-by-step practices.`;
  }

  return `## Kurikulum Cerdas (AI Fallback) — ${topicTitle}
> 🤖 *Mode Otomatis: Materi ini disusun oleh AI Mentor karena belum ada panduan kurikulum yang diunggah oleh Admin.*

### 1. Prinsip Fundamental & Urgensi
* Latar belakang lahirnya ${topicTitle} dalam ekosistem industri komputasi modern.
* Bagaimana konsep ini mengubah cara kerja sistem sebelumnya menjadi lebih efisien dan skalabel.

### 2. Arsitektur Komponen Utama
* Anatomi dan pilar struktural yang menopang teknologi ini.
* Siklus hidup data, protokol komunikasi, dan standarisasi industri.

### 3. Implementasi Dunia Nyata
* Pola penggunaan pada perusahaan teknologi skala besar.
* Trade-off: Menimbang antara performa, keamanan, dan efisiensi biaya.

### 4. Roadmap Praktik Mandiri
* Tooling, SDK, dan langkah awal untuk menguasai ${topicTitle} secara mendalam.`;
}

/**
 * Check if the input is a basic conversational greeting
 */
export function isBasicGreeting(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[!?.,]/g, '');
  const greetings = [
    'halo', 'hai', 'hei', 'helo', 'halo halo', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
    'pagi', 'siang', 'sore', 'malam', 'apa kabar', 'assalamualaikum', 'assalamu alaikum',
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'howdy', 'greetings', 'sup'
  ];
  return greetings.some(g => t === g || t.startsWith(g + ' ') || t.endsWith(' ' + g));
}

/**
 * Check if the input is an identity inquiry
 */
export function isIdentityInquiry(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[!?.,]/g, '');
  const identityQueries = [
    'siapa kamu', 'siapa anda', 'siapa namamu', 'namamu siapa', 'nama kamu siapa', 'siapakah anda',
    'siapakah kamu', 'kamu siapa', 'anda siapa', 'siapa dirimu', 'kamu ini siapa', 'anda ini siapa', 'kenalan',
    'who are you', 'what is your name', 'whats your name', 'who r u', 'who are u', 'what are you',
    'introduce yourself', 'tell me about yourself'
  ];
  return identityQueries.some(iq => t.includes(iq));
}

/**
 * Check if the input is explicitly outside the learning context
 */
export function isOutOfContext(text: string, topic: Topic): boolean {
  const t = text.toLowerCase();
  
  // 1. Off-topic subject keywords (cooking, politics, sports, entertainment, medical, romance, trivia)
  const offTopicKeywords = [
    'masak', 'resep', 'makanan', 'minuman', 'kuliner', 'goreng', 'rebus', 'bumbu', 'nasi goreng', 'rendang', 'bakso', 'mie ayam',
    'cooking', 'recipe', 'food', 'restaurant', 'dish', 'cake', 'cookies',
    'presiden', 'pemilu', 'partai', 'menteri', 'pilpres', 'politik', 'dpr', 'kebijakan pemerintah',
    'politics', 'president', 'election', 'government', 'parliament',
    'sepak bola', 'football', 'soccer', 'badminton', 'bulutangkis', 'ronaldo', 'messi', 'klub bola', 'liga champions',
    'artis', 'aktor', 'film bioskop', 'sinetron', 'lagu dangdut', 'lirik lagu', 'chord gitar', 'penyanyi', 'hollywood',
    'movie', 'celebrity', 'song lyrics', 'chords', 'singer',
    'obat', 'penyakit', 'gejala sakit', 'dokter', 'rumah sakit', 'vaksin', 'sakit kepala', 'demam', 'obat batuk',
    'medicine', 'disease', 'symptoms', 'hospital',
    'pacar', 'jodoh', 'cinta', 'menikah', 'mantan pacar', 'kencan', 'dating', 'romance', 'love story', 'boyfriend', 'girlfriend',
    'ramalan zodiak', 'horoskop', 'cuaca hari ini', 'ramalan bintang', 'horoscope', 'astrology', 'weather today',
    'harga emas', 'beli baju', 'shopee', 'tokopedia', 'diskon baju', 'diet', 'berat badan', 'gym', 'fitness'
  ];

  if (offTopicKeywords.some(kw => t.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * AI Conversational Engine for answering student questions inside the VR Hub
 */
export function generateAIAnswer(topic: Topic, userQuestion: string, lang: 'id' | 'en' = 'id'): string {
  const q = userQuestion.toLowerCase().trim();
  const name = topic.character_name;
  const title = topic.title;

  // 1. Basic Greeting Handler
  if (isBasicGreeting(q)) {
    if (lang === 'en') {
      return `Hello! I am ${name}, your 3D AI Mentor for "${title}". How can I assist you with your exploration of ${title} today?`;
    }
    return `Halo! Saya adalah ${name}, 3D AI Mentor Anda untuk materi "${title}". Ada konsep atau topik spesifik seputar ${title} yang ingin Anda pelajari hari ini?`;
  }

  // 2. Identity Inquiry Handler
  if (isIdentityInquiry(q)) {
    if (lang === 'en') {
      return `I am ${name}, the dedicated 3D AI Mentor for "${title}" at MetaChain WebXR Academy. Persona: ${topic.character_persona}. My duty is strictly to guide you through ${title}.`;
    }
    return `Saya adalah ${name}, 3D AI Mentor khusus untuk materi "${title}" di MetaChain WebXR Academy. Persona saya: ${topic.character_persona}. Tugas utama saya adalah mendampingi Anda memahami materi ${title} dari tingkat dasar hingga mahir.`;
  }

  // 3. Strict Out-of-Context Check (Zero-Tolerance Scope Boundary)
  if (isOutOfContext(q, topic)) {
    if (lang === 'en') {
      return `I apologize, but that question is outside my scope and duty for the topic "${title}". As the dedicated mentor for this module, I can only assist with questions directly related to ${title}. Please feel free to ask anything about ${title}!`;
    }
    return `Maaf, pertanyaan tersebut di luar tugas dan konteks materi "${title}". Sebagai mentor khusus materi ini, saya hanya dapat menjawab pertanyaan yang berkaitan langsung dengan ${title}. Silakan ajukan pertanyaan seputar ${title}!`;
  }

  // 4. Topic Domain Educational Responses
  if (lang === 'en') {
    if (q.includes('what is') || q.includes('explain') || q.includes('definition')) {
      return `Welcome! I am ${name}. Remember that AI can make mistakes, but in concept, ${title} is centered on ${topic.description.toLowerCase()}. The core key is grasping its structural architecture and how data exchanges reliably. Which part would you like to explore deeper?`;
    }
    if (q.includes('benefit') || q.includes('advantage') || q.includes('why')) {
      return `Keep in mind that AI can make mistakes, but the paramount advantage of ${title} lies in scalability, system resilience, and minimizing operational friction in high-throughput environments. Without it, modern large-scale applications experience critical bottlenecks.`;
    }
    if (q.includes('roadmap') || q.includes('start') || q.includes('learn') || q.includes('beginner')) {
      return `My advice as ${name} (note that AI can make mistakes): Do not rush into complex frameworks right away! Master the foundational protocols first: understand data flows and state management, then construct a minimal proof-of-concept project locally.`;
    }
    if (q.includes('challenge') || q.includes('drawback') || q.includes('risk')) {
      return `Every technology entails trade-offs. In ${title}, the biggest hurdles typically involve the learning curve, security posture validation, and infrastructure overhead if not architected cleanly from the outset.`;
    }
    return `That is an interesting question regarding ${title}! Note that AI can make mistakes, but the core concept relates directly to ${topic.character_persona.split(',')[0]}. Feel free to ask more specific questions about ${title}!`;
  }

  // Indonesian responses
  if (q.includes('apa itu') || q.includes('jelaskan') || q.includes('pengertian')) {
    return `${topic.character_greeting} AI ini dapat membuat kesalahan, namun secara prinsip, ${title} adalah fondasi penting yang berfokus pada ${topic.description.toLowerCase()}. Kuncinya ada pada pemahaman arsitektur dan bagaimana komponen di dalamnya saling bertukar instruksi. Ada bagian spesifik yang ingin Anda bedah lebih dalam?`;
  }
  
  if (q.includes('kelebihan') || q.includes('manfaat') || q.includes('kenapa')) {
    return `Perlu diingat bahwa AI ini dapat membuat kesalahan. Namun keunggulan terbesar ${title} terletak pada efisiensi, skalabilitas, dan kemampuannya mengurangi kompleksitas operasional di lingkungan produksi modern. Tanpa fondasi ini, sistem berskala jutaan pengguna akan sangat rentan terhadap bottleneck.`;
  }

  if (q.includes('cara belajar') || q.includes('mulai dari mana') || q.includes('roadmap')) {
    return `Saran saya sebagai ${name} (ingat bahwa AI ini dapat membuat kesalahan): Jangan langsung loncat ke framework yang rumit! Kuasai dulu konsep dasarnya: bagaimana aliran datanya bekerja, pahami istilah intinya, lalu buatlah proyek mini untuk menguji konsep tersebut secara nyata di lingkungan lokal Anda.`;
  }

  if (q.includes('tantangan') || q.includes('kelemahan') || q.includes('bahaya')) {
    return `Setiap teknologi selalu memiliki trade-off. Untuk ${title}, tantangan terbesarnya biasanya ada pada kurva pembelajaran, pengelolaan keamanan (security posture), dan overhead biaya infrastruktur jika tidak dioptimasi sejak awal perancangan.`;
  }

  // General conversational reply inside topic domain
  return `Pertanyaan yang sangat menarik mengenai ${title}! Harap diingat bahwa AI ini dapat membuat kesalahan, namun poin kuncinya berkaitan erat dengan prinsip ${topic.character_persona.split(',')[0]}. Silakan ajukan aspek teknis lain seputar ${title} yang ingin Anda eksplorasi!`;
}

