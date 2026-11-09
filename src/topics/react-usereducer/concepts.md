# useReducer 핵심 개념 정리

> 출처: react.dev — [useReducer 레퍼런스](https://react.dev/reference/react/useReducer) · [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) · [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)

**학습 순서 추천:** 이 페이지 읽기 → 퀴즈 풀기 → 과제 01~08 → 퀴즈 다시 풀기 (만점 목표!)

---

## 1. 한 줄 요약
> **"state를 어떻게 바꿀지"** 를 컴포넌트에서 꺼내 **리듀서 함수 하나에 모으는** 훅.
> 컴포넌트는 **"무슨 일이 일어났는지(action)"** 만 알려준다(dispatch).

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init?);
```

| 이름 | 설명 |
| --- | --- |
| `reducer` | `(state, action) => nextState` 순수 함수 |
| `initialArg` | 초기값 (또는 `init`에 넘길 인자) |
| `init` (선택) | 있으면 초기 state = `init(initialArg)`. **첫 렌더링에만** 실행 |
| `state` | 현재 state |
| `dispatch(action)` | 다음 렌더링을 위한 state 업데이트 요청. 반환값 없음 |

## 2. useState → useReducer 3단계
1. **set 대신 dispatch**: `setTasks([...])` → `dispatch({ type: 'added', id, text })`
2. **리듀서 작성**: 현재 state + action → 다음 state 반환
3. **컴포넌트에서 사용**: `useReducer(tasksReducer, initialTasks)`

```jsx
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [...tasks, { id: action.id, text: action.text, done: false }];
    }
    case 'changed': {
      return tasks.map(t => (t.id === action.task.id ? action.task : t));
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
```

## 3. 좋은 리듀서의 두 가지 규칙
1. **순수해야 한다** — 리듀서는 *렌더링 중에* 실행된다.
   - 요청, 타이머, `localStorage`, `Math.random()`, 객체/배열 직접 변경 ❌
   - 부수 효과는 **이벤트 핸들러**나 **Effect**에서. 필요한 값(id 등)은 action에 담아 보낸다.
2. **action 하나 = 사용자 상호작용 하나** — 데이터가 여러 군데 바뀌어도.
   - 폼 필드 5개 리셋 → `set_field` ×5 ❌ / `reset_form` ×1 ✅

## 4. 동작 원리 (꼭 알아야 할 것)
- **state는 스냅샷**: `dispatch` 직후 `console.log(state)` → *이전 값*. 다음 값이 필요하면 `reducer(state, action)`을 직접 호출.
- **action은 큐에 쌓인다**: 한 이벤트에서 3번 dispatch → 3번 모두 순서대로 반영 (업데이터 함수처럼).
- **배치(batching)**: 이벤트 핸들러가 끝난 뒤 한 번만 리렌더링.
- **Object.is 비교**: 리듀서가 같은 참조를 반환하면 리렌더링을 건너뜀 → **mutation 후 같은 객체 반환 = 화면 안 바뀜** 버그.
- **dispatch는 안정적**: 렌더링마다 같은 함수. effect 의존성에서 빼도 됨, 컨텍스트로 내려도 리렌더링 유발 X.
- **Strict Mode**: 개발 모드에서 리듀서/init을 **두 번** 호출해 불순함을 드러냄.

## 5. 자주 하는 실수
| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 화면이 안 바뀜 | `state.x = ...; return state;` | 새 객체 `{ ...state, x }` |
| 일부 필드가 `undefined` | `return { name }` (나머지 누락) | `{ ...state, name }` |
| 개발 모드에서 두 번 추가됨 | `state.items.push()` | `[...state.items, item]` |
| Too many re-renders | `onClick={handle(1)}` | `onClick={() => handle(1)}` |
| 매 렌더마다 무거운 계산 | `useReducer(r, createInitial(x))` | `useReducer(r, x, createInitial)` |
| state가 함수가 됨 | `useReducer(r, createInitial)` | 3번째 인자로! |
| 다음 case 로직까지 실행됨 | `return` 빠뜨림 (fallthrough) | 각 case를 `{ }` + `return` |
| 오타 action이 조용히 무시됨 | `default: return state` | `default: throw Error(...)` |

## 6. useState vs useReducer
| 기준 | useState | useReducer |
| --- | --- | --- |
| 코드 양 | 적음 | 리듀서·action 작성 필요 |
| 가독성 | 단순할 때 좋음 | 업데이트 로직이 복잡할 때 좋음 |
| 디버깅 | 어디서 잘못 set 했는지 찾기 어려움 | 리듀서에 로그 → action별 추적 |
| 테스트 | 컴포넌트째 테스트 | 리듀서만 순수 함수로 단위 테스트 |

→ **섞어 써도 된다.** 잘못된 state 업데이트로 버그가 잦다면 리듀서를 고려.

## 7. 리듀서 + 컨텍스트 (규모가 커지면)
```jsx
const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}
export const useTasks = () => useContext(TasksContext);
export const useTasksDispatch = () => useContext(TasksDispatchContext);
```
- 데이터와 dispatch를 **분리**하면 dispatch만 쓰는 컴포넌트는 데이터 변경에 영향받지 않음.
- prop drilling 없이 트리 어디서든 `useTasks()` / `useTasksDispatch()`.

## 8. 더 나아가기
- **Immer** (`useImmerReducer`): `draft.push(...)`처럼 변경 문법으로 불변 업데이트. 그래도 순수성 규칙은 유지.
- **TypeScript 판별 유니온**: `type Action = { type: 'added'; id: number } | ...` → case 안에서 자동 타입 좁히기, `never`로 빠진 case 검사.
