import type { Modules, SourceFiles } from './grader/compile';

export type Question = {
  id: number;
  /** 토픽마다 자유롭게 정하는 난이도/분류 (예: '기초', '함정') */
  level: string;
  question: string; // 마크다운
  code?: string;
  choices: string[]; // 마크다운
  answer: number; // choices 의 index
  explanation: string; // 마크다운
  docs: { label: string; url: string };
};

export type Assignment = {
  id: string; // '01'
  title: string;
  folder: string; // assignments/ 아래 폴더 이름
  readme: string;
  /** 시작 코드 (파일 이름 → 소스). 편집기 탭 순서 = 객체 키 순서 */
  files: SourceFiles;
  /** 모범 답안 */
  solutionFiles: SourceFiles;
  /** 미리보기로 렌더링할 모듈 이름 (그 모듈의 default export 컴포넌트) */
  entry: string;
  /** 컴파일된 모듈을 받아 채점 suite 를 등록 */
  grade: (modules: Modules) => void;
};

export type Topic = {
  id: string; // 폴더 이름과 동일 (src/topics/<id>)
  title: string;
  emoji: string;
  description: string;
  concepts: string; // 마크다운
  levels: string[]; // 퀴즈 필터 순서
  questions: Question[];
  assignments: Assignment[];
};
