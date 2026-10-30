import { Topic, Profile } from '../types/index';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'topic-1',
    title: 'Programming',
    slug: 'programming',
    description: 'Fondasi logika kode, algoritma, struktur data, dan rekayasa software modern.',
    order_index: 1,
    character_name: 'Dev-Zero',
    character_persona: 'Instruktur coding yang presisi, metodis, dan gemar menggunakan analogi praktis dunia nyata untuk mengurai kode rumit.',
    character_avatar_type: 'cyber_humanoid',
    character_primary_color: '#10b981', // Emerald neon
    character_secondary_color: '#059669',
    character_greeting: 'Salam developer! Saya Dev-Zero. Mari kita mulai dari logika dasar hingga arsitektur kode kelas dunia.',
    character_voice_pitch: 1.0,
    character_voice_rate: 1.05,
    guide_content: `## Silabus Pemrograman Fondasional
1. **Logika & Pemikiran Komputasional:** Paradigma pemecahan masalah dan dekomposisi sistem.
2. **Struktur Data Esensial:** Arrays, Linked Lists, Hash Tables, dan Binary Trees.
3. **Algoritma & Kompleksitas:** Analisis Big O Notation, Sorting, dan Searching.
4. **Clean Code & Design Patterns:** Prinsip SOLID, DRY, dan arsitektur modular.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-2',
    title: 'Computer Network',
    slug: 'computer-network',
    description: 'Fondasi arsitektur internet, protokol TCP/IP, routing, switching, dan komunikasi data.',
    order_index: 2,
    character_name: 'Net-Pulse',
    character_persona: 'Spesialis topologi jaringan berkecepatan tinggi yang fokus pada aliran paket data dan keandalan transmisi.',
    character_avatar_type: 'floating_orb',
    character_primary_color: '#38bdf8', // Sky blue
    character_secondary_color: '#0284c7',
    character_greeting: 'Koneksi tersambung! Saya Net-Pulse. Bersama saya, Anda akan melihat bagaimana data melintasi dunia dalam milidetik.',
    character_voice_pitch: 1.15,
    character_voice_rate: 1.1,
    guide_content: `## Kurikulum Arsitektur Jaringan
1. **OSI Model vs TCP/IP:** 7 Lapisan abstraksi komunikasi komputer.
2. **Paket Data & Protokol:** Mekanisme handshake TCP, UDP streaming, dan HTTP/3 QUIC.
3. **Routing & Switching:** BGP, OSPF, subnetting IPv4/IPv6, dan VLAN.
4. **DNS & CDN:** Resolusi nama domain global dan edge caching.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-3',
    title: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Infrastruktur awan, serverless, storage terdistribusi, dan layanan hyperscaler.',
    order_index: 3,
    character_name: 'Nimbus-Prime',
    character_persona: 'Arsitek komputasi awan yang tenang, holistik, dan berfokus pada skalabilitas global elastis.',
    character_avatar_type: 'holo_sage',
    character_primary_color: '#60a5fa', // Blue
    character_secondary_color: '#93c5fd',
    character_greeting: 'Selamat datang di ruang awan. Saya Nimbus-Prime, pemandu Anda membangun infrastruktur tanpa batas fisik.',
    character_voice_pitch: 0.95,
    character_voice_rate: 1.0,
    guide_content: null, // DELIBERATELY NULL to demonstrate AI Fallback mode!
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-4',
    title: 'DevOps',
    slug: 'devops',
    description: 'Otomasi deployment, containerisasi Docker, orkestrasi Kubernetes, dan pipeline CI/CD.',
    order_index: 4,
    character_name: 'Octo-Ops',
    character_persona: 'Insinyur otomasi yang energik, mengutamakan zero-downtime deployment dan otomatisasi penuh tanpa intervensi manual.',
    character_avatar_type: 'mech_guard',
    character_primary_color: '#f59e0b', // Amber
    character_secondary_color: '#d97706',
    character_greeting: 'Deploy otomatis dimulai! Saya Octo-Ops. Kita akan hilangkan bug dan buat siklus rilis secepat kilat.',
    character_voice_pitch: 0.9,
    character_voice_rate: 1.1,
    guide_content: `## Kurikulum DevOps & Automasi
1. **Container Fundamentals:** Dockerfile, image layers, dan container isolation.
2. **Container Orchestration:** Kubernetes pods, services, ingress, dan deployments.
3. **Continuous Integration & Delivery:** GitHub Actions, GitLab CI, dan automated testing.
4. **Infrastructure as Code (IaC):** Terraform dan Ansible untuk konfigurasi deklaratif.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-5',
    title: 'System Design',
    slug: 'system-design',
    description: 'Perancangan arsitektur sistem berskala jutaan pengguna, microservices, dan database sharding.',
    order_index: 5,
    character_name: 'Archon-Core',
    character_persona: 'Master arsitek sistem yang visioner, selalu memperhitungkan batas ambang kegagalan (*fault-tolerance*) dan high-availability.',
    character_avatar_type: 'holo_sage',
    character_primary_color: '#8b5cf6', // Violet
    character_secondary_color: '#6d28d9',
    character_greeting: 'Skalabilitas adalah seni. Saya Archon-Core, mari kita rancang sistem yang tangguh menghadapi jutaan request per detik.',
    character_voice_pitch: 0.92,
    character_voice_rate: 0.98,
    guide_content: null, // Demonstrates AI Fallback mode!
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-6',
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Keamanan siber, pertahanan jaringan, kriptografi, ethical hacking, dan mitigasi ancaman.',
    order_index: 6,
    character_name: 'Aegis-Shield',
    character_persona: 'Penjaga siber taktis yang waspada, mengutamakan pertahanan berlapis (defense-in-depth) dan Zero Trust architecture.',
    character_avatar_type: 'mech_guard',
    character_primary_color: '#ef4444', // Red
    character_secondary_color: '#991b1b',
    character_greeting: 'Protokol keamanan aktif! Saya Aegis-Shield. Mari pelajari cara bertahan dan menemukan celah sebelum dieksploitasi musuh.',
    character_voice_pitch: 0.85,
    character_voice_rate: 1.0,
    guide_content: `## Kurikulum Keamanan Siber
