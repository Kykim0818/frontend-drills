export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export type FetchAction<T> =
  | { type: 'fetch_started' }
  | { type: 'fetch_succeeded'; data: T }
  | { type: 'fetch_failed'; error: string }
  | { type: 'reset' };

export function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case 'fetch_started': {
      if (state.status === 'loading') return state;
      return { status: 'loading' };
    }
    case 'fetch_succeeded': {
      if (state.status !== 'loading') return state;
      return { status: 'success', data: action.data };
    }
    case 'fetch_failed': {
      if (state.status !== 'loading') return state;
      return { status: 'error', error: action.error };
    }
    case 'reset': {
      return { status: 'idle' };
    }
    default: {
      const unknown: never = action;
      throw Error('Unknown action: ' + (unknown as { type: string }).type);
    }
  }
}
