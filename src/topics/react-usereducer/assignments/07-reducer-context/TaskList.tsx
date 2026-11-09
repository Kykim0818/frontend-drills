import { useState } from 'react';
import type { Task as TaskType } from './tasksReducer';

// TODO(4단계): props 대신 useTasks() 사용
export default function TaskList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: {
  tasks: TaskType[];
  onChangeTask: (task: TaskType) => void;
  onDeleteTask: (id: number) => void;
}) {
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

// TODO(4단계): onChange/onDelete 대신 useTasksDispatch() 사용 (task prop은 남겨도 됩니다)
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
  return (
    <label>
      <input
        type="checkbox"
        aria-label={`${task.text} 완료`}
        checked={task.done}
        onChange={(e) => onChange({ ...task, done: e.target.checked })}
      />
      {isEditing ? (
        <>
          <input value={task.text} onChange={(e) => onChange({ ...task, text: e.target.value })} />
          <button onClick={() => setIsEditing(false)}>저장</button>
        </>
      ) : (
        <>
          <span>{task.text}</span>
          <button onClick={() => setIsEditing(true)}>수정</button>
        </>
      )}
      <button onClick={() => onDelete(task.id)}>삭제</button>
    </label>
  );
}
