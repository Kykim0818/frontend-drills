import { useReducer } from 'react';
import { counterReducer, initialCounterState } from './reducer';

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialCounterState);

  return (
    <div className="card">
      <p>
        count: <strong data-testid="count">{state.count}</strong>
      </p>
      <label>
        증가 단위{' '}
        <input
          type="number"
          aria-label="증가 단위"
          value={state.step}
          onChange={(e) => dispatch({ type: 'step_changed', step: Number(e.target.value) })}
        />
      </label>
      <div className="row">
        <button onClick={() => dispatch({ type: 'decremented' })}>-</button>
        <button onClick={() => dispatch({ type: 'incremented' })}>+</button>
        <button onClick={() => dispatch({ type: 'reset' })}>초기화</button>
      </div>
    </div>
  );
}
