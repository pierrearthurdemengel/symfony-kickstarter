import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store global Zustand pour l'etat non-serveur de l'application.
 * Persiste dans le localStorage les preferences utilisateur.
 */
interface AppState {
  // Sidebar admin
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Preferences d'affichage
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;

  // Etat de connectivite
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // File d'attente des actions offline
  offlineQueue: OfflineAction[];
  addToOfflineQueue: (action: OfflineAction) => void;
  clearOfflineQueue: () => void;
}

export interface OfflineAction {
  id: string;
  method: string;
  path: string;
  body?: unknown;
  timestamp: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Preferences
      itemsPerPage: 10,
      setItemsPerPage: (count) => set({ itemsPerPage: count }),

      // Connectivite
      isOnline: navigator.onLine,
      setIsOnline: (online) => set({ isOnline: online }),

      // File d'attente offline
      offlineQueue: [],
      addToOfflineQueue: (action) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, action] })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
    }),
    {
      name: 'kickstarter-app-state',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        itemsPerPage: state.itemsPerPage,
      }),
    },
  ),
);
