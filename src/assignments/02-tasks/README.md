# 과제 2. 할 일 목록을 리듀서로 옮기기 (공식 문서 예제)

> 📖 공식 문서: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)

## 목표
공식 문서의 `TaskApp` 예제를 직접 리팩터링합니다. 이벤트 핸들러 3개(`handleAddTask`, `handleChangeTask`, `handleDeleteTask`)에 흩어진 **state 업데이트 로직**을 하나의 리듀서로 모읍니다.

## 현재 상태
- `TaskApp.tsx` : `useState`로 tasks 배열을 관리 (여기를 고칩니다)
- `AddTask.tsx`, `TaskList.tsx` : 완성된 UI 컴포넌트 (수정할 필요 없음)
- `tasksReducer.ts` : 비어 있는 리듀서 (여기를 구현합니다)

## 요구사항
### 1) `tasksReducer(tasks, action)` 구현
| action | 동작 |
| --- | --- |
| `{ type: 'added', id, text }` | 맨 뒤에 `{ id, text, done: false }` 추가 |
| `{ type: 'changed', task }` | 같은 `id`의 task를 `action.task`로 교체 |
| `{ type: 'deleted', id }` | 해당 `id`의 task 제거 |
| 그 외 | `Error('Unknown action: ' + action.type)` throw |

### 2) `TaskApp`에서 `useReducer(tasksReducer, initialTasks)` 사용
- 이벤트 핸들러는 `dispatch(...)`만 호출해야 합니다.
- ⚠️ `nextId` 증가처럼 **리듀서 밖**에 있어야 하는 것은 무엇인지 생각해보세요.
  - id를 리듀서 안에서 `Date.now()`나 `Math.random()`으로 만들면 왜 안 될까요?

## 체크 포인트
- [ ] action 이름이 "setTasks" 같은 **명령**이 아니라 `added`/`changed`/`deleted` 같은 **사건**인가?
- [ ] 리듀서가 배열을 `push`/`splice` 하지 않고 `[...]`, `map`, `filter`로 새 배열을 만드는가?
- [ ] 리듀서를 **컴포넌트 바깥**에 선언했는가?

## 확인
```bash
npx vitest src/assignments/02-tasks
```
