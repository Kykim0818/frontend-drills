import { useState } from 'react';

let nextId = 3;

// TODO(4단계): props 대신 useTasksDispatch() 사용
export default function AddTask({ onAddTask }: { onAddTask: (id: number, text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="row">
      <input placeholder="할 일 추가" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          setText('');
          onAddTask(nextId++, text);
        }}
      >
        추가
      </button>
    </div>
  );
}
