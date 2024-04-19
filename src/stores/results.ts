import { createStore } from 'zustand/vanilla'

export type CounterState = {
  count: number,
  status: string
}

export type CounterActions = {
  decrementCount: () => void
  incrementCount: () => void
  setStatus: (status: string) => void
}

export type CounterStore = CounterState & CounterActions

export const initCounterStore = (): CounterState => {
  return { count: new Date().getFullYear(), status: 'idle'}
}

export const defaultInitState: CounterState = {
  count: 0,
  status: 'idle'
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
    setStatus: (status: string) => set(() => ({ status })),
  }))
}