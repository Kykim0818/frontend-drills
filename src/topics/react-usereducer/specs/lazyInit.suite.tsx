import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { vi } from 'vitest';
import { deepFreeze } from '../../../test/deepFreeze';

type Todo = { id: number; text: string };
type State = { draft: string; todos: Todo[] };

export type LazyInitModule = {
  todosReducer: (state: State, action: any) => State;
  createInitialState: (username: string) => State;
  TodoList: ComponentType<{ username: string; init?: (username: string) => State }>;
  TodoApp: ComponentType;
};

export function runLazyInitSuite({ todosReducer, createInitialState, TodoList, TodoApp }: LazyInitModule) {
  describe('과제 5 - todosReducer', () => {
    const base = () => deepFreeze<State>({ draft: '', todos: [{ id: 0, text: 'x' }] });

    it('changed_draft', () => {
      expect(todosReducer(base(), { type: 'changed_draft', nextText: 'abc' })).toEqual({
        draft: 'abc',
        todos: [{ id: 0, text: 'x' }],
      });
    });

    it('added_todo: 맨 앞에 추가하고 draft 비우기 (trim)', () => {
      const s = deepFreeze({ ...base(), draft: '  y  ' });
      expect(todosReducer(s, { type: 'added_todo' })).toEqual({
        draft: '',
        todos: [
          { id: 1, text: 'y' },
          { id: 0, text: 'x' },
        ],
      });
    });

    it('added_todo: 공백뿐이면 같은 참조 반환', () => {
      const s = deepFreeze({ ...base(), draft: '   ' });
      expect(todosReducer(s, { type: 'added_todo' })).toBe(s);
    });

    it('reset: createInitialState(username) 결과로', () => {
      expect(todosReducer(base(), { type: 'reset', username: 'Bob' })).toEqual(createInitialState('Bob'));
    });
  });

  describe('과제 5 - TodoList / TodoApp', () => {
    it('init은 여러 번 리렌더링되어도 딱 한 번만 호출', async () => {
      const user = userEvent.setup();
      const init = vi.fn(createInitialState);
      render(<TodoList username="Taylor" init={init} />);
      await user.type(screen.getByLabelText('새 할 일'), 'abc'); // 3번 리렌더링
      expect(init).toHaveBeenCalledTimes(1);
      expect(init).toHaveBeenCalledWith('Taylor');
    });

    it('추가하면 맨 위에 보임', async () => {
      const user = userEvent.setup();
      render(<TodoList username="Taylor" />);
      await user.type(screen.getByLabelText('새 할 일'), '장보기');
      await user.click(screen.getByRole('button', { name: '추가' }));
      const items = within(screen.getByTestId('todos')).getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('장보기');
      expect(items).toHaveLength(51);
    });

    it('사용자를 바꾸면 그 사용자의 목록으로 초기화 (key)', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);
      await user.type(screen.getByLabelText('새 할 일'), '임시');
      await user.selectOptions(screen.getByLabelText('사용자'), 'Alice');
      const items = within(screen.getByTestId('todos')).getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Alice의 할 일 #1');
      expect(screen.getByLabelText('새 할 일')).toHaveValue('');
    });
  });
}
