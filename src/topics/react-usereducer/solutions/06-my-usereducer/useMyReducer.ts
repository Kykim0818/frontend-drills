import { useCallback, useState } from 'react';

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
  // (3) lazy initializer: 첫 렌더링에서만 실행됨
  const [state, setState] = useState<S>(() => (init ? init(initialArg as I) : (initialArg as S)));

  // (1) 업데이터 함수를 큐에 넣으면 React가 "직전 결과"를 prev로 넘겨줌 → 여러 번 dispatch 해도 누적
  // (2) setState 는 원래 안정적인 참조. useCallback 으로 dispatch 도 안정적으로.
  //     (단순화를 위해 reducer 도 의존성에 둡니다. 보통 리듀서는 컴포넌트 밖에 선언하므로 바뀌지 않아요)
  const dispatch = useCallback(
    (action: A) => {
      setState((prev) => reducer(prev, action));
    },
    [reducer],
  );

  return [state, dispatch];
}
