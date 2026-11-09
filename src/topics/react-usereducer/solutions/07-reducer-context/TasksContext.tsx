import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { initialTasks, tasksReducer, type Task, type TasksAction } from './tasksReducer';

// 1단계: 데이터와 dispatch를 별도 컨텍스트로 분리
//  - dispatch는 리렌더링 사이에 바뀌지 않으므로, dispatch만 구독하는 컴포넌트는 tasks가 바뀌어도
//    컨텍스트 때문에 리렌더링되지 않습니다.
export const TasksContext = createContext<Task[] | null>(null);
export const TasksDispatchContext = createContext<Dispatch<TasksAction> | null>(null);

// 2단계: 리듀서와 컨텍스트 제공을 한 컴포넌트로
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}

// 3단계: 커스텀 훅 — 사용하는 쪽은 컨텍스트 존재를 몰라도 됨 + 잘못된 사용을 빨리 발견
export function useTasks(): Task[] {
  const tasks = useContext(TasksContext);
  if (tasks === null) throw new Error('useTasks must be used within TasksProvider');
  return tasks;
}

export function useTasksDispatch(): Dispatch<TasksAction> {
  const dispatch = useContext(TasksDispatchContext);
  if (dispatch === null) throw new Error('useTasksDispatch must be used within TasksProvider');
  return dispatch;
}
