import { useState } from 'react';

export default function AddTask({ onAddTask }: { onAddTask: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="row">
      <input placeholder="할 일 추가" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          setText('');
          onAddTask(text);
        }}
      >
        추가
      </button>
    </div>
  );
}
