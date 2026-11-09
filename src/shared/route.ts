// GitHub Pages 에서는 서버 라우팅이 없으므로 해시(#/...) 로 페이지를 구분합니다.
export type Page =
  | { kind: 'home' }
  | { kind: 'progress' }
  | { kind: 'share'; data: string }
  | { kind: 'concepts'; topicId: string }
  | { kind: 'quiz'; topicId: string }
  | { kind: 'assignment'; topicId: string; id: string };

export function parseHash(hash: string): Page {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'progress') return { kind: 'progress' };
  if (parts[0] === 'share' && parts[1]) return { kind: 'share', data: parts[1] };
  if (parts[0] === 't' && parts[1]) {
    if (parts[2] === 'quiz') return { kind: 'quiz', topicId: parts[1] };
    if (parts[2] === 'a' && parts[3]) return { kind: 'assignment', topicId: parts[1], id: parts[3] };
    return { kind: 'concepts', topicId: parts[1] };
  }
  return { kind: 'home' };
}

export function toHash(page: Page): string {
  switch (page.kind) {
    case 'home':
      return '#/';
    case 'progress':
      return '#/progress';
    case 'share':
      return `#/share/${page.data}`;
    case 'concepts':
      return `#/t/${page.topicId}`;
    case 'quiz':
      return `#/t/${page.topicId}/quiz`;
    case 'assignment':
      return `#/t/${page.topicId}/a/${page.id}`;
  }
}
