# 과제 1. useState → useReducer 리팩터링 (카운터)

> 📖 공식 문서: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) · [useReducer 레퍼런스](https://react.dev/reference/react/useReducer)

## 목표
- `useReducer`의 세 단계를 직접 손으로 해본다.
  1. state를 **설정(set)** 하던 코드를 action을 **dispatch** 하는 코드로 바꾸기
  2. **리듀서 함수** 작성하기
  3. 컴포넌트에서 **리듀서 사용하기**
- "무엇을 할지(how)"가 아니라 "**무슨 일이 일어났는지(what happened)**"를 action으로 표현하는 감각 익히기

## 현재 상태
`Counter.tsx`는 `useState` 두 개로 만들어진 카운터입니다. 각 이벤트 핸들러 안에 로직이 흩어져 있습니다.

## 요구사항
`reducer.ts`의 `counterReducer`를 구현하고, `Counter.tsx`를 `useReducer`로 바꾸세요.

| action | 동작 |
| --- | --- |
| `{ type: 'incremented' }` | `count`를 `step`만큼 증가 |
| `{ type: 'decremented' }` | `count`를 `step`만큼 감소. **단, 0 미만이 되면 0** |
| `{ type: 'reset' }` | `count`를 0으로. `step`은 **유지** |
| `{ type: 'step_changed', step }` | `step`을 변경. 1 미만이거나 정수가 아니면 **무시** (현재 state 그대로 반환) |
| 그 외 | `Error('Unknown action: ' + action.type)` 를 throw |

- 리듀서는 **순수 함수**여야 합니다. 절대 `state`를 직접 수정하지 마세요. (테스트가 얼린 객체를 넣습니다)
- `Counter`의 UI(버튼 텍스트, `data-testid`)는 바꾸지 마세요. 테스트가 사용합니다.

## 확인
```bash
npx vitest react-usereducer/assignments/01-counter
```

## 생각해볼 질문
1. "0 미만 금지" 규칙을 이벤트 핸들러에 두는 것과 리듀서에 두는 것은 어떤 차이가 있나요?
2. `step_changed`에서 유효하지 않은 값일 때 **새 객체**가 아니라 **기존 state**를 반환하면 어떤 이점이 있나요? (힌트: `Object.is`)
3. 리듀서를 컴포넌트 밖(별도 파일)에 두면 무엇이 좋아지나요?
