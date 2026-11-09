# 🏋️ frontend-drills

공식 문서를 바탕으로 만든 **프론트엔드 퀴즈 + 과제** 모음입니다.
**설치 없이 웹페이지에서 바로** 풀 수 있습니다.

👉 **https://kykim0818.github.io/frontend-drills/**

## 이렇게 풀어요
1. **📘 핵심 개념**을 읽고
2. **❓ 퀴즈**를 풀고 (문제마다 해설과 공식 문서 링크)
3. **📝 과제**는 화면 안의 코드 편집기에서 코드를 고친 뒤 **▶ 채점하기** → 테스트 결과가 바로 나옵니다
4. **📊 내 진행 상황**에서 닉네임을 적고 **공유 링크**를 복사해 점수를 보여주세요

- 퀴즈 답, 과제 점수, 작성 중인 코드는 **내 브라우저(localStorage)에 자동 저장**됩니다. 서버나 로그인은 없습니다.
- 공유 링크에는 점수만 들어 있고 코드는 포함되지 않습니다.
- 다른 브라우저나 기기에서는 진행 상황이 이어지지 않습니다.

## 토픽
| 토픽 | 퀴즈 | 과제 | 바탕이 된 문서 |
| --- | --- | --- | --- |
| [🧠 React · useReducer](src/topics/react-usereducer/README.md) | 26문제 | 8개 | [react.dev](https://react.dev/reference/react/useReducer) |
| _다음 토픽 준비 중…_ | | | |

## 동작 방식
- 과제 코드는 브라우저에서 [Sucrase](https://github.com/alangpierce/sucrase)로 TypeScript/JSX를 변환해 실행합니다.
- **채점**은 숨겨진 iframe(`grader.html`) 안에서 Testing Library로 테스트를 돌립니다. 앱 화면과 섞이지 않게 하기 위해서입니다.
- 채점 테스트(`specs/*.suite.tsx`)는 **브라우저 채점과 로컬 Vitest가 같은 코드**를 씁니다. 앱 빌드에서는 `vitest` import가 브라우저용 작은 테스트 도구(`src/shared/grader/testkit.ts`)로 바뀝니다.
- `main` 브랜치에 푸시하면 GitHub Actions가 모범 답안 테스트 → 빌드 → GitHub Pages 배포를 합니다.

## 로컬에서 개발하기
```bash
npm install
npm run dev              # http://localhost:5173
npm run test:solutions   # 모범 답안이 모든 채점 테스트를 통과하는지
npm run build            # 타입 검사 + 빌드
```

로컬 파일로 직접 과제를 풀고 싶다면 `src/topics/<토픽>/assignments/`를 고치고 `npm test`로 채점할 수도 있습니다.

## 폴더 구조
```
src/
├─ App.tsx                 # 사이드바 + 해시 라우팅 (#/t/<토픽>/a/<과제>)
├─ grader-main.ts          # 채점 iframe 엔트리
├─ shared/
│  ├─ AssignmentPage.tsx   # 편집기 + 채점 + 미리보기
│  ├─ grader/              # 브라우저 컴파일러, 테스트 도구, 실행기
│  ├─ quiz/                # 퀴즈 화면
│  ├─ progress.ts          # 진행 상황 저장 + 공유 링크
│  └─ ...
└─ topics/
   ├─ index.ts             # 토픽 목록 (새 토픽은 여기에 등록)
   └─ react-usereducer/
      ├─ index.ts          # 토픽 정의 (퀴즈, 과제, 채점 연결)
      ├─ concepts.md       # 핵심 개념
      ├─ questions.ts      # 퀴즈
      ├─ assignments/      # 시작 코드 + 과제 설명(README.md)
      ├─ solutions/        # 모범 답안
      └─ specs/            # 채점 테스트
```

## 새 토픽 추가하기
[docs/ADDING_A_TOPIC.md](docs/ADDING_A_TOPIC.md)를 참고하세요.

> 기술 스택: React 19 · TypeScript · Vite · CodeMirror · Sucrase · Testing Library · Vitest
