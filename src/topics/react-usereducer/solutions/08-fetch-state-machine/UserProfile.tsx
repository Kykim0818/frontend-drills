import { useEffect, useReducer, useState } from 'react';
import { fakeFetchUser, type User } from './api';
import { fetchReducer, type FetchState } from './fetchReducer';

type Props = {
  userId: number;
  fetchUser?: (userId: number) => Promise<User>;
};

const initialState: FetchState<User> = { status: 'idle' };

export function UserProfile({ userId, fetchUser = fakeFetchUser }: Props) {
  const [state, dispatch] = useReducer(fetchReducer<User>, initialState);
  const [attempt, setAttempt] = useState(0); // "다시 시도" 시 effect 재실행용

  useEffect(() => {
    let ignore = false;
    dispatch({ type: 'fetch_started' });
    fetchUser(userId).then(
      (data) => {
        if (!ignore) dispatch({ type: 'fetch_succeeded', data });
      },
      (err: unknown) => {
        if (!ignore) dispatch({ type: 'fetch_failed', error: err instanceof Error ? err.message : String(err) });
      },
    );
    return () => {
      ignore = true; // 이전 요청의 늦은 응답은 무시
    };
    // dispatch 는 안정적인 참조라 의존성에 넣지 않아도 됩니다 (넣어도 무방)
  }, [userId, attempt, fetchUser]);

  switch (state.status) {
    case 'idle':
      return null;
    case 'loading':
      return <p>불러오는 중...</p>;
    case 'success':
      return <p>이름: {state.data.name}</p>;
    case 'error':
      return (
        <p>
          에러: {state.error} <button onClick={() => setAttempt((a) => a + 1)}>다시 시도</button>
        </p>
      );
  }
}

export default function UserProfileDemo() {
  const [userId, setUserId] = useState(1);
  return (
    <div className="card">
      <label>
        userId{' '}
        <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
          <option value={0}>0 (실패)</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </label>
      <UserProfile userId={userId} />
    </div>
  );
}
