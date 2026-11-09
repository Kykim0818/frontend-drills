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
  // TODO: switch (action.type) { ... } 로 구현하세요.
  // 힌트: 각 case를 { } 블록으로 감싸면 case마다 const 변수를 안전하게 선언할 수 있어요.
  void action;
  return state;
}
