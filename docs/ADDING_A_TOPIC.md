# 새 토픽 추가하기

예시: `react-useeffect` 토픽을 추가한다고 해봅시다. 기존 `src/topics/react-usereducer/`를 참고하면 가장 빠릅니다.

## 1. 폴더 만들기
```
src/topics/react-useeffect/
├─ index.ts        # 토픽 정의
├─ README.md       # 토픽 소개 + 과제 목록
├─ concepts.md     # 핵심 개념 정리 (앱에 표시됨)
├─ questions.ts    # 퀴즈
├─ assignments/    # 학습자가 풀 시작 코드
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
    question: '`useEffect`는 언제 실행될까?',   // 마크다운 가능
    code: 'useEffect(() => { ... }, [a]);',    // 선택
    choices: ['렌더링 중', '커밋 이후', '...'],
    answer: 1,                                  // choices 의 index
    explanation: '해설 (마크다운)',
    docs: { label: '공식 문서 섹션', url: 'https://react.dev/...' },
  },
];
```

## 3. 과제 하나 = 폴더 하나
과제와 답안이 **같은 테스트**로 채점되도록 테스트를 "suite 함수"로 만듭니다.

```
assignments/01-something/
├─ README.md            # 목표, 요구사항, 힌트, 공식 문서 링크
├─ Something.tsx        # TODO가 있는 시작 코드 (타입 검사는 통과해야 함!)
└─ something.test.tsx   # suite 호출만
solutions/01-something/
├─ Something.tsx        # 모범 답안
└─ something.test.tsx   # 같은 suite 호출
specs/something.suite.tsx
```

```tsx
// specs/something.suite.tsx  (.test/.spec 로 끝나지 않게! vitest가 테스트 파일로 인식함)
export function runSomethingSuite({ Something }: { Something: ComponentType }) {
  describe('과제 1', () => {
    it('...', () => { /* ... */ });
  });
}

// assignments/01-something/something.test.tsx  (solutions 쪽도 동일)
import { runSomethingSuite } from '../../specs/something.suite';
import Something from './Something';
runSomethingSuite({ Something });
```

## 4. 토픽 정의 (`index.ts`)
```ts
import type { Assignment, Topic } from '../../shared/types';
import concepts from './concepts.md?raw';
import { levels, questions } from './questions';
import readme1 from './assignments/01-something/README.md?raw';
import Mine1 from './assignments/01-something/Something';
import Sol1 from './solutions/01-something/Something';

const assignments: Assignment[] = [
  { id: '01', title: '과제 제목', folder: '01-something', readme: readme1, Mine: Mine1, Solution: Sol1 },
];

const topic: Topic = {
  id: 'react-useeffect',   // 폴더 이름과 같게
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
```
그리고 루트 `README.md`의 토픽 표에 한 줄 추가하세요.
