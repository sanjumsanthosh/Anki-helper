import { create } from 'zustand';
import { CompanionConnector } from '@/lib/companionConnector';

export type CompanionStoreState = {
    healthy: boolean,
    connector: CompanionConnector,
    selectedFile: string
}

export type CompanionStoreActions = {
    setHealthy: (healthy: boolean) => void
    setSelectedFile: (selectedFile: string) => void
}

export type CompanionStore = CompanionStoreState & CompanionStoreActions;


export const useCompanionStore = create<CompanionStore>((set) => ({
    // Store state
    healthy: false,
    connector: new CompanionConnector(),
    selectedFile: "None",

    // Store actions
    setHealthy: (healthy: boolean) => set(() => ({ healthy })),
    setSelectedFile: (selectedFile: string) => set(() => ({ selectedFile }))
}));