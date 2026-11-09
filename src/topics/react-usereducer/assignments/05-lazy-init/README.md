# 과제 5. 초기화 함수(init)와 state 리셋

> 📖 공식 문서: [Avoiding recreating the initial state](https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state) · [Resetting state with a key](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)

## 배경
```ts
useReducer(reducer, initialArg, init?)
```
- `init`을 넘기면 초기 state는 `init(initialArg)` 의 결과가 됩니다.
- `useReducer(reducer, createInitialState(username))` 처럼 쓰면 결과는 첫 렌더에만 쓰이지만
  **함수 호출 자체는 매 렌더링마다** 일어납니다. 무거운 계산이라면 낭비죠.
- `useReducer(reducer, createInitialState)` 는 ❌ — 이러면 **함수 자체가 state**가 됩니다.
  (`useState(fn)`과 달리 `useReducer`의 두 번째 인자는 lazy initializer가 아닙니다!)

## 현재 상태
`TodoList.tsx`는 `useReducer(todosReducer, init(username))` 로 되어 있어 입력할 때마다 `init`이 다시 호출됩니다.
(테스트를 위해 `init`은 prop으로 주입할 수 있게 되어 있어요. 기본값은 `createInitialState`)

## 요구사항
1. `todosReducer.ts` 구현
   | action | 동작 |
   | --- | --- |
   | `{ type: 'changed_draft', nextText }` | `draft` 변경 |
   | `{ type: 'added_todo' }` | `draft`가 공백뿐이면 **같은 state 반환**. 아니면 맨 **앞에** `{ id: state.todos.length, text: draft.trim() }` 추가 후 `draft`를 `''`로 |
   | `{ type: 'reset', username }` | `createInitialState(username)` 결과로 되돌리기 |
2. `TodoList`에서 `init`이 **첫 렌더링에 딱 한 번만** 호출되도록 고치기 (3번째 인자 사용)
3. `TodoApp`에서 사용자를 바꾸면 목록이 **그 사용자의 목록으로 새로 초기화**되게 하기
   - ❓ `username` prop이 바뀌어도 `init`은 다시 실행되지 않습니다. 왜일까요?
   - 💡 리듀서/effect를 건드리지 말고 **`key`** 로 해결하세요.

## 확인
```bash
npx vitest react-usereducer/assignments/05-lazy-init
```