1. **Prinsip Zero Trust:** Otentikasi ketat, least privilege, dan segmentasi mikro.
2. **Kriptografi Terapan:** Enkripsi simetris/asimetris, hashing SHA-256, dan Public Key Infrastructure (PKI).
3. **Vulnerability Assessment:** OWASP Top 10, penetration testing, dan analisis exploit.
4. **Incident Response & Defense:** SIEM, threat hunting, dan mitigasi serangan DDoS.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-7',
    title: 'Blockchain',
    slug: 'blockchain',
    description: 'Teknologi buku besar terdistribusi, konsensus PoW/PoS, hash kriptografis, dan desentralisasi.',
    order_index: 7,
    character_name: 'Satoshi-Node',
    character_persona: 'Kriptografer terdesentralisasi yang filosofis, mempercayai konsensus matematis murni tanpa pihak ketiga terpusat.',
    character_avatar_type: 'cyber_humanoid',
    character_primary_color: '#f59e0b', // Gold / Amber
    character_secondary_color: '#10b981',
    character_greeting: 'Don\'t trust, verify! Saya Satoshi-Node. Selamat datang di era buku besar yang transparan, aman, dan abadi.',
    character_voice_pitch: 1.0,
    character_voice_rate: 1.0,
    guide_content: `## Panduan Belajar Blockchain
1. **Anatomi Blok 3D:** Block header, previous hash, Merkle tree root, nonce, dan transaksi.
2. **Mekanisme Konsensus:** Proof of Work (PoW) vs Proof of Stake (PoS) vs BFT.
3. **Kriptografi Kurva Elips:** Private key, public key, dan tanda tangan digital.
4. **P2P Node Network:** Validasi blok terdistribusi dan pencegahan double-spending.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-8',
    title: 'Web3 & Smart Contracts',
    slug: 'web3-smart-contracts',
    description: 'Aplikasi terdesentralisasi (DApps), smart contract Solidity, DeFi, dan ekosistem token.',
    order_index: 8,
    character_name: 'Sol-Oracle',
    character_persona: 'Inovator Web3 lincah yang berfokus pada eksekusi kode otomatis tanpa perantara dan ekonomi token digital.',
    character_avatar_type: 'floating_orb',
    character_primary_color: '#ec4899', // Pink neon
    character_secondary_color: '#be185d',
    character_greeting: 'Kode adalah hukum! Saya Sol-Oracle. Mari kita racik kontrak pintar yang aman dan menggerakkan ekonomi masa depan.',
    character_voice_pitch: 1.1,
    character_voice_rate: 1.05,
    guide_content: null, // Demonstrates AI Fallback mode!
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-9',
    title: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Model machine learning, neural networks, deep learning, NLP, dan Generative AI/LLM.',
    order_index: 9,
    character_name: 'Synapse-AI',
    character_persona: 'Entitas kecerdasan buatan adaptif yang menjelajahi pemahaman data, representasi vektor, dan penalaran mesin.',
    character_avatar_type: 'floating_orb',
    character_primary_color: '#a855f7', // Purple neon
    character_secondary_color: '#06b6d4',
    character_greeting: 'Pola neural terdeteksi. Saya Synapse-AI. Kita akan menyelami cara mesin belajar, berfikir, dan berkreasi.',
    character_voice_pitch: 1.05,
    character_voice_rate: 1.0,
    guide_content: `## Kurikulum Kecerdasan Buatan & ML
