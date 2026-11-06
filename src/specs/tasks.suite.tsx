import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { deepFreeze } from '../test/deepFreeze';

type Task = { id: number; text: string; done: boolean };

export type TasksModule = {
  tasksReducer: (tasks: Task[], action: any) => Task[];
  TaskApp: ComponentType;
};

export function runTasksSuite({ tasksReducer, TaskApp }: TasksModule) {
  const base = () =>
    deepFreeze<Task[]>([
      { id: 0, text: 'A', done: false },
      { id: 1, text: 'B', done: false },
    ]);

  describe('과제 2 - tasksReducer', () => {
    it('added: 맨 뒤에 done:false 로 추가', () => {
      expect(tasksReducer(base(), { type: 'added', id: 9, text: 'C' })).toEqual([
        { id: 0, text: 'A', done: false },
        { id: 1, text: 'B', done: false },
        { id: 9, text: 'C', done: false },
      ]);
    });

    it('changed: 같은 id만 교체', () => {
      const next = tasksReducer(base(), { type: 'changed', task: { id: 1, text: 'B!', done: true } });
      expect(next).toEqual([
        { id: 0, text: 'A', done: false },
        { id: 1, text: 'B!', done: true },
      ]);
    });

    it('changed: 바뀌지 않은 task는 같은 참조를 유지', () => {
      const prev = base();
      const next = tasksReducer(prev, { type: 'changed', task: { id: 1, text: 'B!', done: true } });
      expect(next[0]).toBe(prev[0]);
    });

    it('deleted: 해당 id 제거', () => {
      expect(tasksReducer(base(), { type: 'deleted', id: 0 })).toEqual([{ id: 1, text: 'B', done: false }]);
    });

    it('항상 새 배열을 반환 (원본은 그대로)', () => {
      const prev = base();
      const next = tasksReducer(prev, { type: 'added', id: 2, text: 'C' });
      expect(next).not.toBe(prev);
      expect(prev).toHaveLength(2);
    });

    it('알 수 없는 action은 에러', () => {
      expect(() => tasksReducer(base(), { type: 'setTasks' })).toThrow(/Unknown action: setTasks/);
    });
  });

  describe('과제 2 - TaskApp', () => {
    it('추가 / 완료 체크 / 수정 / 삭제', async () => {
      const user = userEvent.setup();
      render(<TaskApp />);

      await user.type(screen.getByPlaceholderText('할 일 추가'), '라멘 먹기');
      await user.click(screen.getByRole('button', { name: '추가' }));
      expect(screen.getByText('라멘 먹기')).toBeInTheDocument();

      const checkbox = screen.getByLabelText('사원 방문하기 완료');
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      const item = screen.getByText('말차 마시기').closest('li')!;
      await user.click(within(item).getByRole('button', { name: '수정' }));
      const editInput = within(item).getByRole('textbox');
      await user.type(editInput, ' 두 잔');
      await user.click(within(item).getByRole('button', { name: '저장' }));
      expect(screen.getByText('말차 마시기 두 잔')).toBeInTheDocument();

      const ramen = screen.getByText('라멘 먹기').closest('li')!;
      await user.click(within(ramen).getByRole('button', { name: '삭제' }));
      expect(screen.queryByText('라멘 먹기')).not.toBeInTheDocument();
    });
  });
}
