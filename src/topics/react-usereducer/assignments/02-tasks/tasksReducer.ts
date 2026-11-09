import type { Task } from './types';

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
  // TODO: 구현하세요
  void action;
  return tasks;
}