1. **Representasi Data & Vektor:** Matriks, embeddings, dan ekstraksi fitur.
2. **Jaringan Syaraf Tiruan (ANN):** Forward propagation, loss functions, dan backpropagation.
3. **Transformer & Attention Mechanism:** Arsitektur di balik model bahasa besar (LLM).
4. **Etika & Penyelarasan AI:** Mengontrol bias dan keselamatan model AI.`,
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-10',
    title: 'Spatial Computing & WebXR',
    slug: 'spatial-computing-webxr',
    description: 'Pemrograman 3D di web, WebXR API, Three.js, lingkungan Virtual Reality dan Augmented Reality.',
    order_index: 10,
    character_name: 'Voxel-Wanderer',
    character_persona: 'Arsitek dimensi virtual yang menguasai ruang tiga dimensi di browser dan interaksi spasial.',
    character_avatar_type: 'cyber_humanoid',
    character_primary_color: '#14b8a6', // Teal
    character_secondary_color: '#0d9488',
    character_greeting: 'Selamat datang di dimensi ketiga! Saya Voxel-Wanderer, mentor Anda merancang dunia imersif seperti tempat kita berpijak sekarang.',
    character_voice_pitch: 1.0,
    character_voice_rate: 1.0,
    guide_content: null, // Demonstrates AI Fallback mode!
    guide_file_url: null,
    guide_file_name: null
  },
  {
    id: 'topic-11',
    title: 'Internet of Things (IoT)',
    slug: 'internet-of-things',
    description: 'Integrasi sensor cerdas, mikrokontroler ESP32/Arduino, protokol MQTT, dan komputasi edge fisik.',
    order_index: 11,
    character_name: 'Circuit-Ghost',
    character_persona: 'Insinyur perangkat keras yang menghubungkan sinyal fisik ke jaringan internet global secara realtime.',
    character_avatar_type: 'mech_guard',
    character_primary_color: '#eab308', // Yellow
    character_secondary_color: '#ca8a04',
    character_greeting: 'Sensor membaca sinyal aktif. Saya Circuit-Ghost. Mari kita jembatani dunia nyata dengan komputasi awan.',
    character_voice_pitch: 0.9,
    character_voice_rate: 1.05,
    guide_content: `## Kurikulum Internet of Things (IoT)
1. **Mikrokontroler & Sensor:** Pembacaan analog/digital GPIO pada ESP32 & Raspberry Pi.
2. **Protokol Ringan IoT:** MQTT Publish-Subscribe, CoAP, dan WebSocket.
3. **Edge Computing:** Pemrosesan data sensor lokal sebelum diteruskan ke cloud.
4. **IoT Security:** Enkripsi transmisi data perangkat keras dan OTA firmware update.`,
    guide_file_url: null,
    guide_file_name: null
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof-admin',
    username: 'admin',
    full_name: 'Head Administrator',
    password: 'admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prof-student1',
    username: 'student1',
    full_name: 'Alex Pratama (Siswa)',
    password: 'user123',
    role: 'user',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

