import type { Dispatch, ReactNode } from 'react';
import type { Task, TasksAction } from './tasksReducer';

// TODO(1단계): createContext 두 개
// export const TasksContext = createContext<Task[] | null>(null);
// export const TasksDispatchContext = createContext<Dispatch<TasksAction> | null>(null);

// TODO(2단계)
export function TasksProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// TODO(3단계)
export function useTasks(): Task[] {
  throw new Error('TODO: useTasks 를 구현하세요');
}

// TODO(3단계)
export function useTasksDispatch(): Dispatch<TasksAction> {
  throw new Error('TODO: useTasksDispatch 를 구현하세요');
}
