import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

export interface Translations {
  // Brand & Common
  brandTagline: string;
  adminPanel: string;
  adminSubtitle: string;
  vrPreviewBtn: string;
  backToAdmin: string;
  logout: string;
  save: string;
  saved: string;
  cancel: string;
  edit: string;
  delete: string;
  active: string;
  inactive: string;
  loading: string;
  close: string;
  or: string;

  // Login
  loginTitle: string;
  usernameLabel: string;
  passwordLabel: string;
  loginBtn: string;
  quickDemoTitle: string;
  adminDemoBtn: string;
  studentDemoBtn: string;
  loginNotice: string;
  loginErrorEmpty: string;

  // Admin Navigation & Tabs
  tabCurriculum: string;
  tabStudents: string;
  tabAI: string;
  topicCountLabel: string;

  // Topic Management
  topicSectionTitle: string;
  topicSectionSubtitle: string;
  addTopicBtn: string;
  editTopicTitle: string;
  newTopicTitle: string;
  topicNameLabel: string;
  orderLabel: string;
  descLabel: string;
  dedicatedCharTitle: string;
  generateCharBtn: string;
  customCharBtn: string;
  guideLabel: string;
  guidePlaceholder: string;
  guideUploadLabel: string;
  uploadFileBtn: string;
  uploading: string;
  aiFallbackNotice: string;
  guideAdminInstalled: string;
  aiFallbackActive: string;
  downloadPdf: string;
  deleteTopicConfirm: string;

  // Character Modal
  charModalTitle: string;
  charNameLabel: string;
  avatarTypeLabel: string;
  visualStyleLabel: string;
  primaryColorLabel: string;
  secondaryColorLabel: string;
  personaLabel: string;
  personaPlaceholder: string;
  greetingLabel: string;
  pitchLabel: string;
  rateLabel: string;
  testVoiceBtn: string;
  playingVoice: string;
  saveCharBtn: string;

  // Student Management
  studentSectionTitle: string;
  studentSectionSubtitle: string;
  addStudentBtn: string;
  addStudentModalTitle: string;
  addStudentModalDesc: string;
  fullNameLabel: string;
  tempPasswordLabel: string;
  roleLabel: string;
  roleStudent: string;
  roleAdmin: string;
  createAccountBtn: string;
  deleteStudentConfirm: string;
  studentTableColName: string;
  studentTableColUser: string;
  studentTableColRole: string;
  studentTableColStatus: string;
  studentTableColAction: string;

  // AI Provider Tab & Modal
  aiCenterTitle: string;
  aiCenterSubtitle: string;
  chooseProviderLabel: string;
  step1ApiKey: string;
  step2Model: string;
  modelLocked: string;
  modelUnlocked: string;
  keyRequired: string;
  keyInstalled: string;
  unlockModelHint: string;
  getApiKeyLink: string;
  applyAIBtn: string;

  // VR Experience
  enterVRBtn: string;
  inVRStatus: string;
  orbitHint: string;
  curriculumTab: string;
  chatTab: string;
  speakingBtn: string;
  mentorSpeakingStatus: string;
  listeningStatus: string;
  zeroRetentionNotice: string;
  askPlaceholder: string;
  disclaimerText: string;
  noChatPrompt: string;
  quickPrompt1: string;
  quickPrompt2: string;
  quickPrompt3: string;
  quickPrompt4: string;
  curriculumFromAdmin: string;
  curriculumFromAI: string;

  // Landing Page
  navHome: string;
  navFeatures: string;
  navModules: string;
  navDemo: string;
  heroHeadline: string;
  heroSubheadline: string;
  exploreBtn: string;
  requestDemoBtn: string;
  demoSectionTitle: string;
  demoSectionDesc: string;
  sendEmailBtn: string;
  copyEmailBtn: string;
  emailCopiedMsg: string;
  featuresTitle: string;
  modulesTitle: string;
  modulesSubtitle: string;
}

