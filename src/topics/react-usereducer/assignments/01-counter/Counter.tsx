import { useState } from 'react';

// TODO: useState 두 개를 useReducer 하나로 바꾸세요.
//  - import { useReducer } from 'react';
//  - import { counterReducer, initialCounterState } from './reducer';
//  - 이벤트 핸들러에서는 "무슨 일이 일어났는지"만 dispatch 하세요.
export default function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  function handleIncrement() {
    setCount(count + step);
  }

  function handleDecrement() {
    setCount(count - step); // 🐛 0 미만이 될 수 있음
  }

  function handleReset() {
    setCount(0);
  }

  function handleStepChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStep(Number(e.target.value)); // 🐛 0이나 음수도 들어감
  }

  return (
    <div className="card">
      <p>
        count: <strong data-testid="count">{count}</strong>
      </p>
      <label>
        증가 단위{' '}
        <input type="number" aria-label="증가 단위" value={step} onChange={handleStepChange} />
      </label>
      <div className="row">
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>초기화</button>
      </div>
    </div>
  );
}
