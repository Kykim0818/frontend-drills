# 🏋️ frontend-drills

공식 문서를 바탕으로 만든 **프론트엔드 퀴즈 + 과제** 모음입니다.
토픽마다 **개념 정리 → 퀴즈 → 과제(테스트로 자동 채점)** 순서로 연습합니다.

## 토픽
| 토픽 | 퀴즈 | 과제 | 바탕이 된 문서 |
| --- | --- | --- | --- |
| [🧠 React · useReducer](src/topics/react-usereducer/README.md) | 26문제 | 8개 | [react.dev](https://react.dev/reference/react/useReducer) |
| _다음 토픽 준비 중…_ | | | |

## 시작하기
```bash
npm install
npm run dev      # 브라우저에서 개념 정리 / 퀴즈 / 과제 미리보기
npm test         # 모든 토픽의 내 과제 채점 (watch 모드). 처음엔 실패하는 게 정상!
```

토픽이나 과제 하나만 채점하기:
```bash
npx vitest react-usereducer/assignments          # 토픽 하나
npx vitest react-usereducer/assignments/01       # 과제 하나
```

## 과제 푸는 법
1. 앱에서 토픽의 **핵심 개념**을 읽고 **퀴즈**를 풀어봅니다. 문제마다 해설과 공식 문서 링크가 있습니다.
2. `src/topics/<토픽>/assignments/NN-*/README.md`의 요구사항대로 코드를 고칩니다.
3. `npm test`가 전부 초록색이 될 때까지! 앱 화면에서 내 코드의 동작을 바로 확인할 수 있습니다.
4. 다 풀면 `src/topics/<토픽>/solutions/`의 모범 답안과 비교합니다.

## 폴더 구조
```
src/
├─ App.tsx                 # 사이드바 + 페이지 전환
├─ shared/                 # 모든 토픽이 함께 쓰는 UI (퀴즈, 과제 페이지, 타입)
├─ test/                   # 테스트 설정, deepFreeze 등 테스트 헬퍼
└─ topics/
   ├─ index.ts             # 토픽 목록 (새 토픽은 여기에 등록)
   └─ react-usereducer/
      ├─ index.ts          # 토픽 정의 (제목, 퀴즈, 과제 목록)
      ├─ README.md         # 토픽 소개
      ├─ concepts.md       # 핵심 개념 정리
      ├─ questions.ts      # 퀴즈
      ├─ assignments/      # ✏️ 여기서 과제를 풉니다
      ├─ solutions/        # 모범 답안
      └─ specs/            # 과제와 답안이 공유하는 채점 테스트
```

## 새 토픽 추가하기
[docs/ADDING_A_TOPIC.md](docs/ADDING_A_TOPIC.md)를 참고하세요.

## 기타 명령어
```bash
npm run test:solutions   # 모범 답안이 모든 테스트를 통과하는지 확인
npm run typecheck        # 타입 검사
npm run build            # 프로덕션 빌드
```

> 기술 스택: React 19 · TypeScript · Vite · Vitest · Testing Library
