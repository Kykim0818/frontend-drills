import { useReducer } from 'react';
import AddTask from './AddTask';
import TaskList from './TaskList';
import { initialTasks, tasksReducer } from './tasksReducer';

// TODO(2,4단계): useReducer는 TasksProvider로 옮기고, 여기서는 Provider로 감싸기만 하세요.
export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  return (
    <div className="card">
      <h3>교토 여행 일정 (Context)</h3>
      <AddTask onAddTask={(id, text) => dispatch({ type: 'added', id, text })} />
      <TaskList
        tasks={tasks}
        onChangeTask={(task) => dispatch({ type: 'changed', task })}
        onDeleteTask={(id) => dispatch({ type: 'deleted', id })}
      />
    </div>
  );
}
