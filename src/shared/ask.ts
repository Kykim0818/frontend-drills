import { GITHUB_URL } from '../config';

export type AskKind = 'question' | 'content-error';

/** 질문 다이얼로그에 넘기는 문맥 정보 */
export type AskContext = {
  /** 예: "React · useReducer › 과제 01. useState → useReducer" */
  where: string;
  /** 이슈 제목 뒤에 붙일 짧은 이름. 예: "과제 01" */
  short: string;
  /** 자동 첨부할 정보 (마크다운). 길면 잘립니다 */
  details: string;
  /** 사이트에서 해당 위치로 돌아가는 해시. 예: "#/t/react-usereducer/a/01" */
  hash: string;
};

// GitHub 은 대략 8KB 이상의 URL 을 거부합니다. 여유 있게 잡습니다.
const MAX_URL = 7000;

function siteUrl(hash: string) {
  return `${location.origin}${location.pathname}${hash}`;
}

export function buildIssueUrl(kind: AskKind, ctx: AskContext, text: string): string {
  const prefix = kind === 'question' ? '[질문]' : '[오류]';
  const firstLine = text.trim().split('\n')[0].slice(0, 60);
  const title = `${prefix} ${ctx.short}${firstLine ? ` — ${firstLine}` : ''}`;
  const textField = kind === 'question' ? 'question' : 'problem';

  const make = (details: string) => {
    const params = new URLSearchParams({
      template: `${kind}.yml`,
      title,
      where: ctx.where,
      [textField]: text.trim(),
      context: `페이지: ${siteUrl(ctx.hash)}\n\n${details}`,
    });
    return `${GITHUB_URL}/issues/new?${params.toString()}`;
  };

  let details = ctx.details;
  let url = make(details);
  // 너무 길면 참고 정보를 뒤에서부터 잘라냄
  while (url.length > MAX_URL && details.length > 0) {
    details = details.slice(0, Math.floor(details.length * 0.8));
    url = make(`${details}\n\n…(너무 길어서 잘렸습니다)`);
  }
  return url;
}

export const questionsListUrl = `${GITHUB_URL}/issues?q=is%3Aissue+label%3Aquestion`;

/** 코드 블록으로 감싸기 (내용에 ``` 가 있어도 깨지지 않게) */
export function codeBlock(code: string, lang = 'tsx') {
  const fence = code.includes('```') ? '~~~~' : '```';
  return `${fence}${lang}\n${code.trimEnd()}\n${fence}`;
}
