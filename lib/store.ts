import { create } from 'zustand';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  isAiVisible: boolean;
  toggleAiVisibility: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => 
    set((state) => ({ 
      profile: state.profile ? { ...state.profile, ...updates } : null 
    })),
  clearProfile: () => set({ profile: null }),
  isAiVisible: true,
  toggleAiVisibility: () => set((state) => ({ isAiVisible: !state.isAiVisible })),
}));
