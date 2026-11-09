# 새 토픽 추가하기

예시: `react-useeffect` 토픽을 추가한다고 해봅시다. 기존 `src/topics/react-usereducer/`를 복사해서 고치면 가장 빠릅니다.

## 1. 폴더 만들기
```
src/topics/react-useeffect/
├─ index.ts        # 토픽 정의 (퀴즈, 과제, 채점 연결)
├─ README.md       # 토픽 소개 + 과제 목록 (GitHub에서 읽는 용도)
├─ concepts.md     # 핵심 개념 정리 (앱에 표시됨)
├─ questions.ts    # 퀴즈
├─ assignments/    # 시작 코드 + 과제 설명
├─ solutions/      # 모범 답안
└─ specs/          # 채점 테스트 (*.suite.tsx)
```

## 2. 퀴즈 작성 (`questions.ts`)
```ts
import type { Question } from '../../shared/types';

export const levels = ['기초', '동작 원리', '함정'];

export const questions: Question[] = [
  {
    id: 1,
    level: '기초',
    question: '`useEffect`는 언제 실행될까?', // 마크다운 가능
    code: 'useEffect(() => { ... }, [a]);', // 선택
    choices: ['렌더링 중', '화면에 반영된 이후', '...'],
    answer: 1, // choices 의 index
    explanation: '해설 (마크다운)',
    docs: { label: '공식 문서 섹션', url: 'https://react.dev/...' },
  },
];
```

## 3. 과제 하나 = 폴더 하나
```
assignments/01-something/
├─ README.md            # 목표, 요구사항, 힌트, 공식 문서 링크 (앱 왼쪽에 표시)
├─ something.ts         # TODO가 있는 시작 코드 (앱 편집기 탭으로 표시)
├─ Something.tsx        #   〃  (타입 검사는 통과해야 함!)
└─ something.test.tsx   # 로컬 vitest 용: suite 호출만
solutions/01-something/
├─ something.ts         # 모범 답안 (시작 코드와 파일 이름을 똑같이)
├─ Something.tsx
└─ something.test.tsx
specs/something.suite.tsx
```

### 과제 코드에서 쓸 수 있는 것
브라우저에서 실행되므로 **`react`, `react-dom`, 같은 폴더의 `./파일`** 만 import 할 수 있습니다.
(다른 패키지가 필요하면 `src/shared/grader/compile.ts` 의 `externals`에 추가)

### 채점 테스트 (`specs/*.suite.tsx`)
과제와 답안, 브라우저와 로컬이 **같은 테스트**를 쓰도록 "suite 함수"로 만듭니다.
파일 이름은 `.test`/`.spec` 으로 끝나면 안 됩니다. (vitest 가 테스트 파일로 인식함)

```tsx
import { describe, expect, it, vi } from 'vitest'; // ← 반드시 명시적으로 import
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function runSomethingSuite({ Something }: { Something: ComponentType }) {
  describe('과제 1', () => {
    it('...', async () => {
      render(<Something />);
      // ...
    });
  });
}
```

브라우저 채점기(`src/shared/grader/testkit.ts`)는 vitest 의 일부만 지원합니다.
- `describe`, `it`, `vi.fn`, `vi.spyOn` (mockImplementation, mockResolvedValueOnce 등)
- matcher: `toBe`, `toEqual`, `toThrow`, `toHaveLength`, `toContain`, `toBeTruthy/Falsy/Null/Undefined/Defined`,
  `toHaveBeenCalled(Times/With)`, `toBeInTheDocument`, `toHaveTextContent`, `toHaveValue`, `toBeChecked`, `toBeDisabled`
- `expect.objectContaining`, `expect.any`
- `beforeEach`/`afterEach`는 지원하지 않습니다. 테스트마다 `cleanup()`과 `vi.restoreAllMocks()`는 자동으로 합니다.
- 더 필요한 matcher 는 `testkit.ts` 의 `matchers`에 추가하세요.

로컬 vitest 용 테스트 파일:
```tsx
// assignments/01-something/something.test.tsx  (solutions 쪽도 동일)
import { runSomethingSuite } from '../../specs/something.suite';
import Something from './Something';
runSomethingSuite({ Something });
```

## 4. 토픽 정의 (`index.ts`)
`react-usereducer/index.ts`의 `define(...)` 헬퍼를 그대로 복사해 쓰면 편합니다.

```ts
const assignments: Assignment[] = [
  define(
    '01',                                // 과제 번호
    '과제 제목',
    '01-something',                      // assignments/ 와 solutions/ 아래 폴더 이름
    ['something.ts', 'Something.tsx'],   // 편집기 탭 순서 (나머지는 이름순으로 뒤에)
    'Something',                         // 미리보기로 보여줄 모듈 (default export 컴포넌트)
    // 채점: 컴파일된 모듈(파일 이름에서 확장자 뺀 키)을 받아 suite 에 넘김
    (m) => runSomethingSuite({ Something: m.Something.default }),
  ),
];

const topic: Topic = {
  id: 'react-useeffect', // 폴더 이름과 같게
  title: 'React · useEffect',
  emoji: '⚡',
  description: '한 줄 소개',
  concepts,
  levels,
  questions,
  assignments,
};
export default topic;
```

## 5. 등록 (`src/topics/index.ts`)
```ts
import reactUseEffect from './react-useeffect';
export const topics: Topic[] = [reactUseReducer, reactUseEffect];
```

## 6. 확인
```bash
npm run test:solutions   # 답안은 전부 통과해야 함
npm test                 # 시작 코드는 실패해야 정상
npm run build            # 타입 검사 + 빌드
npm run dev              # 브라우저에서 "정답 코드 보기" 내용을 붙여넣고 채점 → 전부 통과하는지
```
그리고 루트 `README.md`의 토픽 표에 한 줄 추가하세요.
