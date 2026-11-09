import { useState } from 'react';
import type { Task as TaskType } from './types';

type Props = {
  tasks: TaskType[];
  onChangeTask: (task: TaskType) => void;
  onDeleteTask: (id: number) => void;
};

export default function TaskList({ tasks, onChangeTask, onDeleteTask }: Props) {
  return (
    <ul className="tasks">
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} onChange={onChangeTask} onDelete={onDeleteTask} />
        </li>
      ))}
    </ul>
  );
}

function Task({
  task,
  onChange,
  onDelete,
}: {
  task: TaskType;
  onChange: (task: TaskType) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          aria-label={`${task.text} 수정`}
          value={task.text}
          onChange={(e) => onChange({ ...task, text: e.target.value })}
        />
        <button onClick={() => setIsEditing(false)}>저장</button>
      </>
    );
  } else {
    taskContent = (
      <>
        <span>{task.text}</span>
        <button onClick={() => setIsEditing(true)}>수정</button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        aria-label={`${task.text} 완료`}
        checked={task.done}
        onChange={(e) => onChange({ ...task, done: e.target.checked })}
      />
      {taskContent}
      <button onClick={() => onDelete(task.id)}>삭제</button>
    </label>
  );
}
