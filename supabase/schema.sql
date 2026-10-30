-- ============================================================
-- METACHAIN VR TECH ACADEMY - DATABASE SCHEMA FOR SUPABASE
-- Versi dengan Enkripsi Password Bcrypt (pgcrypto) Otomatis
-- ============================================================

-- 1. EXTENSIONS (UUID & PGCRYPTO UNTUK ENKRIPSI PASSWORD)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES (Users managed strictly by Admin with Hashed Passwords)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Menyimpan hash bcrypt ($2a$...)
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRIGGER OTOMATIS: ENKRIPSI PASSWORD SEBELUM DISIMPAN KE DATABASE
CREATE OR REPLACE FUNCTION public.handle_profile_password_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya enkripsi jika password belum berupa hash bcrypt (tidak diawali $2)
    IF NEW.password_hash IS NOT NULL AND NEW.password_hash NOT LIKE '$2%' THEN
        NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf', 10));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hash_profile_password ON public.profiles;
CREATE TRIGGER trg_hash_profile_password
BEFORE INSERT OR UPDATE OF password_hash ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_profile_password_hash();

-- 4. FUNGSI VERIFIKASI LOGIN SECURE (RPC)
CREATE OR REPLACE FUNCTION public.verify_user_password(p_username TEXT, p_password TEXT)
RETURNS SETOF public.profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.profiles
    WHERE LOWER(TRIM(username)) = LOWER(TRIM(p_username))
      AND is_active = true
      AND (
          password_hash = crypt(p_password, password_hash)
          OR password_hash = p_password -- Fallback kompatibilitas transisi
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TOPICS & ASSOCIATED UNIQUE 3D AI CHARACTERS & CURRICULUM
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    
    -- Dedicated Character Attributes (Generated & Editable by Admin)
    character_name TEXT NOT NULL DEFAULT 'AI Mentor',
    character_persona TEXT,
    character_avatar_type TEXT NOT NULL DEFAULT 'cyber_humanoid' 
        CHECK (character_avatar_type IN ('cyber_humanoid', 'floating_orb', 'mech_guard', 'holo_sage')),
    character_primary_color TEXT NOT NULL DEFAULT '#06b6d4', -- Cyan neon
    character_secondary_color TEXT NOT NULL DEFAULT '#3b82f6', -- Blue
    character_greeting TEXT,
    character_voice_pitch REAL DEFAULT 1.0,
    character_voice_rate REAL DEFAULT 1.0,
    
    -- Learning Guide / Curriculum (If NULL, triggers AI Fallback on VR)
    guide_content TEXT,
    guide_file_url TEXT,
    guide_file_name TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Read Topics" ON public.topics;
DROP POLICY IF EXISTS "Full Access Topics" ON public.topics;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public Read Topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Full Access Topics" ON public.topics FOR ALL USING (true);

-- 7. STORAGE BUCKET CONFIGURATION (learning-materials)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learning-materials', 'learning-materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Public upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;

CREATE POLICY "Public read storage" ON storage.objects 
FOR SELECT USING (bucket_id = 'learning-materials');

CREATE POLICY "Public upload storage" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'learning-materials');

CREATE POLICY "Public delete storage" ON storage.objects 
FOR DELETE USING (bucket_id = 'learning-materials');

-- 8. INITIAL SEED DATA (Admin, Demo Student & 11 Core Tech Topics)
-- Password otomatis dienkripsi dengan bcrypt salt oleh trigger
INSERT INTO public.profiles (username, full_name, password_hash, role)
VALUES 
    ('admin', 'Head Administrator', crypt('admin', gen_salt('bf', 10)), 'admin'),
    ('student1', 'Alex Pratama (Siswa)', crypt('user123', gen_salt('bf', 10)), 'user')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;

