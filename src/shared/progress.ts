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

type SavedCode = { files: Record<string, string>; at: string };

function parseSavedCode(raw: string | null): SavedCode | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && typeof data.files === 'object' && typeof data.at === 'string') return data;
    // 예전 형식: 파일 객체만 저장했던 경우
    if (data && typeof data === 'object') return { files: data, at: new Date(0).toISOString() };
  } catch {
    /* 무시 */
  }
  return null;
}

export function loadCode(topicId: string, assignmentId: string): Record<string, string> | null {
  try {
    return parseSavedCode(localStorage.getItem(CODE_KEY(topicId, assignmentId)))?.files ?? null;
  } catch {
    return null;
  }
}

export function saveCode(topicId: string, assignmentId: string, files: Record<string, string> | null) {
  try {
    const key = CODE_KEY(topicId, assignmentId);
    if (!files) return localStorage.removeItem(key);
    // 내용이 그대로면 시간을 갱신하지 않음 (페이지를 열기만 해도 "최근 수정"이 되지 않게)
    const prev = parseSavedCode(localStorage.getItem(key));
    if (prev && JSON.stringify(prev.files) === JSON.stringify(files)) return;
    localStorage.setItem(key, JSON.stringify({ files, at: new Date().toISOString() } satisfies SavedCode));
  } catch {
    /* 무시 */
  }
}

// ───────── 백업 / 다른 기기로 옮기기 ─────────

const CODE_PREFIX = 'frontend-drills:code:v1:';

export type Backup = {
  app: 'frontend-drills';
  v: 1;
  exportedAt: string;
  progress: Progress;
  /** `${topicId}/${assignmentId}` → 작성 중인 코드 */
  code: Record<string, SavedCode>;
};

export type ImportMode = 'merge' | 'replace';
export type ImportSummary = { quiz: number; assignments: number; code: number };

export function createBackup(): Backup {
  const code: Backup['code'] = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (!key.startsWith(CODE_PREFIX)) continue;
      const saved = parseSavedCode(localStorage.getItem(key));
      if (saved) code[key.slice(CODE_PREFIX.length)] = saved;
    }
  } catch {
    /* 무시 */
  }
  return { app: 'frontend-drills', v: 1, exportedAt: new Date().toISOString(), progress: state, code };
}

export function parseBackup(data: unknown): Backup {
  const b = data as Partial<Backup> | null;
  if (!b || b.app !== 'frontend-drills') throw new Error('frontend-drills 백업이 아닙니다.');
  if (b.v !== 1) throw new Error(`지원하지 않는 백업 버전입니다 (v${String(b.v)}). 사이트를 새로고침해 보세요.`);
  if (!b.progress || typeof b.progress !== 'object' || !b.code || typeof b.code !== 'object') {
    throw new Error('백업 내용이 손상되었습니다.');
  }
  return {
    app: 'frontend-drills',
    v: 1,
    exportedAt: String(b.exportedAt ?? ''),
    progress: { ...empty, ...b.progress },
    code: b.code,
  };
}

const ratio = (s: AssignmentScore) => (s.total ? s.passed / s.total : 0);

/** 두 진행 상황 합치기: 퀴즈는 안 푼 문제만 채우고, 과제는 더 높은 점수를 남김 */
function mergeProgress(cur: Progress, inc: Progress): Progress {
  const quiz = { ...cur.quiz };
  for (const [topicId, answers] of Object.entries(inc.quiz)) {
    quiz[topicId] = { ...answers, ...(cur.quiz[topicId] ?? {}) };
  }
  const assignments = { ...cur.assignments };
  for (const [key, score] of Object.entries(inc.assignments)) {
    const mine = cur.assignments[key];
    if (!mine || ratio(score) > ratio(mine) || (ratio(score) === ratio(mine) && score.at > mine.at)) {
      assignments[key] = score;
    }
  }
  return { nickname: cur.nickname || inc.nickname, quiz, assignments };
}

export function applyBackup(backup: Backup, mode: ImportMode): ImportSummary {
  const summary: ImportSummary = {
    quiz: Object.values(backup.progress.quiz).reduce((n, a) => n + Object.keys(a).length, 0),
    assignments: Object.keys(backup.progress.assignments).length,
    code: 0,
  };

  if (mode === 'replace') {
    const old = Object.keys(localStorage).filter((k) => k.startsWith(CODE_PREFIX));
    old.forEach((k) => localStorage.removeItem(k));
  }
  for (const [key, saved] of Object.entries(backup.code)) {
    if (!saved || typeof saved.files !== 'object') continue;
    const mine = mode === 'merge' ? parseSavedCode(localStorage.getItem(CODE_PREFIX + key)) : null;
    if (mine && mine.at >= saved.at) continue; // 더 최근에 고친 쪽을 남김
    localStorage.setItem(CODE_PREFIX + key, JSON.stringify(saved));
    summary.code++;
  }

  set(mode === 'replace' ? backup.progress : mergeProgress(state, backup.progress));
  return summary;
}

// 옮기기 코드: 백업 JSON 을 압축해서 복사/붙여넣기 할 수 있는 한 줄 문자열로
const TRANSFER_PREFIX = 'FD1.';

async function pipeBytes(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const input = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const out = input.pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function bytesToBase64Url(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function encodeTransfer(backup: Backup): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(backup));
  return TRANSFER_PREFIX + bytesToBase64Url(await pipeBytes(json, new CompressionStream('deflate-raw')));
}

export async function decodeTransfer(code: string): Promise<Backup> {
  const trimmed = code.replace(/\s+/g, '');
  if (!trimmed.startsWith(TRANSFER_PREFIX)) throw new Error('옮기기 코드가 아닙니다. (FD1. 으로 시작해야 해요)');
  let json: string;
  try {
    const bytes = await pipeBytes(base64UrlToBytes(trimmed.slice(TRANSFER_PREFIX.length)), new DecompressionStream('deflate-raw'));
    json = new TextDecoder().decode(bytes);
  } catch {
    throw new Error('옮기기 코드가 잘렸거나 손상되었습니다. 전체를 다시 복사해 주세요.');
  }
  return parseBackup(JSON.parse(json));
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
