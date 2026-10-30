// Core TypeScript Definitions for MetaChain WebXR Platform

export type UserRole = 'admin' | 'user';

export type AvatarModelType = 
  | 'cyber_humanoid' 
  | 'floating_orb' 
  | 'mech_guard' 
  | 'holo_sage';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  password?: string;
  password_hash?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export interface CharacterConfig {
  character_name: string;
  character_persona: string;
  character_avatar_type: AvatarModelType;
  character_primary_color: string;
  character_secondary_color: string;
  character_greeting: string;
  character_voice_pitch: number;
  character_voice_rate: number;
}

export interface Topic extends CharacterConfig {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  guide_content?: string | null;
  guide_file_url?: string | null;
  guide_file_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EphemeralChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: number;
  isAudioPlaying?: boolean;
  engine?: 'ai' | 'rule_based';
  aiModel?: string;
}

export interface AuthSession {
  user: Profile | null;
}

