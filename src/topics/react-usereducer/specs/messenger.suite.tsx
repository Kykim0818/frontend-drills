import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { deepFreeze } from '../../../test/deepFreeze';

type State = { selectedId: number; messages: Record<number, string> };

export type MessengerModule = {
  messengerReducer: (state: any, action: any) => any;
  initialState: unknown;
  Messenger: ComponentType<{ onSend?: (message: string, contact: any) => void }>;
};

export function runMessengerSuite({ messengerReducer, initialState, Messenger }: MessengerModule) {
  const base = () => deepFreeze<State>({ selectedId: 1, messages: { 0: 'a', 1: 'b', 2: 'c' } });

  describe('과제 4 - messengerReducer', () => {
    it('초기 state는 연락처별 초안을 가진다', () => {
      expect(initialState).toEqual({
        selectedId: 0,
        messages: { 0: 'Hello, Taylor', 1: 'Hello, Alice', 2: 'Hello, Bob' },
      });
    });

    it('changed_selection: 선택만 바꾸고 초안은 유지', () => {
      expect(messengerReducer(base(), { type: 'changed_selection', contactId: 2 })).toEqual({
        selectedId: 2,
        messages: { 0: 'a', 1: 'b', 2: 'c' },
      });
    });

    it('edited_message: 선택된 연락처의 초안만 변경', () => {
      expect(messengerReducer(base(), { type: 'edited_message', message: 'hi' })).toEqual({
        selectedId: 1,
        messages: { 0: 'a', 1: 'hi', 2: 'c' },
      });
    });

    it('sent_message: 선택된 연락처의 초안만 비움', () => {
      expect(messengerReducer(base(), { type: 'sent_message' })).toEqual({
        selectedId: 1,
        messages: { 0: 'a', 1: '', 2: 'c' },
      });
    });
  });

  describe('과제 4 - Messenger', () => {
    it('보내기: onSend 호출 후 입력창 비움', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Messenger onSend={onSend} />);
      const textarea = screen.getByLabelText('메시지');
      expect(textarea).toHaveValue('Hello, Taylor');
      await user.type(textarea, '!');
      await user.click(screen.getByRole('button', { name: /taylor@mail.com/ }));
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith('Hello, Taylor!', expect.objectContaining({ id: 0 }));
      expect(screen.getByLabelText('메시지')).toHaveValue('');
    });

    it('연락처를 오가도 각자의 초안이 유지됨', async () => {
      const user = userEvent.setup();
      render(<Messenger onSend={() => {}} />);
      await user.click(screen.getByRole('button', { name: 'Alice' }));
      expect(screen.getByLabelText('메시지')).toHaveValue('Hello, Alice');
      await user.type(screen.getByLabelText('메시지'), ' :)');
      await user.click(screen.getByRole('button', { name: 'Bob' }));
      expect(screen.getByLabelText('메시지')).toHaveValue('Hello, Bob');
      await user.click(screen.getByRole('button', { name: 'Alice' }));
      expect(screen.getByLabelText('메시지')).toHaveValue('Hello, Alice :)');
    });
  });
}
