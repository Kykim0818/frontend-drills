import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { deepFreeze } from '../../../test/deepFreeze';

type User = { id: number; name: string };

export type FetchModule = {
  fetchReducer: (state: any, action: any) => any;
  UserProfile: ComponentType<{ userId: number; fetchUser?: (id: number) => Promise<User> }>;
};

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function runFetchSuite({ fetchReducer, UserProfile }: FetchModule) {
  const idle = () => deepFreeze({ status: 'idle' });
  const loading = () => deepFreeze({ status: 'loading' });
  const success = () => deepFreeze({ status: 'success', data: { id: 1, name: 'T' } });
  const error = () => deepFreeze({ status: 'error', error: 'x' });

  describe('과제 8 - fetchReducer 상태 전이', () => {
    it('fetch_started: idle/success/error → loading', () => {
      for (const s of [idle(), success(), error()]) {
        expect(fetchReducer(s, { type: 'fetch_started' })).toEqual({ status: 'loading' });
      }
    });

    it('fetch_started: loading이면 같은 참조', () => {
      const s = loading();
      expect(fetchReducer(s, { type: 'fetch_started' })).toBe(s);
    });

    it('loading → success / error', () => {
      expect(fetchReducer(loading(), { type: 'fetch_succeeded', data: { id: 2, name: 'A' } })).toEqual({
        status: 'success',
        data: { id: 2, name: 'A' },
      });
      expect(fetchReducer(loading(), { type: 'fetch_failed', error: 'boom' })).toEqual({
        status: 'error',
        error: 'boom',
      });
    });

    it('loading이 아닐 때 succeeded/failed는 무시 (같은 참조)', () => {
      for (const s of [idle(), success(), error()]) {
        expect(fetchReducer(s, { type: 'fetch_succeeded', data: { id: 9, name: 'Z' } })).toBe(s);
        expect(fetchReducer(s, { type: 'fetch_failed', error: 'z' })).toBe(s);
      }
    });

    it('reset: 어디서든 idle', () => {
      for (const s of [idle(), loading(), success(), error()]) {
        expect(fetchReducer(s, { type: 'reset' })).toEqual({ status: 'idle' });
      }
    });

    it('알 수 없는 action은 에러', () => {
      expect(() => fetchReducer(idle(), { type: 'fetched' })).toThrow(/Unknown action: fetched/);
    });
  });

  describe('과제 8 - UserProfile', () => {
    it('로딩 → 성공', async () => {
      const d = deferred<User>();
      const fetchUser = vi.fn(() => d.promise);
      render(<UserProfile userId={1} fetchUser={fetchUser} />);
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
      expect(fetchUser).toHaveBeenCalledWith(1);
      await act(async () => d.resolve({ id: 1, name: 'Taylor' }));
      expect(screen.getByText('이름: Taylor')).toBeInTheDocument();
    });

    it('실패 → 에러 표시 → 다시 시도로 재요청', async () => {
      const user = userEvent.setup();
      const fetchUser = vi
        .fn<(id: number) => Promise<User>>()
        .mockRejectedValueOnce(new Error('네트워크 오류'))
        .mockResolvedValueOnce({ id: 1, name: 'Taylor' });
      render(<UserProfile userId={1} fetchUser={fetchUser} />);
      expect(await screen.findByText(/에러: 네트워크 오류/)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '다시 시도' }));
      expect(await screen.findByText('이름: Taylor')).toBeInTheDocument();
      expect(fetchUser).toHaveBeenCalledTimes(2);
    });

    it('race condition: 이전 userId의 늦은 응답은 무시', async () => {
      const first = deferred<User>();
      const second = deferred<User>();
      const fetchUser = vi.fn((id: number) => (id === 1 ? first.promise : second.promise));
      const { rerender } = render(<UserProfile userId={1} fetchUser={fetchUser} />);
      rerender(<UserProfile userId={2} fetchUser={fetchUser} />);
      await act(async () => second.resolve({ id: 2, name: 'Alice' }));
      expect(screen.getByText('이름: Alice')).toBeInTheDocument();
      await act(async () => first.resolve({ id: 1, name: 'Taylor' })); // 늦게 도착
      expect(screen.getByText('이름: Alice')).toBeInTheDocument();
      expect(screen.queryByText('이름: Taylor')).not.toBeInTheDocument();
    });
  });
}
