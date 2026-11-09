import { useState } from 'react';
import { useTasks, useTasksDispatch } from './TasksContext';
import type { Task as TaskType } from './tasksReducer';

export default function TaskList() {
  const tasks = useTasks();
  return (
    <ul className="tasks">
      {tasks.map((task) => (
        <li key={task.id}>
          <Task task={task} />
        </li>
      ))}
    </ul>
  );
}

function Task({ task }: { task: TaskType }) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useTasksDispatch();
  const onChange = (next: TaskType) => dispatch({ type: 'changed', task: next });
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
      <button onClick={() => dispatch({ type: 'deleted', id: task.id })}>삭제</button>
    </label>
  );
}
