import { useState } from 'react';

export function useMyReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
): [S, (action: A) => void];
export function useMyReducer<S, A, I>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init: (arg: I) => S,
): [S, (action: A) => void];
export function useMyReducer<S, A, I>(
  reducer: (state: S, action: A) => S,
  initialArg: I | S,
  init?: (arg: I) => S,
): [S, (action: A) => void] {
  // TODO(3): init 지원
  void init;
  const [state, setState] = useState<S>(initialArg as S);

  // TODO(1): 여러 번 dispatch 해도 모두 반영되게
  // TODO(2): dispatch 참조가 렌더링마다 바뀌지 않게
  function dispatch(action: A) {
    const nextState = reducer(state, action);
    setState(nextState);
  }

  return [state, dispatch];
}
