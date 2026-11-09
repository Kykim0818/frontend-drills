# 과제 8. (심화) 비동기 요청 상태 머신 + TypeScript

> 📖 공식 문서: [Choosing the State Structure – Avoid contradictions](https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state) · [Fetching data with Effects](https://react.dev/learn/synchronizing-with-effects#fetching-data) · [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)

## 배경
이런 state는 **모순**이 생길 수 있습니다.
```ts
{ isLoading: true, data: user, error: 'Network Error' } // 로딩 중인데 데이터도 있고 에러도 있다?
```
리듀서 + TypeScript **판별 유니온(discriminated union)** 으로 "가능한 상태"만 표현할 수 있게 만들어봅시다.

```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

## 요구사항 1 — `fetchReducer.ts` (상태 전이표)
| 현재 \ action | `fetch_started` | `fetch_succeeded {data}` | `fetch_failed {error}` | `reset` |
| --- | --- | --- | --- | --- |
| idle | → loading | 무시 | 무시 | → idle |
| loading | 무시 | → success | → error | → idle |
| success | → loading | 무시 | 무시 | → idle |
| error | → loading | 무시 | 무시 | → idle |

- "무시" = **현재 state를 그대로(같은 참조) 반환**
- 알 수 없는 action → throw

## 요구사항 2 — `UserProfile.tsx`
- `userId`가 바뀔 때마다 `fetchUser(userId)`를 호출하세요. (테스트에서는 가짜 API 주입)
- **fetch는 부수 효과** → 리듀서가 아니라 `useEffect`에서. 리듀서는 결과를 받아 state만 계산.
- 화면
  - loading: `불러오는 중...`
  - success: `이름: {data.name}`
  - error: `에러: {error}` + `다시 시도` 버튼 (누르면 다시 요청)
- ⚠️ **경쟁 상태(race condition)**: userId를 1 → 2로 빠르게 바꿨을 때 1의 응답이 늦게 오면 무시해야 합니다.
  (effect cleanup에서 `ignore = true`)
- 💡 "다시 시도"는 어떻게 effect를 다시 실행시킬까요? 리듀서 state에 요청 횟수 같은 값을 넣는 방법,
  별도 `useState`를 두는 방법 등이 있습니다. 자유롭게!

## 확인
```bash
npx vitest react-usereducer/assignments/08-fetch-state-machine
```
