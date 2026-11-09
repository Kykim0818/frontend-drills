export type CounterState = {
  count: number;
  step: number;
};

export type CounterAction =
  | { type: 'incremented' }
  | { type: 'decremented' }
  | { type: 'reset' }
  | { type: 'step_changed'; step: number };

export const initialCounterState: CounterState = { count: 0, step: 1 };

export function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'incremented': {
      return { ...state, count: state.count + state.step };
    }
    case 'decremented': {
      return { ...state, count: Math.max(0, state.count - state.step) };
    }
    case 'reset': {
      return { ...state, count: 0 };
    }
    case 'step_changed': {
      if (!Number.isInteger(action.step) || action.step < 1) {
        // 바뀐 게 없으면 "같은 참조"를 반환 → React가 리렌더링을 건너뛸 수 있음
        return state;
      }
      return { ...state, step: action.step };
    }
    default: {
      // TS의 exhaustiveness 체크: 새로운 action 타입을 추가하고 case를 빼먹으면 컴파일 에러
      const unknown: never = action;
      throw Error('Unknown action: ' + (unknown as { type: string }).type);
    }
  }
}
