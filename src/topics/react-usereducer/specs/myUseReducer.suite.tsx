import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type UseMyReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: any,
  init?: (arg: any) => S,
) => [S, (action: A) => void];

type Action = { type: 'incremented' } | { type: 'added'; n: number };
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'incremented':
      return state + 1;
    case 'added':
      return state + action.n;
  }
}

export function runMyUseReducerSuite(useMyReducer: UseMyReducer) {
  describe('과제 6 - useMyReducer', () => {
    it('초기 state를 반환', () => {
      const { result } = renderHook(() => useMyReducer(reducer, 10));
      expect(result.current[0]).toBe(10);
    });

    it('dispatch 한 번', () => {
      const { result } = renderHook(() => useMyReducer(reducer, 0));
      act(() => result.current[1]({ type: 'incremented' }));
      expect(result.current[0]).toBe(1);
    });

    it('(1) 한 이벤트에서 여러 번 dispatch → 순서대로 모두 반영', () => {
      const { result } = renderHook(() => useMyReducer(reducer, 0));
      act(() => {
        const dispatch = result.current[1];
        dispatch({ type: 'incremented' });
        dispatch({ type: 'added', n: 10 });
        dispatch({ type: 'incremented' });
      });
      expect(result.current[0]).toBe(12);
    });

    it('(2) dispatch 참조가 렌더링 사이에 안정적', () => {
      const { result, rerender } = renderHook(() => useMyReducer(reducer, 0));
      const first = result.current[1];
      act(() => first({ type: 'incremented' }));
      rerender();
      expect(result.current[1]).toBe(first);
    });

    it('(3) init(initialArg)로 초기화하고, 첫 렌더링에만 호출', () => {
      const init = vi.fn((n: number) => n * 100);
      const { result, rerender } = renderHook(() => useMyReducer(reducer, 2, init));
      expect(result.current[0]).toBe(200);
      act(() => result.current[1]({ type: 'incremented' }));
      rerender();
      expect(result.current[0]).toBe(201);
      expect(init).toHaveBeenCalledTimes(1);
    });
  });
}
