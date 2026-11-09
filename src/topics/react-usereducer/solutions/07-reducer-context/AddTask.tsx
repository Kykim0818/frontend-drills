import { useState } from 'react';
import { useTasksDispatch } from './TasksContext';

let nextId = 3;

export default function AddTask() {
  const [text, setText] = useState('');
  const dispatch = useTasksDispatch();
  return (
    <div className="row">
      <input placeholder="할 일 추가" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          setText('');
          dispatch({ type: 'added', id: nextId++, text });
        }}
      >
        추가
      </button>
    </div>
  );
}
