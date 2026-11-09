import { useReducer, useState } from 'react';
import { createInitialState, todosReducer, type TodosState } from './todosReducer';

type Props = {
  username: string;
  /** 테스트에서 호출 횟수를 세기 위해 주입 가능 */
  init?: (username: string) => TodosState;
};

export function TodoList({ username, init = createInitialState }: Props) {
  // TODO: init 이 첫 렌더링에서만 호출되도록 바꾸세요.
  const [state, dispatch] = useReducer(todosReducer, init(username));

  return (
    <div>
      <div className="row">
        <input
          aria-label="새 할 일"
          value={state.draft}
          onChange={(e) => dispatch({ type: 'changed_draft', nextText: e.target.value })}
        />
        <button onClick={() => dispatch({ type: 'added_todo' })}>추가</button>
        <button onClick={() => dispatch({ type: 'reset', username })}>리셋</button>
      </div>
      <ul className="scroll" data-testid="todos">
        {state.todos.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TodoApp() {
  // useState 하나 정도는 괜찮습니다. 모든 state를 리듀서로 만들 필요는 없어요!
  const [username, setUsername] = useState('Taylor');
  return (
    <div className="card">
      <label>
        사용자{' '}
        <select aria-label="사용자" value={username} onChange={(e) => setUsername(e.target.value)}>
          <option>Taylor</option>
          <option>Alice</option>
        </select>
      </label>
      {/* TODO: 사용자가 바뀌면 TodoList의 state가 새로 초기화되게 하세요 */}
      <TodoList username={username} />
    </div>
  );
}
