# MetaChain — WebXR Tech Academy

Website belajar teknologi (Blockchain, Web3, Cloud, DevOps, dll) dengan tampilan Virtual Reality langsung di browser. Siswa belajar bareng Mentor AI 3D yang bisa diajak ngobrol lewat suara, sementara Admin mengelola materi lewat dashboard biasa yang cepat.

---

## Gambaran Singkat Sistem

### 1. Dua Hak Akses (Role)
* **Admin (Dashboard 2D):**
  * Daftarkan akun siswa (siswa tidak bisa daftar sendiri).
  * Kelola 11 materi utama atau tambah materi baru.
  * Ada tombol **"⚡ Generate Karakter"** untuk buat avatar 3D & kepribadian mentor secara otomatis.
  * Upload modul/PDF ke storage.
  * Bebas pilih otak AI yang dipakai (**Google Gemini, OpenAI, Claude, atau DeepSeek**).
* **Siswa (Ruang Virtual 3D):**
  * Begitu login, langsung masuk ke ruangan 3D (bisa pakai headset VR, HP, atau laptop biasa).
  * Di depan ada karakter 3D unik dan layar hologram melayang.
  * Bisa tanya jawab langsung lewat mikrofon atau ketik teks.

### 2. Fitur Unggulan
* **1 Materi = 1 Karakter 3D Khusus:** Tiap materi diajar oleh karakter yang beda (bentuk 3D, warna neon, dan gaya bicaranya menyesuaikan topik).
* **AI Fallback:** Kalau Admin belum sempat upload materi, AI Mentor otomatis menyusun kurikulum dan penjelasannya sendiri di VR.
* **Privasi Penuh (Zero-Retention):** Obrolan suara dan teks **tidak pernah disimpan** di database. Begitu tab ditutup atau ganti topik, riwayat chat langsung terhapus bersih dari RAM.
* **Password Terenkripsi:** Password akun disimpan dalam bentuk hash Bcrypt (`pgcrypto`) di Supabase, bukan teks biasa.
* **Disclaimer:** Ada pengingat di layar bahwa materi yang diajarkan merupakan perspektif/pandangan pribadi.
* **Suara Gratis:** Menggunakan Web Speech API bawaan browser, tidak ada biaya langganan suara luar.

---

## Urutan 11 Materi Bawaan
1. **Programming** (Mentor: Dev-Zero)
2. **Computer Network** (Mentor: Net-Pulse)
3. **Cloud Computing** (Mentor: Nimbus-Prime)
4. **DevOps** (Mentor: Octo-Ops)
5. **System Design** (Mentor: Archon-Core)
6. **Cybersecurity** (Mentor: Aegis-Shield)
7. **Blockchain** (Mentor: Satoshi-Node)
8. **Web3 & Smart Contracts** (Mentor: Sol-Oracle)
9. **AI & Machine Learning** (Mentor: Synapse-AI)
10. **Spatial Computing & WebXR** (Mentor: Voxel-Wanderer)
11. **Internet of Things / IoT** (Mentor: Circuit-Ghost)

---

## Cara Menjalankan Proyek

### 1. Jalankan di Komputer Lokal
Pastikan Node.js sudah terpasang, lalu ketik di terminal:
```bash
npm install
npm run dev
```
Buka browser di: `http://localhost:5173`

*(Aplikasi sudah punya adapter offline otomatis. Tanpa setting database pun, semua fitur dan tampilan 3D sudah bisa langsung dicoba).*

### 2. Akun Bawaan untuk Uji Coba
* **Akun Siswa:** `student1` / password: `user123` *(masuk ke ruang VR)*

---

## Menghubungkan ke Supabase (Database & Storage)

1. Buka dashboard proyek di [Supabase](https://supabase.com).
2. Masuk ke menu **SQL Editor**, buka file `supabase/schema.sql`, salin seluruh isinya, lalu klik **Run**.
3. Buka file `.env` di folder proyek, lalu isi URL dan Anon Key:
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=key-anon-anda
   ```
4. Selesai. Status di website otomatis berubah jadi *Supabase Cloud Live*.

---

## Mengatur Otak AI (Opsional)
Bisa diatur lewat menu **"Integrasi AI Provider"** di Dashboard Admin (tanpa edit kode), atau tulis di `.env`:
```env
VITE_AI_PROVIDER=google   # opsi: google | openai | anthropic | deepseek
VITE_GEMINI_API_KEY=kunci-api-anda
```
*(Kalau API key dikosongkan, sistem tetap berjalan normal menggunakan engine offline bawaan).*

---

## Tech Stack
* **Frontend:** TypeScript, React 19, Vite, Tailwind CSS
* **3D & VR:** Three.js, WebXR Device API
* **Backend & Database:** Supabase (PostgreSQL, Storage, Bcrypt pgcrypto)
* **Voice Engine:** Web Speech API (STT & TTS)
