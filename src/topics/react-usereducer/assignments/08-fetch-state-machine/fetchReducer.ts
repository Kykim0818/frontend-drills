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
  // TODO: README의 상태 전이표대로 구현하세요.
  // 💡 action.type 으로 switch 하면, 각 case 안에서 TS가 action.data / action.error 를 알아서 좁혀줍니다.
  void action;
  return state;
}
