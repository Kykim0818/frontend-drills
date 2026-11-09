import AddTask from './AddTask';
import TaskList from './TaskList';
import { TasksProvider } from './TasksContext';

export default function TaskApp() {
  return (
    <div className="card">
      <TasksProvider>
        <h3>교토 여행 일정 (Context)</h3>
        <AddTask />
        <TaskList />
      </TasksProvider>
    </div>
  );
}
