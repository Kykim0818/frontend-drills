import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyBackup,
  createBackup,
  decodeTransfer,
  encodeTransfer,
  loadCode,
  parseBackup,
  progress,
  saveCode,
  type Backup,
} from './progress';

const T = 'react-usereducer';

function backupWith(over: Partial<Backup['progress']>, code: Backup['code'] = {}): Backup {
  return {
    app: 'frontend-drills',
    v: 1,
    exportedAt: '2026-11-01T00:00:00.000Z',
    progress: { nickname: '', quiz: {}, assignments: {}, ...over },
    code,
  };
}

beforeEach(() => {
  localStorage.clear();
  progress.reset();
});

describe('백업 / 옮기기', () => {
  it('createBackup 은 진행 상황과 작성 중인 코드를 담는다', () => {
    progress.setNickname('kim');
    progress.setQuizAnswers(T, { 1: 1, 2: 0 });
    progress.recordAssignment(T, '01', 3, 11);
    saveCode(T, '01', { 'reducer.ts': 'my code' });

    const b = createBackup();
    expect(b.app).toBe('frontend-drills');
    expect(b.progress.nickname).toBe('kim');
    expect(b.progress.quiz[T]).toEqual({ 1: 1, 2: 0 });
    expect(b.progress.assignments[`${T}/01`].passed).toBe(3);
    expect(b.code[`${T}/01`].files).toEqual({ 'reducer.ts': 'my code' });
  });

  it('예전 형식(파일 객체만)으로 저장된 코드도 읽는다', () => {
    localStorage.setItem(`frontend-drills:code:v1:${T}/02`, JSON.stringify({ 'a.ts': 'old' }));
    expect(loadCode(T, '02')).toEqual({ 'a.ts': 'old' });
    expect(createBackup().code[`${T}/02`].files).toEqual({ 'a.ts': 'old' });
  });

  it('덮어쓰기: 기존 기록과 코드를 지우고 백업으로 바꾼다', () => {
    progress.recordAssignment(T, '01', 11, 11);
    saveCode(T, '01', { 'reducer.ts': 'mine' });
    saveCode(T, '05', { 'x.ts': 'only here' });

    applyBackup(
      backupWith({ assignments: { [`${T}/02`]: { passed: 1, total: 7, at: '2026-01-01' } } }, {
        [`${T}/01`]: { files: { 'reducer.ts': 'backup' }, at: '2020-01-01T00:00:00.000Z' },
      }),
      'replace',
    );

    expect(progress.get().assignments).toEqual({ [`${T}/02`]: { passed: 1, total: 7, at: '2026-01-01' } });
    expect(loadCode(T, '01')).toEqual({ 'reducer.ts': 'backup' });
    expect(loadCode(T, '05')).toBe(null);
  });

  it('합치기: 과제는 높은 점수, 퀴즈는 안 푼 문제만, 코드는 최근 것', () => {
    progress.setNickname('me');
    progress.setQuizAnswers(T, { 1: 2 });
    progress.recordAssignment(T, '01', 5, 11);
    progress.recordAssignment(T, '02', 7, 7);
    saveCode(T, '01', { 'reducer.ts': 'newer mine' }); // 지금 시각으로 저장됨
    saveCode(T, '03', { 'c.ts': 'older mine' });
    localStorage.setItem(
      `frontend-drills:code:v1:${T}/03`,
      JSON.stringify({ files: { 'c.ts': 'older mine' }, at: '2020-01-01T00:00:00.000Z' }),
    );

    const summary = applyBackup(
      backupWith(
        {
          nickname: 'other',
          quiz: { [T]: { 1: 0, 3: 1 } },
          assignments: {
            [`${T}/01`]: { passed: 9, total: 11, at: '2026-01-01' },
            [`${T}/02`]: { passed: 3, total: 7, at: '2026-01-01' },
            [`${T}/04`]: { passed: 6, total: 6, at: '2026-01-01' },
          },
        },
        {
          [`${T}/01`]: { files: { 'reducer.ts': 'older backup' }, at: '2021-01-01T00:00:00.000Z' },
          [`${T}/03`]: { files: { 'c.ts': 'newer backup' }, at: '2025-01-01T00:00:00.000Z' },
        },
      ),
      'merge',
    );

    const p = progress.get();
    expect(p.nickname).toBe('me');
    expect(p.quiz[T]).toEqual({ 1: 2, 3: 1 }); // Q1 은 이미 풀었으니 내 답 유지
    expect(p.assignments[`${T}/01`].passed).toBe(9); // 더 높은 점수
    expect(p.assignments[`${T}/02`].passed).toBe(7); // 내 점수가 더 높음
    expect(p.assignments[`${T}/04`].passed).toBe(6); // 새로 추가
    expect(loadCode(T, '01')).toEqual({ 'reducer.ts': 'newer mine' });
    expect(loadCode(T, '03')).toEqual({ 'c.ts': 'newer backup' });
    expect(summary.code).toBe(1);
  });

  it('옮기기 코드로 왕복해도 같은 내용', async () => {
    progress.setQuizAnswers(T, { 1: 1 });
    saveCode(T, '01', { 'reducer.ts': '한글 코드 ✅'.repeat(50) });
    const b = createBackup();
    const code = await encodeTransfer(b);
    expect(code.startsWith('FD1.')).toBe(true);
    expect(await decodeTransfer(`  ${code.slice(0, 20)}\n${code.slice(20)}  `)).toEqual(b);
  });

  it('잘못된 입력은 알기 쉬운 에러', async () => {
    expect(() => parseBackup({ foo: 1 })).toThrow('frontend-drills 백업이 아닙니다');
    expect(() => parseBackup({ app: 'frontend-drills', v: 2 })).toThrow('지원하지 않는 백업 버전');
    await expect(decodeTransfer('hello')).rejects.toThrow('옮기기 코드가 아닙니다');
    await expect(decodeTransfer('FD1.abc')).rejects.toThrow('잘렸거나 손상');
  });
});
