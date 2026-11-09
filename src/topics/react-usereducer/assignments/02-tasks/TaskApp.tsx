import { useState } from 'react';
import AddTask from './AddTask';
import TaskList from './TaskList';
import { initialTasks } from './tasksReducer';
import type { Task } from './types';

let nextId = 3;

// TODO: useState → useReducer(tasksReducer, initialTasks) 로 바꾸세요.
export default function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function handleAddTask(text: string) {
    setTasks([...tasks, { id: nextId++, text, done: false }]);
  }

  function handleChangeTask(task: Task) {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  }

  function handleDeleteTask(taskId: number) {
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  return (
    <div className="card">
      <h3>교토 여행 일정</h3>
      <AddTask onAddTask={handleAddTask} />
      <TaskList tasks={tasks} onChangeTask={handleChangeTask} onDeleteTask={handleDeleteTask} />
    </div>
  );
}
