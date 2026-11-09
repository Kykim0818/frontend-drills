export type Task = { id: number; text: string; done: boolean };

export type TasksAction =
  | { type: 'added'; id: number; text: string }
  | { type: 'changed'; task: Task }
  | { type: 'deleted'; id: number };

export const initialTasks: Task[] = [
  { id: 0, text: '철학자의 길 걷기', done: true },
  { id: 1, text: '사원 방문하기', done: false },
  { id: 2, text: '말차 마시기', done: false },
];

export function tasksReducer(tasks: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case 'added': {
      return [...tasks, { id: action.id, text: action.text, done: false }];
    }
    case 'changed': {
      return tasks.map((t) => (t.id === action.task.id ? action.task : t));
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}
