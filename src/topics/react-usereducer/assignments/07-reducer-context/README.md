# 과제 7. 리듀서 + 컨텍스트로 확장하기

> 📖 공식 문서: [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) · [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)

## 현재 상태
`TaskApp → TaskList → Task` 로 `tasks`, `onChangeTask`, `onDeleteTask`가 **prop drilling** 되고 있습니다.
(`tasksReducer.ts`는 완성되어 있습니다)

## 요구사항 — 공식 문서의 3단계를 그대로 따라가세요
### 1단계: 컨텍스트 두 개 만들기 (`TasksContext.tsx`)
- `TasksContext` : 현재 tasks 배열
- `TasksDispatchContext` : dispatch 함수
- ❓ 왜 하나로 합치지 않고 **두 개**로 나눌까요? (힌트: dispatch는 리렌더링 사이에 안 바뀜. dispatch만 쓰는 `AddTask`는?)

### 2단계: `TasksProvider` 컴포넌트에서 `useReducer`를 호출하고 두 컨텍스트에 값 제공
```tsx
<TasksProvider>
  <h3>...</h3>
  <AddTask />
  <TaskList />
</TasksProvider>
```

### 3단계: 커스텀 훅 `useTasks()`, `useTasksDispatch()` 만들기
- Provider 바깥에서 호출하면 **에러를 throw** 하세요.
  메시지에 `TasksProvider` 라는 단어를 포함하세요. (예: `'useTasks must be used within TasksProvider'`)
  💡 `createContext<Task[] | null>(null)` 로 만들고 `null` 체크

### 4단계: 컴포넌트에서 prop 대신 훅 사용
- `AddTask`, `TaskList`, `Task`는 **props가 없어야** 합니다.
- `TaskApp`은 `TasksProvider`로 감싸기만 합니다.

## 채점
오른쪽 편집기에서 코드를 고치고 **▶ 채점하기**를 누르세요. 작성한 코드는 브라우저에 자동 저장됩니다.

> 로컬에서 파일로 풀고 있다면: `npx vitest react-usereducer/assignments/07-reducer-context`
