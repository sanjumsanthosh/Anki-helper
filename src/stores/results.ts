import { createStore } from 'zustand/vanilla'

export type CounterState = {
  status: string,
  decks: string[]
}

export type CounterActions = {
  setStatus: (status: string) => void
  setDecks: (decks: string[]) => void
}

export type CounterStore = CounterState & CounterActions

export const initCounterStore = (): CounterState => {
  return {  status: 'idle', decks: []}
}

export const defaultInitState: CounterState = {
  status: 'idle',
  decks: []
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    setStatus: (status: string) => set(() => ({ status })),
    setDecks: (decks: string[]) => set(() => ({ decks }))
  }))
}