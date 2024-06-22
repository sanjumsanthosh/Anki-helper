import { create } from 'zustand';

// const columnSearchParam = tryParseOrDefault(searchParam.get('columnFilters'), '[{"id": "read","value": []}]');
// const columnVisibilitySearchParam = tryParseOrDefault(searchParam.get('columnVisibility'), '{"date":false,"tags":false, "url":false}');
// const sortingSearchParam = tryParseOrDefault(searchParam.get('sorting'), '[]');
// const rowSelectionSearchParam = tryParseOrDefault(searchParam.get('rowSelection'), '{}');
export type TableState = {
    columnSearchParam: string,
    columnVisibilitySearchParam: string,
    sortingSearchParam: string,
    rowSelectionSearchParam: string,
    focusedId: string | null
}

export type TableActions = {
    setColumnSearchParam: (columnSearchParam: string) => void,
    setColumnVisibilitySearchParam: (columnVisibilitySearchParam: string) => void,
    setSortingSearchParam: (sortingSearchParam: string) => void,
    setRowSelectionSearchParam: (rowSelectionSearchParam: string) => void,
    setFocusedId: (focusedId: string | null) => void
}

export type TableStore = TableState & TableActions;

export const useTableStore = create<TableStore>((set) => ({
    columnSearchParam: '[{"id": "read","value": []}]',
    columnVisibilitySearchParam: '{"date":false,"tags":false, "url":false}',
    sortingSearchParam: '[]',
    rowSelectionSearchParam: '{}',
    focusedId: null,
    setColumnSearchParam: (columnSearchParam: string) => set(() => ({ columnSearchParam })),
    setColumnVisibilitySearchParam: (columnVisibilitySearchParam: string) => set(() => ({ columnVisibilitySearchParam })),
    setSortingSearchParam: (sortingSearchParam: string) => set(() => ({ sortingSearchParam })),
    setRowSelectionSearchParam: (rowSelectionSearchParam: string) => set(() => ({ rowSelectionSearchParam })),
    setFocusedId: (focusedId: string | null) => set(() => ({ focusedId }))
}));