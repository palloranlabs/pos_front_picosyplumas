import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
    isSessionOpen: boolean;
    setSessionOpen: (isOpen: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            isSessionOpen: false,
            setSessionOpen: (isOpen) => set({ isSessionOpen: isOpen }),
        }),
        {
            name: 'session-storage',
        }
    )
);
