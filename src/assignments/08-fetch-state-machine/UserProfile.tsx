import { useReducer, useState } from 'react';
import { fakeFetchUser, type User } from './api';
import { fetchReducer, type FetchState } from './fetchReducer';

type Props = {
  userId: number;
  fetchUser?: (userId: number) => Promise<User>;
};

const initialState: FetchState<User> = { status: 'idle' };

export function UserProfile({ userId, fetchUser = fakeFetchUser }: Props) {
  const [state, dispatch] = useReducer(fetchReducer<User>, initialState);

  // TODO: useEffect 로 userId가 바뀔 때마다 요청하고, 결과를 dispatch 하세요.
  //       race condition 방지(ignore 플래그)도 잊지 마세요.
  void dispatch;
  void fetchUser;
  void userId;

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
          에러: {state.error} <button onClick={() => {/* TODO: 다시 시도 */}}>다시 시도</button>
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
