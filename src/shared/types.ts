import type { ComponentType } from 'react';

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
  Mine: ComponentType;
  Solution: ComponentType;
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
