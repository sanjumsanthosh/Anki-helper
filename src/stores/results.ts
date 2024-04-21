import { createStore } from 'zustand/vanilla'

export type CounterState = {
  status: string,
  decks: string[],
  deck: string,
  health: boolean,
}

export type CounterActions = {
  setStatus: (status: string) => void
  setDecks: (decks: string[]) => void
  selectDeck: (deck: string) => void
  setHealthy: (health: boolean) => void
}

export type CounterStore = CounterState & CounterActions

export const initCounterStore = (): CounterState => {
  return {  status: JSON.stringify({status: 'Waiting for user input... ⁉️',}), decks: [], deck: '', health: false}
}

export const defaultInitState: CounterState = {
  status: JSON.stringify({status: 'Waiting for user input... ⁉️',}),
  decks: [],
  deck: '',
  health: false
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    setStatus: (status: string) => set(() => ({ status })),
    setDecks: (decks: string[]) => set(() => ({ decks })),
    selectDeck: (deck: string) => set(() => ({ deck })),
    setHealthy: (health: boolean) => set(() => ({ health })),
  }))
}