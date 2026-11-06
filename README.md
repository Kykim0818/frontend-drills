# useReducer 마스터하기 🧠

[React 공식 문서(react.dev)](https://react.dev/reference/react/useReducer)를 바탕으로 만든 **`useReducer` 퀴즈 + 과제** 플레이그라운드입니다.

## 시작하기
```bash
npm install
npm run dev      # 브라우저에서 개념 정리 / 퀴즈 / 과제 미리보기
npm test         # 내 과제 채점 (watch 모드). 처음엔 대부분 실패하는 게 정상!
```

특정 과제만 채점:
```bash
npx vitest src/assignments/01-counter
```

## 구성
| 경로 | 내용 |
| --- | --- |
| `src/content/concepts.md` | 핵심 개념 요약 (앱 첫 화면) |
| `src/quiz/questions.ts` | 퀴즈 26문제 (기초 / 동작 원리 / 함정 / 설계 / 심화), 문항마다 해설 + 공식 문서 링크 |
| `src/assignments/NN-*/` | **여기서 과제를 풉니다.** 각 폴더의 `README.md`에 요구사항 |
| `src/solutions/NN-*/` | 모범 답안 (먼저 직접 풀어보세요!) |
| `src/specs/*.suite.tsx` | 과제/정답이 공유하는 채점 테스트 |

## 과제 목록
| # | 과제 | 배우는 것 | 공식 문서 |
| --- | --- | --- | --- |
| 01 | 카운터 리팩터링 | useState → useReducer 3단계, 같은 참조 반환 | [Extracting State Logic](https://react.dev/learn/extracting-state-logic-into-a-reducer) |
| 02 | 할 일 목록 | 공식 예제 그대로 리팩터링, 사건 중심 action | 〃 |
| 03 | 버그 사냥 🐛 | mutation, 누락된 spread, fallthrough, 부수 효과, Strict Mode | [Troubleshooting](https://react.dev/reference/react/useReducer#troubleshooting) |
| 04 | 메신저 | 공식 챌린지 1~3: 이벤트 핸들러 dispatch, 연락처별 초안 | [Challenges](https://react.dev/learn/extracting-state-logic-into-a-reducer#challenges) |
| 05 | 초기화 함수 | `init` 3번째 인자, `key`로 state 리셋 | [Avoiding recreating the initial state](https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state) |
| 06 | useReducer 직접 구현 | 업데이트 큐, 안정적인 dispatch, lazy init | [Challenge 4](https://react.dev/learn/extracting-state-logic-into-a-reducer#implement-usereducer-from-scratch) |
| 07 | 리듀서 + 컨텍스트 | Provider, 커스텀 훅, 컨텍스트 분리 | [Scaling Up](https://react.dev/learn/scaling-up-with-reducer-and-context) |
| 08 | (심화) 비동기 상태 머신 | 판별 유니온, 상태 전이, effect와 race condition | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state) |

## 추천 학습 순서
1. 앱의 **핵심 개념 정리** 읽기
2. **퀴즈** 한 번 풀기 (점수는 신경 쓰지 말고, 해설과 링크 읽기)
3. 과제 01 → 08 순서대로. `npm test`가 전부 초록색이 될 때까지!
4. 정답 코드(`src/solutions`)와 내 코드 비교
5. 퀴즈 다시 풀기 → 만점 🎉

## 기타 명령어
```bash
npm run test:solutions   # 모범 답안이 모든 테스트를 통과하는지 확인
npm run typecheck        # 타입 검사
npm run build            # 프로덕션 빌드
```

> 💡 퀴즈 화면(`src/quiz/quizReducer.ts`)과 사이드바 네비게이션(`src/App.tsx`)도 `useReducer`로 만들어져 있습니다. 다 풀고 나서 읽어보세요.
