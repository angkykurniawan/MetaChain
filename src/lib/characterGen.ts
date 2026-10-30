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

  greeting = `Halo! Saya ${charName}, mentor virtual Anda untuk materi ${topicTitle || 'ini'}. Harap diingat bahwa eksplorasi kita didasarkan pada perspektif dan tanggapan pribadi saya. Mari kita mulai belajar!`;

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
export function generateAIFallbackCurriculum(topicTitle: string): string {
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
 * AI Conversational Engine for answering student questions inside the VR Hub
 */
export function generateAIAnswer(topic: Topic, userQuestion: string): string {
  const q = userQuestion.toLowerCase();
  const name = topic.character_name;
  const title = topic.title;

  // Domain specific thoughtful answers
  if (q.includes('apa itu') || q.includes('jelaskan') || q.includes('pengertian')) {
    return `${topic.character_greeting} Menurut perspektif saya, ${title} adalah fondasi penting yang berfokus pada ${topic.description.toLowerCase()}. Kuncinya ada pada pemahaman arsitektur dan bagaimana komponen di dalamnya saling bertukar instruksi. Ada bagian spesifik yang ingin Anda bedah lebih dalam?`;
  }
  
  if (q.includes('kelebihan') || q.includes('manfaat') || q.includes('kenapa')) {
    return `Dari sudut pandang saya, keunggulan terbesar ${title} terletak pada efisiensi, skalabilitas, dan kemampuannya mengurangi kompleksitas operasional di lingkungan produksi modern. Tanpa fondasi ini, sistem berskala jutaan pengguna akan sangat rentan terhadap bottleneck.`;
  }

  if (q.includes('cara belajar') || q.includes('mulai dari mana') || q.includes('roadmap')) {
    return `Saran pribadi saya sebagai ${name}: Jangan langsung loncat ke framework yang rumit! Kuasai dulu konsep dasarnya: bagaimana aliran datanya bekerja, pahami istilah intinya, lalu buatlah proyek mini untuk menguji konsep tersebut secara nyata di lingkungan lokal Anda.`;
  }

  if (q.includes('tantangan') || q.includes('kelemahan') || q.includes('bahaya')) {
    return `Setiap teknologi selalu memiliki trade-off. Untuk ${title}, tantangan terbesarnya biasanya ada pada kurva pembelajaran, pengelolaan keamanan (security posture), dan overhead biaya infrastruktur jika tidak dioptimasi sejak awal perancangan.`;
  }

  // General conversational reply
  return `Pertanyaan yang sangat menarik mengenai ${title}! Berdasarkan analisa dan perspektif saya, poin kuncinya berkaitan erat dengan prinsip ${topic.character_persona.split(',')[0]}. Mari kita eksplorasi lebih jauh, Anda bisa menanyakan studi kasus nyatanya jika mau!`;
}