const translations: Record<Language, Translations> = {
  id: {
    // Brand & Common
    brandTagline: 'WebXR Tech Academy & 3D AI Mentors',
    adminPanel: 'Panel Admin',
    adminSubtitle: 'Pusat Manajemen Kurikulum & Karakter 3D',
    vrPreviewBtn: 'Uji Coba Tampilan VR',
    backToAdmin: '← Kembali ke Admin Dashboard',
    logout: 'Keluar',
    save: 'Simpan',
    saved: 'Tersimpan!',
    cancel: 'Batal',
    edit: 'Edit',
    delete: 'Hapus',
    active: 'Aktif',
    inactive: 'Nonaktif',
    loading: 'Memuat...',
    close: 'Tutup',
    or: 'atau',

    // Login
    loginTitle: 'Masuk ke Platform',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginBtn: 'Masuk ke Platform',
    quickDemoTitle: 'Uji Coba Cepat (One-Click Credentials):',
    adminDemoBtn: 'Admin Demo',
    studentDemoBtn: 'Siswa Demo (VR)',
    loginNotice: '*Akun siswa wajib didaftarkan oleh Administrator melalui Dashboard.',
    loginErrorEmpty: 'Harap isi username dan password.',

    // Admin Navigation & Tabs
    tabCurriculum: 'Kurikulum & Karakter AI (11 Modul)',
    tabStudents: 'Manajemen Siswa (Pengguna VR)',
    tabAI: 'Integrasi AI Provider',
    topicCountLabel: 'Modul',

    // Topic Management
    topicSectionTitle: 'Kurikulum & Karakter 3D AI Mentor',
    topicSectionSubtitle: 'Setiap materi dilengkapi 1 Karakter 3D khusus. Jika panduan belajar dikosongkan, AI Mentor otomatis mengenerate materi di VR.',
    addTopicBtn: 'Tambah Materi Baru',
    editTopicTitle: 'Edit Materi Pembelajaran',
    newTopicTitle: 'Tambah Materi Baru',
    topicNameLabel: 'Judul Materi *',
    orderLabel: 'Urutan Belajar',
    descLabel: 'Deskripsi Ringkas',
    dedicatedCharTitle: 'Karakter 3D AI Mentor Khusus',
    generateCharBtn: 'Generate Karakter',
    customCharBtn: 'Edit Karakter',
    guideLabel: 'Panduan Belajar (Silabus Admin)',
    guidePlaceholder: 'Tulis silabus, konsep kunci, atau panduan materi di sini...',
    guideUploadLabel: 'Upload dokumen/PDF panduan (Supabase Storage)',
    uploadFileBtn: 'Pilih File',
    uploading: 'Mengunggah...',
    aiFallbackNotice: 'Logika AI Fallback: Jika teks panduan dan file dokumen dikosongkan, AI Mentor di VR akan secara otomatis mengambil kurikulum langsung dari otak AI.',
    guideAdminInstalled: 'Panduan Admin Terpasang',
    aiFallbackActive: 'Mode AI Fallback Otomatis',
    downloadPdf: 'Unduh Dokumen PDF',
    deleteTopicConfirm: 'Hapus materi ini beserta karakter AI pendampingnya?',

    // Character Modal
    charModalTitle: 'Kustomisasi Karakter 3D AI Mentor',
    charNameLabel: 'Nama Karakter',
    avatarTypeLabel: 'Tipe Model 3D Avatar',
    visualStyleLabel: 'Pilih Gaya Visual 3D',
    primaryColorLabel: 'Warna Neon Utama',
    secondaryColorLabel: 'Warna Sekunder / Aksen',
    personaLabel: 'Persona & Gaya Komunikasi',
    personaPlaceholder: 'Contoh: Instruktur analitis, ramah, gemar memberi contoh analogi praktis...',
    greetingLabel: 'Pesan Sambutan Awal (Voice Greeting)',
    pitchLabel: 'Nada Suara (Pitch)',
    rateLabel: 'Kecepatan Bicara (Rate)',
    testVoiceBtn: 'Uji Coba Suara Sambutan Karakter',
    playingVoice: 'Memutar Suara Karakter...',
    saveCharBtn: 'Simpan Konfigurasi Karakter',

    // Student Management
    studentSectionTitle: 'Manajemen Akun Siswa (Pengguna VR)',
    studentSectionSubtitle: 'Semua pengguna VR harus didaftarkan oleh Administrator. Siswa tidak memiliki akses self-registration.',
    addStudentBtn: 'Daftarkan Siswa Baru',
    addStudentModalTitle: 'Daftarkan Akun Siswa Baru',
    addStudentModalDesc: 'Akun ini akan langsung dapat digunakan untuk masuk ke ruang VR.',
    fullNameLabel: 'Nama Lengkap',
    tempPasswordLabel: 'Password Sementara',
    roleLabel: 'Role Akun',
    roleStudent: 'Siswa (Akses Pembelajaran VR)',
    roleAdmin: 'Administrator (Akses Dashboard CRUD)',
    createAccountBtn: 'Buat Akun',
    deleteStudentConfirm: 'Hapus akun siswa ini? Tindakan ini tidak dapat dibatalkan.',
    studentTableColName: 'Nama Lengkap',
    studentTableColUser: 'Username',
    studentTableColRole: 'Role',
    studentTableColStatus: 'Status Akun',
    studentTableColAction: 'Aksi',

    // AI Provider Tab & Modal
    aiCenterTitle: 'Pusat Pengaturan Model AI (Multi-LLM)',
    aiCenterSubtitle: 'Tentukan provider dan model AI yang digunakan oleh seluruh Karakter 3D AI Mentor untuk menjawab obrolan suara dan teks di ruang VR.',
    chooseProviderLabel: 'Pilih Provider AI',
    step1ApiKey: 'Langkah 1: Masukkan API Key',
    step2Model: 'Langkah 2: Pilihan Model',
    modelLocked: 'Terkunci',
    modelUnlocked: 'Terbuka',
    keyRequired: 'Wajib Diisi',
    keyInstalled: 'Kunci Terpasang',
    unlockModelHint: 'Masukkan API Key pada langkah 1 di atas untuk membuka pilihan model.',
    getApiKeyLink: 'Dapatkan API Key resmi di sini:',
    applyAIBtn: 'Simpan & Terapkan AI',

    // VR Experience
    enterVRBtn: 'Enter WebXR VR',
    inVRStatus: 'Sedang di VR',
    orbitHint: 'Gunakan mouse drag untuk rotasi kamera 360°',
    curriculumTab: 'Panduan Materi',
    chatTab: 'Tanya Jawab Suara',
    speakingBtn: 'Bicara...',
    mentorSpeakingStatus: 'Mentor sedang berbicara...',
    listeningStatus: 'Mendengarkan suara Anda...',
    zeroRetentionNotice: 'Privasi Terjamin: Percakapan ini tidak disimpan di database manapun (RAM-Only).',
    askPlaceholder: 'Tanyakan sesuatu seputar materi ini...',
    disclaimerText: 'Pemberitahuan: AI ini dapat membuat kesalahan. Harap pertimbangkan untuk memeriksa informasi penting.',
    noChatPrompt: 'Mulai percakapan dengan menekan tombol mic di bawah atau pilih pertanyaan cepat.',
    quickPrompt1: 'Apa itu materi ini?',
    quickPrompt2: 'Bagaimana cara kerjanya?',
    quickPrompt3: 'Apa manfaat terbesarnya?',
    quickPrompt4: 'Roadmap belajar untuk pemula?',
    curriculumFromAdmin: 'Kurikulum Resmi dari Admin',
    curriculumFromAI: 'Mode Otomatis: Kurikulum dari AI Mentor',

    // Landing Page
    navHome: 'Beranda',
    navFeatures: 'Fitur Spasial',
    navModules: '11 Modul Materi',
    navDemo: 'Akses Demo',
    heroHeadline: 'Eksplorasi Masa Depan Pembelajaran Teknologi di Ruang 3D WebXR',
    heroSubheadline: 'Akademi virtual spasial imersif yang didampingi Karakter 3D AI Mentor khusus untuk setiap disiplin teknologi modern — dari Blockchain, Cloud, DevOps, hingga AI/ML.',
    exploreBtn: 'Mulai Belajar Sekarang (Login)',
    requestDemoBtn: 'Minta Akses Demo',
    demoSectionTitle: 'Permintaan Akses Akun Demo',
    demoSectionDesc: 'Akun siswa didaftarkan secara terpusat oleh Administrator. Jika Anda ingin mencoba akses demo siswa, menguji coba ruang VR, atau bermitra, silakan hubungi:',
    sendEmailBtn: 'Kirim Email Permintaan Demo',
    copyEmailBtn: 'Salin Alamat Email',
    emailCopiedMsg: 'Email berhasil disalin!',
    featuresTitle: 'Keunggulan Pembelajaran Spasial MetaChain',
    modulesTitle: '11 Modul Teknologi Siap Dipelajari',
    modulesSubtitle: 'Setiap modul memiliki 1 Karakter 3D AI Mentor khusus dengan persona, warna neon, dan suara unik.'
  },
  en: {
    // Brand & Common
    brandTagline: 'WebXR Tech Academy & 3D AI Mentors',
    adminPanel: 'Admin Panel',
    adminSubtitle: 'Curriculum & 3D Character Management Hub',
    vrPreviewBtn: 'Preview VR View',
    backToAdmin: '← Back to Admin Dashboard',
    logout: 'Logout',
    save: 'Save',
    saved: 'Saved!',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    active: 'Active',
    inactive: 'Inactive',
    loading: 'Loading...',
    close: 'Close',
    or: 'or',

    // Login
    loginTitle: 'Login to Platform',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginBtn: 'Sign In to Academy',
    quickDemoTitle: 'Quick Demo Credentials (One-Click):',
    adminDemoBtn: 'Admin Demo',
    studentDemoBtn: 'Student Demo (VR)',
    loginNotice: '*Student accounts must be registered by an Administrator via the Dashboard.',
    loginErrorEmpty: 'Please enter both username and password.',

    // Admin Navigation & Tabs
    tabCurriculum: 'Curriculum & AI Characters (11 Modules)',
    tabStudents: 'Student Management (VR Users)',
    tabAI: 'AI Provider Integration',
    topicCountLabel: 'Module',

    // Topic Management
    topicSectionTitle: 'Curriculum & 3D AI Mentors',
    topicSectionSubtitle: 'Each topic has a dedicated 3D Character. If the curriculum is empty, the AI Mentor will generate the syllabus on-the-fly.',
    addTopicBtn: 'Add New Topic',
    editTopicTitle: 'Edit Learning Topic',
    newTopicTitle: 'Add New Learning Topic',
    topicNameLabel: 'Topic Title *',
    orderLabel: 'Learning Order',
    descLabel: 'Brief Description',
    dedicatedCharTitle: 'Dedicated 3D AI Mentor',
    generateCharBtn: 'Generate Character',
    customCharBtn: 'Edit Character',
    guideLabel: 'Learning Guide (Admin Syllabus)',
    guidePlaceholder: 'Write syllabus, key concepts, or learning instructions here...',
    guideUploadLabel: 'Upload syllabus document/PDF (Supabase Storage)',
    uploadFileBtn: 'Choose File',
    uploading: 'Uploading...',
    aiFallbackNotice: 'AI Fallback Logic: If the guide and document are empty, the VR Mentor automatically creates curriculum from AI intelligence.',
    guideAdminInstalled: 'Admin Guide Attached',
    aiFallbackActive: 'Auto AI Fallback Active',
    downloadPdf: 'Download PDF Guide',
    deleteTopicConfirm: 'Delete this topic and its dedicated AI Mentor character?',

    // Character Modal
    charModalTitle: 'Customize 3D AI Mentor Character',
    charNameLabel: 'Character Name',
    avatarTypeLabel: '3D Avatar Model Type',
    visualStyleLabel: 'Choose 3D Visual Style',
    primaryColorLabel: 'Primary Neon Color',
    secondaryColorLabel: 'Secondary / Accent Color',
    personaLabel: 'Persona & Teaching Style',
    personaPlaceholder: 'E.g., Analytical instructor, friendly, loves real-world practical analogies...',
    greetingLabel: 'Initial Voice Greeting',
    pitchLabel: 'Voice Pitch',
    rateLabel: 'Speech Rate',
    testVoiceBtn: 'Preview Character Voice Greeting',
    playingVoice: 'Playing Voice Greeting...',
    saveCharBtn: 'Save Character Settings',

    // Student Management
    studentSectionTitle: 'Student Account Management (VR Users)',
    studentSectionSubtitle: 'All VR learners must be created by an Administrator. Public self-registration is disabled.',
    addStudentBtn: 'Register New Student',
    addStudentModalTitle: 'Register New Student Account',
    addStudentModalDesc: 'This account will immediately have access to enter the VR Learning space.',
    fullNameLabel: 'Full Name',
    tempPasswordLabel: 'Temporary Password',
    roleLabel: 'Account Role',
    roleStudent: 'Student (VR Learning Access)',
    roleAdmin: 'Administrator (CRUD Dashboard Access)',
    createAccountBtn: 'Create Account',
    deleteStudentConfirm: 'Delete this student account? This action cannot be undone.',
    studentTableColName: 'Full Name',
    studentTableColUser: 'Username',
    studentTableColRole: 'Role',
    studentTableColStatus: 'Account Status',
    studentTableColAction: 'Actions',

    // AI Provider Tab & Modal
    aiCenterTitle: 'AI Model & Provider Center (Multi-LLM)',
    aiCenterSubtitle: 'Configure the AI intelligence powering all 3D Mentor avatars for voice and spatial conversation in VR.',
    chooseProviderLabel: 'Select AI Provider',
    step1ApiKey: 'Step 1: Enter API Key',
    step2Model: 'Step 2: Model Selection',
    modelLocked: 'Locked',
    modelUnlocked: 'Unlocked',
    keyRequired: 'Required',
    keyInstalled: 'Key Configured',
    unlockModelHint: 'Enter your API Key in step 1 above to unlock model selection.',
    getApiKeyLink: 'Get your official API Key here:',
    applyAIBtn: 'Save & Apply AI Provider',

    // VR Experience
    enterVRBtn: 'Enter WebXR VR',
    inVRStatus: 'In VR Session',
    orbitHint: 'Drag mouse to rotate 360° spatial view',
    curriculumTab: 'Curriculum Guide',
    chatTab: 'Voice Q&A Session',
    speakingBtn: 'Speaking...',
    mentorSpeakingStatus: 'Mentor is speaking...',
    listeningStatus: 'Listening to your voice...',
    zeroRetentionNotice: 'Privacy Guaranteed: Conversation is RAM-only and never saved to any database.',
    askPlaceholder: 'Ask a question about this topic...',
    disclaimerText: 'Notice: AI can make mistakes. Consider checking important information.',
    noChatPrompt: 'Start your conversation by pressing the mic button below or click a quick prompt.',
    quickPrompt1: 'What is this topic?',
    quickPrompt2: 'How does it work?',
    quickPrompt3: 'What are the main benefits?',
    quickPrompt4: 'Learning roadmap for beginners?',
    curriculumFromAdmin: 'Official Curriculum from Admin',
    curriculumFromAI: 'Auto Mode: AI Generated Curriculum',

    // Landing Page
    navHome: 'Home',
    navFeatures: 'Spatial Features',
    navModules: '11 Modules',
    navDemo: 'Demo Access',
    heroHeadline: 'Explore the Future of Tech Education in 3D WebXR',
    heroSubheadline: 'An immersive spatial academy accompanied by dedicated 3D AI Mentors for each modern technology field — from Blockchain, Cloud, and DevOps to AI & Spatial Computing.',
    exploreBtn: 'Start Learning Now (Sign In)',
    requestDemoBtn: 'Request Demo Access',
    demoSectionTitle: 'Request Demo Account Access',
    demoSectionDesc: 'Student accounts are registered by the Administrator. If you would like to test the student VR experience or collaborate, please contact us via:',
    sendEmailBtn: 'Send Demo Request Email',
    copyEmailBtn: 'Copy Email Address',
    emailCopiedMsg: 'Email copied to clipboard!',
    featuresTitle: 'Why Choose MetaChain Spatial Learning',
    modulesTitle: '11 Ready-to-Learn Tech Modules',
    modulesSubtitle: 'Every module is powered by 1 dedicated 3D AI Mentor with custom persona, neon visual style, and voice identity.'
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  t: translations.id
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('metachain_lang');
      if (saved === 'en' || saved === 'id') return saved;
    } catch {}
    return 'id'; // Default to Indonesian
  });

  const setLang = (newLang: Language) => {
    // Strict requirement: Only 'id' or 'en' allowed!
    if (newLang !== 'id' && newLang !== 'en') return;
    setLangState(newLang);
    localStorage.setItem('metachain_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
