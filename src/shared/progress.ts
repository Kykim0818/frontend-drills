import { useSyncExternalStore } from 'react';

/**
 * 진행 상황(퀴즈 답, 과제 점수, 작성 중인 코드)은 브라우저 localStorage 에만 저장됩니다.
 * 다른 사람과 점수를 공유할 때는 encodeShare() 로 만든 링크를 보냅니다. (서버 없음)
 */

export type AssignmentScore = { passed: number; total: number; at: string };

export type Progress = {
  nickname: string;
  /** topicId → (questionId → 고른 보기 index) */
  quiz: Record<string, Record<number, number>>;
  /** `${topicId}/${assignmentId}` → 최고 점수 */
  assignments: Record<string, AssignmentScore>;
};

const KEY = 'frontend-drills:progress:v1';
const CODE_KEY = (topicId: string, assignmentId: string) => `frontend-drills:code:v1:${topicId}/${assignmentId}`;

const empty: Progress = { nickname: '', quiz: {}, assignments: {} };

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

let state: Progress = read();
const listeners = new Set<() => void>();

function set(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패(사생활 보호 모드 등)는 무시 — 이번 세션 동안은 메모리에 유지 */
  }
  listeners.forEach((l) => l());
}

// 다른 탭에서 바뀐 경우 반영
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read();
      listeners.forEach((l) => l());
    }
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state);
}

export const progress = {
  get: () => state,
  setNickname(nickname: string) {
    set({ ...state, nickname });
  },
  setQuizAnswers(topicId: string, answers: Record<number, number>) {
    set({ ...state, quiz: { ...state.quiz, [topicId]: answers } });
  },
  /** 이전 최고 점수보다 높거나 같을 때만 갱신 */
  recordAssignment(topicId: string, assignmentId: string, passed: number, total: number) {
    const key = `${topicId}/${assignmentId}`;
    const prev = state.assignments[key];
    if (prev && prev.passed / prev.total > passed / total) return;
    set({ ...state, assignments: { ...state.assignments, [key]: { passed, total, at: new Date().toISOString() } } });
  },
  reset() {
    set(empty);
  },
};

// ───────── 작성 중인 코드 (과제별로 따로 저장) ─────────

export function loadCode(topicId: string, assignmentId: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CODE_KEY(topicId, assignmentId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCode(topicId: string, assignmentId: string, files: Record<string, string> | null) {
  try {
    if (files) localStorage.setItem(CODE_KEY(topicId, assignmentId), JSON.stringify(files));
    else localStorage.removeItem(CODE_KEY(topicId, assignmentId));
  } catch {
    /* 무시 */
  }
}

// ───────── 공유 링크 ─────────

export type ShareData = {
  v: 1;
  n: string; // 닉네임
  d: string; // 날짜 (YYYY-MM-DD)
  /** topicId → [퀴즈 정답 수, 퀴즈 문제 수, 과제별 [통과, 전체] ...] */
  t: Record<string, { q: [number, number]; a: Record<string, [number, number]> }>;
};

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeShare(data: ShareData): string {
  return toBase64Url(JSON.stringify(data));
}

export function decodeShare(s: string): ShareData | null {
  try {
    const data = JSON.parse(fromBase64Url(s));
    return data?.v === 1 && typeof data.t === 'object' ? data : null;
  } catch {
    return null;
  }
}
