import { AdditionalNodeLvlInfoType, ConfigurationMap, MermaidDiag } from '@/app/mermaidview/mermaidDiag';
import { z } from 'zod';
import { create } from 'zustand';

export type MermaidStoreState = {
    keyTracking: boolean,
    mermaidDiagram: MermaidDiag,
    currentNode: string,
    dotFile: string,
    jsonFile: z.infer<typeof AdditionalNodeLvlInfoType>
}

export type MermaidStoreActions = {
    setKeyTracking: (keyTracking: boolean) => void
    setMermaidDiagram: (mermaidDiagram: MermaidDiag) => void
    setCurrentNode: (currentNode: string) => void
    setDotFile: (dotFile: string) => void
    setJsonFile: (jsonFile: z.infer<typeof AdditionalNodeLvlInfoType>) => void
}


export type MermaidStore = MermaidStoreState & MermaidStoreActions;

export const useMermaidStore = create<MermaidStore>((set) => ({
    keyTracking: true,
    mermaidDiagram: new MermaidDiag(),
    currentNode: '',
    dotFile: '',
    jsonFile: {},
    setKeyTracking: (keyTracking: boolean) => set(() => ({ keyTracking })),
    setMermaidDiagram: (mermaidDiagram: MermaidDiag) => set(() => ({ mermaidDiagram })),
    setCurrentNode: (currentNode: string) => set(() => ({ currentNode })),
    setDotFile: (dotFile: string) => set(() => ({ dotFile })),
    setJsonFile: (jsonFile: Record<any, any>) => set(() => ({ jsonFile }))
}));
