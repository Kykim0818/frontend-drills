import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { deepFreeze } from '../../../test/deepFreeze';

type State = { count: number; step: number };

export type CounterModule = {
  counterReducer: (state: State, action: any) => State;
  initialCounterState: State;
  Counter: ComponentType;
};

export function runCounterSuite({ counterReducer, initialCounterState, Counter }: CounterModule) {
  describe('과제 1 - counterReducer', () => {
    const s = (count: number, step = 1) => deepFreeze({ count, step });

    it('초기 state는 { count: 0, step: 1 }', () => {
      expect(initialCounterState).toEqual({ count: 0, step: 1 });
    });

    it('incremented: step만큼 증가', () => {
      expect(counterReducer(s(3, 2), { type: 'incremented' })).toEqual({ count: 5, step: 2 });
    });

    it('decremented: step만큼 감소', () => {
      expect(counterReducer(s(5, 2), { type: 'decremented' })).toEqual({ count: 3, step: 2 });
    });

    it('decremented: 0 미만이 되지 않음', () => {
      expect(counterReducer(s(1, 5), { type: 'decremented' })).toEqual({ count: 0, step: 5 });
    });

    it('reset: count만 0으로, step은 유지', () => {
      expect(counterReducer(s(10, 3), { type: 'reset' })).toEqual({ count: 0, step: 3 });
    });

    it('step_changed: step 변경', () => {
      expect(counterReducer(s(0), { type: 'step_changed', step: 4 })).toEqual({ count: 0, step: 4 });
    });

    it('step_changed: 1 미만/정수 아님이면 "같은 참조"를 반환', () => {
      const prev = s(2, 3);
      expect(counterReducer(prev, { type: 'step_changed', step: 0 })).toBe(prev);
      expect(counterReducer(prev, { type: 'step_changed', step: -1 })).toBe(prev);
      expect(counterReducer(prev, { type: 'step_changed', step: 1.5 })).toBe(prev);
    });

    it('state를 직접 수정하지 않고 새 객체를 반환 (불변성)', () => {
      const prev = s(1);
      const next = counterReducer(prev, { type: 'incremented' });
      expect(next).not.toBe(prev);
      expect(prev).toEqual({ count: 1, step: 1 });
    });

    it('알 수 없는 action은 에러', () => {
      expect(() => counterReducer(s(0), { type: 'wat' })).toThrow(/Unknown action: wat/);
    });
  });

  describe('과제 1 - Counter 컴포넌트', () => {
    it('+, -, 초기화가 동작하고 0 미만으로 내려가지 않음', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const count = screen.getByTestId('count');

      await user.click(screen.getByRole('button', { name: '+' }));
      await user.click(screen.getByRole('button', { name: '+' }));
      expect(count).toHaveTextContent('2');

      await user.click(screen.getByRole('button', { name: '-' }));
      await user.click(screen.getByRole('button', { name: '-' }));
      await user.click(screen.getByRole('button', { name: '-' }));
      expect(count).toHaveTextContent('0');
    });

    it('증가 단위를 바꾸면 그만큼 증가하고, 초기화해도 단위는 유지', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const input = screen.getByLabelText('증가 단위');
      fireEvent.change(input, { target: { value: '0' } }); // 0 → 무시되어야 함
      expect(input).toHaveValue(1);
      fireEvent.change(input, { target: { value: '5' } });
      expect(input).toHaveValue(5);
      await user.click(screen.getByRole('button', { name: '+' }));
      expect(screen.getByTestId('count')).toHaveTextContent('5');
      await user.click(screen.getByRole('button', { name: '초기화' }));
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(input).toHaveValue(5);
    });
  });
}
