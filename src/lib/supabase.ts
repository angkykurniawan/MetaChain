import { createClient } from '@supabase/supabase-js';
import { Profile, Topic } from '../types/index';
import { DEFAULT_TOPICS, INITIAL_PROFILES } from './defaultTopics';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Normalize URL (strip trailing /rest/v1 if user accidentally copied API endpoint)
const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const isLiveSupabase = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isLiveSupabase 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

// ==========================================
// AUTHENTICATED SESSION PERSISTENCE
// ==========================================
const SESSION_STORAGE_KEY = 'metachain_authenticated_user_session_v1';

export function getStoredSession(): Profile | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.id && user.username && user.role) {
        return user as Profile;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored session:', err);
  }
  return null;
}

export function saveSession(user: Profile): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

// ==========================================
// LOCAL STORAGE ADAPTER (Instant Offline / Demo Mode)
// ==========================================
const STORAGE_KEYS = {
  PROFILES: 'metachain_profiles_ts_v1',
  TOPICS: 'metachain_topics_ts_v1'
};

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// Secure Client-Side Hash Helper (Used for Local Offline Mode)
async function hashPasswordLocal(plain: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '$sha256$' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return plain;
  }
}

// Pre-seed local storage if empty
getLocalData(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
getLocalData(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);

// ==========================================
// UNIFIED DATA SERVICES (Works with Supabase & Local)
// ==========================================

export const dbService = {
  // --- AUTH & LOGIN ---
  async login(username: string, password: string): Promise<Profile> {
    const cleanUser = username.trim().toLowerCase();
    
    if (isLiveSupabase && supabase) {
      // 1. Try secure Bcrypt RPC verification in Supabase PostgreSQL
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('verify_user_password', {
          p_username: cleanUser,
          p_password: password
        });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData[0] as Profile;
      }

      // 2. Fallback direct query (if RPC function not yet created)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUser)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Username atau password salah, atau akun belum diaktifkan Admin.');
      }
      return data as Profile;
    } else {
      // Local Storage Mode
      const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      const hashedInput = await hashPasswordLocal(password);

      const user = profiles.find(
        p => p.username.toLowerCase() === cleanUser && 
             (p.password_hash === hashedInput || p.password === password || p.password_hash === password) && 
             p.is_active !== false
      );
      if (!user) {
        throw new Error('Username atau password salah, atau akun belum didaftarkan Admin.');
      }
      return user;
    }
  },

  // --- PROFILES (USER MANAGEMENT) ---
  async getProfiles(): Promise<Profile[]> {
    if (isLiveSupabase && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, is_active, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Profile[];
    }
    return getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    const cleanUsername = (profileData.username || '').trim().toLowerCase();
    const rawPassword = profileData.password || profileData.password_hash || 'user123';

    if (isLiveSupabase && supabase) {
      // In Supabase, the BEFORE INSERT trigger (trg_hash_profile_password)
      // automatically encrypts password_hash using crypt(..., gen_salt('bf', 10))!
      const supabasePayload = {
        username: cleanUsername,
        full_name: profileData.full_name || 'Siswa Baru',
        password_hash: rawPassword,
        role: profileData.role || 'user',
        is_active: profileData.is_active ?? true
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([supabasePayload])
        .select('id, username, full_name, role, is_active, created_at')
        .single();

      if (error) throw error;
      return data as Profile;
    } else {
      // Encrypt password for Local Storage too
      const localHash = await hashPasswordLocal(rawPassword);
      const newProfile: Profile = {
        id: profileData.id || `prof-${Date.now()}`,
        username: cleanUsername,
        full_name: profileData.full_name || 'Siswa Baru',
        password_hash: localHash,
        role: profileData.role || 'user',
        is_active: profileData.is_active ?? true,
        created_at: new Date().toISOString()
      };

      const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      if (profiles.some(p => p.username.toLowerCase() === cleanUsername)) {
        throw new Error('Username sudah terdaftar! Harap gunakan username lain.');
      }
      const updated = [newProfile, ...profiles];
      setLocalData(STORAGE_KEYS.PROFILES, updated);
      return newProfile;
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    if (isLiveSupabase && supabase) {
      const payload: any = { ...updates };
      if (payload.password) {
        payload.password_hash = payload.password;
        delete payload.password;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select('id, username, full_name, role, is_active, created_at')
        .single();
      if (error) throw error;
      return data as Profile;
    } else {
      const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      let newHash: string | undefined = undefined;
      if (updates.password || (updates.password_hash && !updates.password_hash.startsWith('$'))) {
        newHash = await hashPasswordLocal(updates.password || updates.password_hash!);
      }

      const updated = profiles.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            ...(newHash ? { password_hash: newHash } : {})
          };
        }
        return p;
      });
      setLocalData(STORAGE_KEYS.PROFILES, updated);
      const found = updated.find(p => p.id === id);
      if (!found) throw new Error('User not found');
      return found;
    }
  },

  async deleteProfile(id: string): Promise<boolean> {
    if (isLiveSupabase && supabase) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      const updated = profiles.filter(p => p.id !== id);
      setLocalData(STORAGE_KEYS.PROFILES, updated);
      return true;
    }
  },

  // --- TOPICS & DEDICATED CHARACTERS ---
  async getTopics(): Promise<Topic[]> {
    if (isLiveSupabase && supabase) {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as Topic[];
    }
    return getLocalData<Topic[]>(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
  },

  async createTopic(topicData: Partial<Topic>): Promise<Topic> {
    const slug = topicData.slug || (topicData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTopic: Topic = {
      id: topicData.id || `topic-${Date.now()}`,
      title: topicData.title || 'Materi Baru',
      slug: slug,
      description: topicData.description || '',
      order_index: topicData.order_index ?? 99,
      character_name: topicData.character_name || 'AI Mentor',
      character_persona: topicData.character_persona || '',
      character_avatar_type: topicData.character_avatar_type || 'cyber_humanoid',
      character_primary_color: topicData.character_primary_color || '#06b6d4',
      character_secondary_color: topicData.character_secondary_color || '#3b82f6',
      character_greeting: topicData.character_greeting || '',
      character_voice_pitch: topicData.character_voice_pitch ?? 1.0,
      character_voice_rate: topicData.character_voice_rate ?? 1.0,
      guide_content: topicData.guide_content ?? null,
      guide_file_url: topicData.guide_file_url ?? null,
      guide_file_name: topicData.guide_file_name ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase && supabase) {
      const { data, error } = await supabase
        .from('topics')
        .insert([newTopic])
        .select()
        .single();
      if (error) throw error;
      return data as Topic;
    } else {
      const topics = getLocalData<Topic[]>(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const updated = [...topics, newTopic];
      setLocalData(STORAGE_KEYS.TOPICS, updated);
      return newTopic;
    }
  },

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const timestamp = new Date().toISOString();
    const payload = { ...updates, updated_at: timestamp };

    if (isLiveSupabase && supabase) {
      const { data, error } = await supabase
        .from('topics')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Topic;
    } else {
      const topics = getLocalData<Topic[]>(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const updated = topics.map(t => (t.id === id ? { ...t, ...payload } : t));
      setLocalData(STORAGE_KEYS.TOPICS, updated);
      const found = updated.find(t => t.id === id);
      if (!found) throw new Error('Topic not found');
      return found;
    }
  },

  async deleteTopic(id: string): Promise<boolean> {
    if (isLiveSupabase && supabase) {
      const { error } = await supabase.from('topics').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const topics = getLocalData<Topic[]>(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const updated = topics.filter(t => t.id !== id);
      setLocalData(STORAGE_KEYS.TOPICS, updated);
      return true;
    }
  },

  // --- STORAGE UPLOAD FOR LEARNING GUIDES ---
  async uploadGuideFile(file: File): Promise<{ url: string; name: string }> {
    if (isLiveSupabase && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `guides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('learning-materials')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        name: file.name
      };
    } else {
      // Local simulated file storage via Blob URL
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        name: file.name
      };
    }
  }
};

