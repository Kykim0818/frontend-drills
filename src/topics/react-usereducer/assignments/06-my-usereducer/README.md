# 과제 6. useReducer 직접 구현하기

> 📖 공식 문서: [Challenge 4: Implement useReducer from scratch](https://react.dev/learn/extracting-state-logic-into-a-reducer#implement-usereducer-from-scratch) · [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)

## 목표
`useState`만으로 `useReducer`를 흉내 내보면서, React가 내부적으로 **action을 어떻게 큐에 쌓고 처리하는지** 이해합니다.

## 현재 상태 (`useMyReducer.ts`)
```ts
function dispatch(action) {
  const nextState = reducer(state, action);
  setState(nextState);
}
```
이 구현은 그럴듯해 보이지만 테스트에서 몇 가지가 실패합니다.

## 요구사항
1. **한 이벤트에서 dispatch를 여러 번** 호출해도 모두 반영되어야 합니다.
   ```ts
   dispatch({ type: 'incremented' });
   dispatch({ type: 'incremented' });
   dispatch({ type: 'incremented' }); // → +3 이어야 함 (지금은 +1)
   ```
   💡 `setState(prev => ...)` 업데이터 함수를 떠올려보세요. 공식 문서 "state 업데이트 큐" 의 그 표를 그려보세요.
2. **dispatch 함수의 참조는 렌더링 사이에 바뀌지 않아야 합니다.** (그래서 effect 의존성에서 빼도 안전)
3. 세 번째 인자 `init`을 지원하세요. `init`이 있으면 **첫 렌더링에만** `init(initialArg)`로 초기 state를 만듭니다.
   💡 `useState(() => ...)` 의 lazy initializer를 활용하세요.

## 보너스 질문
- 실제 React는 dispatch 때 리듀서를 **바로** 실행하지 않고 다음 렌더링 때 실행합니다. 그래서 dispatch 직후 `console.log(state)`는 왜 **이전 값**을 출력할까요?
- 내 구현에서 리듀서가 이전 state와 `Object.is`로 같은 값을 반환하면 리렌더링이 일어날까요?

## 채점
오른쪽 편집기에서 코드를 고치고 **▶ 채점하기**를 누르세요. 작성한 코드는 브라우저에 자동 저장됩니다.

> 로컬에서 파일로 풀고 있다면: `npx vitest react-usereducer/assignments/06-my-usereducer`
