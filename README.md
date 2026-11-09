# 🏋️ frontend-drills

공식 문서를 바탕으로 만든 **프론트엔드 퀴즈 + 과제** 모음입니다.
**설치 없이 웹페이지에서 바로** 풀 수 있습니다.

👉 **https://kykim0818.github.io/frontend-drills/**

## 이렇게 풀어요
1. **📘 핵심 개념**을 읽고
2. **❓ 퀴즈**를 풀고 (문제마다 해설과 공식 문서 링크)
3. **📝 과제**는 화면 안의 코드 편집기에서 코드를 고친 뒤 **▶ 채점하기** → 테스트 결과가 바로 나옵니다
4. **📊 내 진행 상황**에서 닉네임을 적고 **공유 링크**를 복사해 점수를 보여주세요
5. 이해가 안 되면 **❓ 질문하기** → GitHub 이슈로 올라갑니다 ([💬 질문 게시판](https://github.com/Kykim0818/frontend-drills/issues?q=is%3Aissue+label%3Aquestion))

- 퀴즈 답, 과제 점수, 작성 중인 코드는 **내 브라우저(localStorage)에 자동 저장**됩니다. 서버나 로그인은 없습니다.
- 공유 링크에는 점수만 들어 있고 코드는 포함되지 않습니다.
- 다른 기기나 브라우저에서 이어 하려면 **📊 내 진행 상황 → 💾 다른 기기로 옮기기**에서
  **백업 파일**을 내려받아 가져오거나, **옮기기 코드**를 복사해서 붙여넣으세요. (작성 중인 코드까지 옮겨집니다)

## 토픽
| 토픽 | 퀴즈 | 과제 | 바탕이 된 문서 |
| --- | --- | --- | --- |
| [🧠 React · useReducer](src/topics/react-usereducer/README.md) | 26문제 | 8개 | [react.dev](https://react.dev/reference/react/useReducer) |
| _다음 토픽 준비 중…_ | | | |

## 화면 설정
- **🌗 테마**: 오른쪽 위에서 라이트 / 다크 / 시스템 설정 따르기를 고를 수 있어요. 코드 편집기 색도 함께 바뀝니다.
- **↔ 크기 조절**: 패널 사이 경계선을 드래그하면 크기가 바뀌고, 다음에 들어와도 그대로 유지돼요.
  - 사이드바 | 본문, 과제 설명 | 편집기, 편집기 | 결과(채점 결과·미리보기 탭)
  - 과제 화면의 ⟲ 버튼으로 패널 크기를 처음 상태로 되돌려요.
- **접기 / 펼치기**
  - 사이드바: 메뉴 옆 « 버튼, 왼쪽 위 버튼, 또는 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>B</kbd>
  - 과제 설명: 설명 머리글의 « 버튼으로 접고, 편집기 왼쪽 위 **설명** 버튼으로 다시 펼쳐요
  - 결과 영역(편집기 아래): ⌄ 버튼으로 접으면 편집기가 아래까지 넓어져요. 탭을 누르거나 채점하면 다시 펼쳐져요
  - 결과 영역 크게 보기: ⤢ 버튼, 다시 누르면 원래 크기로
- 좁은 화면(휴대폰)에서는 사이드바가 서랍 메뉴로 바뀌고, 과제 화면은 위아래로 쌓여요.

## 질문하기
개념 페이지, 퀴즈 문제, 과제 화면마다 **❓ 질문하기** 버튼이 있습니다.
- 질문을 적고 **GitHub에 올리기**를 누르면, 내용이 채워진 GitHub 새 이슈 페이지가 열립니다. **Create**만 누르면 끝! (GitHub 로그인 필요)
- 위치, 문제 내용, 내가 고른 답, 내 코드, 실패한 테스트가 자동으로 첨부됩니다.
- 질문은 `question` 라벨, "내용이 틀린 것 같아요"는 `bug` 라벨이 붙습니다. (`.github/ISSUE_TEMPLATE/`)
- 이슈가 올라갈 저장소는 `src/config.ts`에서 바꿀 수 있습니다.

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
npm run test:app         # 앱 자체 테스트 (진행 상황 백업/합치기 등)
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
│  ├─ progress.ts          # 진행 상황 저장 + 공유 링크 + 백업/옮기기
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

> 기술 스택: React 19 · TypeScript · Vite · CodeMirror · Sucrase · react-resizable-panels · Testing Library · Vitest
> 글꼴: [Pretendard](https://github.com/orioncactus/pretendard) (본문), [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (코드)
