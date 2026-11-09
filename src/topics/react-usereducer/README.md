# 🧠 React · useReducer

[React 공식 문서(react.dev)](https://react.dev/reference/react/useReducer)를 바탕으로 `useReducer`를 완벽하게 이해하기 위한 토픽입니다.

## 구성
- **핵심 개념** (`concepts.md`): 3단계 리팩터링, 동작 원리, 자주 하는 실수, 리듀서 + 컨텍스트
- **퀴즈 26문제** (`questions.ts`): 기초 / 동작 원리 / 함정 / 설계 / 심화
- **과제 8개** (`assignments/`)

## 과제 목록
| # | 과제 | 배우는 것 | 공식 문서 |
| --- | --- | --- | --- |
| 01 | 카운터 리팩터링 | useState → useReducer 3단계, 같은 참조 반환 | [Extracting State Logic](https://react.dev/learn/extracting-state-logic-into-a-reducer) |
| 02 | 할 일 목록 | 공식 예제 리팩터링, 사건 중심 action | 〃 |
| 03 | 버그 사냥 🐛 | mutation, 누락된 spread, fallthrough, 부수 효과, Strict Mode | [Troubleshooting](https://react.dev/reference/react/useReducer#troubleshooting) |
| 04 | 메신저 | 공식 챌린지 1~3: 이벤트 핸들러 dispatch, 연락처별 초안 | [Challenges](https://react.dev/learn/extracting-state-logic-into-a-reducer#challenges) |
| 05 | 초기화 함수 | `init` 3번째 인자, `key`로 state 리셋 | [Avoiding recreating the initial state](https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state) |
| 06 | useReducer 직접 구현 | 업데이트 큐, 안정적인 dispatch, lazy init | [Challenge 4](https://react.dev/learn/extracting-state-logic-into-a-reducer#implement-usereducer-from-scratch) |
| 07 | 리듀서 + 컨텍스트 | Provider, 커스텀 훅, 컨텍스트 분리 | [Scaling Up](https://react.dev/learn/scaling-up-with-reducer-and-context) |
| 08 | (심화) 비동기 상태 머신 | 판별 유니온, 상태 전이, effect와 race condition | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state) |

## 채점
```bash
npx vitest react-usereducer/assignments
```

> 💡 앱의 퀴즈 화면(`src/shared/quiz/quizReducer.ts`)과 사이드바 네비게이션(`src/App.tsx`)도 `useReducer`로 만들어져 있습니다. 다 풀고 나서 읽어보세요.