-- Seed the 11 Topics with their own unique AI Mentor Characters
INSERT INTO public.topics (title, slug, description, order_index, character_name, character_persona, character_avatar_type, character_primary_color, character_secondary_color, character_greeting, guide_content)
VALUES 
(
    'Programming', 
    'programming', 
    'Fondasi logika kode, algoritma, struktur data, dan rekayasa software modern.', 
    1, 
    'Dev-Zero', 
    'Instruktur coding yang presisi, sabar, dan menyukai analogi praktis dunia nyata.', 
    'cyber_humanoid', 
    '#10b981', 
    '#059669',
    'Salam developer! Saya Dev-Zero. Mari kita mulai dari logika dasar hingga arsitektur kode kelas dunia.',
    '## Silabus Pemrograman Fondasional
1. Logika & Pemikiran Komputasional
2. Struktur Data Esensial: Arrays, Linked Lists, Hash Tables, Trees
3. Algoritma & Kompleksitas Big O
4. Clean Code & Prinsip SOLID'
),
(
    'Computer Network', 
    'computer-network', 
    'Fondasi arsitektur internet, protokol TCP/IP, routing, switching, dan komunikasi data.', 
    2, 
    'Net-Pulse', 
    'Spesialis topologi jaringan berkecepatan tinggi yang fokus pada aliran paket data.', 
    'floating_orb', 
    '#38bdf8', 
    '#0284c7',
    'Koneksi tersambung! Saya Net-Pulse. Bersama saya, Anda akan melihat bagaimana data melintasi dunia dalam milidetik.',
    '## Kurikulum Arsitektur Jaringan
1. OSI Model 7 Lapisan vs TCP/IP
2. Paket Data & Protokol Handshake
3. Routing, BGP, OSPF, dan Subnetting
4. DNS & Global Content Delivery Network (CDN)'
),
(
    'Cloud Computing', 
    'cloud-computing', 
    'Infrastruktur awan, serverless, storage terdistribusi, dan layanan hyperscaler.', 
    3, 
    'Nimbus-Prime', 
    'Arsitek komputasi awan yang tenang, holistik, dan berfokus pada skalabilitas global.', 
    'holo_sage', 
    '#60a5fa', 
    '#93c5fd',
    'Selamat datang di ruang awan. Saya Nimbus-Prime, pemandu Anda membangun infrastruktur tanpa batas fisik.',
    NULL -- Mode AI Fallback
),
(
    'DevOps', 
    'devops', 
    'Otomasi deployment, containerisasi Docker, orkestrasi Kubernetes, dan pipeline CI/CD.', 
    4, 
    'Octo-Ops', 
    'Insinyur otomasi yang energik dan membenci proses manual yang membuang waktu.', 
    'mech_guard', 
    '#f59e0b', 
    '#d97706',
    'Deploy otomatis dimulai! Saya Octo-Ops. Kita akan hilangkan bug dan buat siklus rilis secepat kilat.',
    '## Kurikulum DevOps & Automasi
1. Container Fundamentals & Docker
2. Kubernetes Cluster Orchestration
3. Continuous Integration & Delivery (CI/CD)
4. Infrastructure as Code (IaC) Terraform'
),
(
    'System Design', 
    'system-design', 
    'Perancangan arsitektur sistem skala besar, microservices, load balancer, dan sharding.', 
    5, 
    'Archon-Core', 
    'Master arsitektur sistem yang berpikir ribuan langkah ke depan untuk jutaan request per detik.', 
    'holo_sage', 
    '#8b5cf6', 
    '#6d28d9',
    'Skalabilitas adalah seni. Saya Archon-Core, mari kita rancang sistem yang tidak akan pernah tumbang.',
    NULL -- Mode AI Fallback
),
(
    'Cybersecurity', 
    'cybersecurity', 
    'Keamanan siber, pertahanan jaringan, kriptografi, ethical hacking, dan mitigasi ancaman.', 
    6, 
    'Aegis-Shield', 
    'Penjaga siber yang waspada, taktis, dan selalu selangkah lebih maju dari peretas jahat.', 
    'mech_guard', 
    '#ef4444', 
    '#991b1b',
    'Protokol keamanan aktif! Saya Aegis-Shield. Mari pelajari cara bertahan dan menemukan celah sebelum dieksploitasi.',
    '## Kurikulum Keamanan Siber
1. Arsitektur Pertahanan Zero Trust
2. Kriptografi Simetris & Asimetris
3. Vulnerability Assessment & OWASP Top 10
4. Incident Response & Threat Mitigation'
),
(
    'Blockchain', 
    'blockchain', 
    'Buku besar terdistribusi, mekanisme konsensus (PoW/PoS), hash kriptografis, dan desentralisasi.', 
    7, 
    'Satoshi-Node', 
    'Kriptografer terdesentralisasi yang filosofis dan mempercayai kekuatan matematika murni.', 
    'cyber_humanoid', 
    '#f59e0b', 
    '#10b981',
    'Don''t trust, verify! Saya Satoshi-Node. Selamat datang di era buku besar yang transparan dan abadi.',
    '## Panduan Belajar Blockchain
1. Anatomi Blok 3D & Merkle Tree Root
2. Mekanisme Konsensus PoW vs PoS
3. Kriptografi Kurva Elips (ECC)
4. Jaringan Node P2P Terdistribusi'
),
(
    'Web3 & Smart Contracts', 
    'web3-smart-contracts', 
    'Aplikasi terdesentralisasi (DApps), smart contract Solidity, DeFi, dan ekosistem token.', 
    8, 
    'Sol-Oracle', 
    'Inovator Web3 yang lincah dan berfokus pada eksekusi kode otomatis tanpa perantara.', 
    'floating_orb', 
    '#ec4899', 
    '#be185d',
    'Kode adalah hukum! Saya Sol-Oracle. Mari kita racik kontrak pintar yang aman dan menggerakkan ekonomi Web3.',
    NULL -- Mode AI Fallback
),
(
    'AI & Machine Learning', 
    'ai-machine-learning', 
    'Model machine learning, neural networks, deep learning, NLP, dan Generative AI/LLM.', 
    9, 
    'Synapse-AI', 
    'Entitas kecerdasan buatan adaptif yang menjelajahi pemahaman data dan penalaran mesin.', 
    'floating_orb', 
    '#a855f7', 
    '#06b6d4',
    'Pola terdeteksi. Saya Synapse-AI. Kita akan menyelami cara mesin belajar, berfikir, dan berkreasi.',
    '## Kurikulum Kecerdasan Buatan & ML
1. Representasi Data & Vector Embeddings
2. Artificial Neural Networks & Backpropagation
3. Transformer & Attention Mechanism (LLM)
4. AI Alignment & Model Safety'
),
(
    'Spatial Computing & WebXR', 
    'spatial-computing-webxr', 
    'Pemrograman 3D di web, WebXR, Three.js, lingkungan Virtual Reality dan Augmented Reality.', 
    10, 
    'Voxel-Wanderer', 
    'Arsitek dimensi virtual yang menguasai ruang tiga dimensi di browser.', 
    'cyber_humanoid', 
    '#14b8a6', 
    '#0d9488',
    'Selamat datang di dimensi ketiga! Saya Voxel-Wanderer, mentor Anda merancang dunia imersif seperti tempat kita berpijak sekarang.',
    NULL -- Mode AI Fallback
),
(
    'Internet of Things (IoT)', 
    'internet-of-things', 
    'Integrasi sensor cerdas, mikrokontroler, protokol MQTT, dan komputasi edge fisik.', 
    11, 
    'Circuit-Ghost', 
    'Insinyur perangkat keras yang menghubungkan dunia fisik ke jaringan cloud global.', 
    'mech_guard', 
    '#eab308', 
    '#ca8a04',
    'Sensor membaca suhu dan frekuensi. Saya Circuit-Ghost. Mari kita jembatani dunia nyata dengan kode virtual.',
    '## Kurikulum Internet of Things (IoT)
1. Mikrokontroler & Sensor GPIO
2. Protokol Ringan MQTT & WebSocket
3. Edge Computing & Data Filtering
4. IoT Security & Firmware OTA'
)
ON CONFLICT (slug) DO NOTHING;
