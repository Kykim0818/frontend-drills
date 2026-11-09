import { useReducer } from 'react';
import AddTask from './AddTask';
import TaskList from './TaskList';
import { initialTasks, tasksReducer } from './tasksReducer';
import type { Task } from './types';

// id 생성(가변 값 증가)은 "부수 효과"이므로 순수해야 하는 리듀서가 아니라 이벤트 핸들러에서 합니다.
let nextId = 3;

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  function handleAddTask(text: string) {
    dispatch({ type: 'added', id: nextId++, text });
  }

  function handleChangeTask(task: Task) {
    dispatch({ type: 'changed', task });
  }

  function handleDeleteTask(taskId: number) {
    dispatch({ type: 'deleted', id: taskId });
  }

  return (
    <div className="card">
      <h3>교토 여행 일정</h3>
      <AddTask onAddTask={handleAddTask} />
      <TaskList tasks={tasks} onChangeTask={handleChangeTask} onDeleteTask={handleDeleteTask} />
    </div>
  );
}
