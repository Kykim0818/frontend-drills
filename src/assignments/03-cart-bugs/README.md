# 과제 3. 버그 사냥 🐛 — 순수하지 않은 리듀서 고치기

> 📖 공식 문서: [Writing reducers well](https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-reducers-well) · [Troubleshooting](https://react.dev/reference/react/useReducer#troubleshooting) · [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)

## 상황
동료가 장바구니 리듀서 `cartReducer.ts`를 만들었는데 QA에서 이런 리포트가 올라왔습니다.

1. "이미 담긴 상품을 또 담으면 **수량이 화면에 안 바뀌어요**."
2. "개발 모드에서 새 상품을 담으면 **두 개씩** 들어가요." (`<StrictMode>`)
3. "수량을 바꾸면 **적용했던 쿠폰이 사라져요**."
4. "수량을 0으로 바꿨는데 **0개짜리 상품이 남아 있어요**." (0 이하면 제거해야 함)
5. "쿠폰을 적용하면 **장바구니가 통째로 비워져요**." 그리고 리듀서 안에서 `localStorage`를 건드리고 있어요.
6. "오타 난 action을 dispatch 해도 **아무 에러가 없어서** 디버깅이 힘들어요."

## 할 일
`cartReducer.ts` **만** 고치세요. (`CartApp.tsx`는 이미 `<StrictMode>`로 감싸져 있어 버그를 눈으로 볼 수 있습니다)

- 각 버그 옆에 `// 🐛 버그 N` 주석으로 원인을 한 줄씩 적어보세요.
- 쿠폰 저장(`localStorage`) 같은 **부수 효과는 리듀서 밖**으로 옮기세요. 어디로 옮기면 좋을까요?
  (힌트: 이벤트 핸들러 또는 `useEffect`. `CartApp.tsx`에 이미 자리가 있습니다)

## 핵심 개념
- 리듀서는 **렌더링 중**에 실행됩니다. 그래서 컴포넌트처럼 **순수**해야 합니다.
- React는 `Object.is(이전 state, 다음 state)`가 `true`이면 변경이 없다고 판단합니다.
- Strict Mode는 개발 중에 리듀서를 **두 번 호출**해서 불순한 리듀서를 드러냅니다.

## 확인
```bash
npx vitest src/assignments/03-cart-bugs
```
