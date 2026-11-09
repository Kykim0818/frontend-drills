import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

export type ReducerContextModule = {
  TasksProvider: ComponentType<{ children: ReactNode }>;
  useTasks: () => unknown;
  useTasksDispatch: () => unknown;
  // 과제 전에는 props가 필요한 컴포넌트이므로 느슨하게 둡니다.
  AddTask: ComponentType<any>;
  TaskList: ComponentType<any>;
};

export function runReducerContextSuite(m: ReducerContextModule) {
  const { TasksProvider, useTasks, useTasksDispatch, AddTask, TaskList } = m;

  describe('과제 7 - 리듀서 + 컨텍스트', () => {
    it('Provider 밖에서 훅을 쓰면 TasksProvider를 언급하는 에러', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useTasks())).toThrow(/TasksProvider/);
      expect(() => renderHook(() => useTasksDispatch())).toThrow(/TasksProvider/);
      spy.mockRestore();
    });

    it('Provider 안에서 useTasks는 초기 tasks, useTasksDispatch는 함수', () => {
      const wrapper = ({ children }: { children: ReactNode }) => <TasksProvider>{children}</TasksProvider>;
      const { result } = renderHook(() => ({ tasks: useTasks(), dispatch: useTasksDispatch() }), { wrapper });
      expect(result.current.tasks).toHaveLength(3);
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('dispatch 참조는 tasks가 바뀌어도 그대로', () => {
      const wrapper = ({ children }: { children: ReactNode }) => <TasksProvider>{children}</TasksProvider>;
      const { result, rerender } = renderHook(
        () => ({ tasks: useTasks() as any[], dispatch: useTasksDispatch() as (a: unknown) => void }),
        { wrapper },
      );
      const first = result.current.dispatch;
      act(() => result.current.dispatch({ type: 'deleted', id: 0 }));
      rerender();
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.dispatch).toBe(first);
    });

    it('props 없이 <AddTask/> <TaskList/> 만으로 추가/완료/삭제 동작', async () => {
      const user = userEvent.setup();
      render(
        <TasksProvider>
          <AddTask />
          <TaskList />
        </TasksProvider>,
      );
      await user.type(screen.getByPlaceholderText('할 일 추가'), '온천 가기');
      await user.click(screen.getByRole('button', { name: '추가' }));
      expect(screen.getByText('온천 가기')).toBeInTheDocument();

      await user.click(screen.getByLabelText('사원 방문하기 완료'));
      expect(screen.getByLabelText('사원 방문하기 완료')).toBeChecked();

      const li = screen.getByText('온천 가기').closest('li')!;
      await user.click(within(li).getByRole('button', { name: '삭제' }));
      expect(screen.queryByText('온천 가기')).not.toBeInTheDocument();
    });
  });
}
