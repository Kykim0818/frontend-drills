import { cleanup } from '@testing-library/react';
import { collectTests, vi } from './testkit';

export type TestResult = { name: string; ok: boolean; error?: string; ms: number };

const TIMEOUT = 5000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${ms / 1000}초 안에 끝나지 않았습니다 (시간 초과)`)), ms);
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    );
  });
}

/** suite 를 등록하는 함수를 받아 모든 테스트를 순서대로 실행합니다. (현재 window/document 에서 실행) */
export async function runSuite(register: () => void): Promise<TestResult[]> {
  const tests = collectTests(register);
  const g = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  g.IS_REACT_ACT_ENVIRONMENT = true;
  const results: TestResult[] = [];
  for (const t of tests) {
    const start = performance.now();
    try {
      await withTimeout(Promise.resolve().then(t.fn), TIMEOUT);
      results.push({ name: t.name, ok: true, ms: performance.now() - start });
    } catch (e) {
      results.push({
        name: t.name,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        ms: performance.now() - start,
      });
    } finally {
      cleanup();
      vi.restoreAllMocks();
    }
  }
  g.IS_REACT_ACT_ENVIRONMENT = false;
  return results;
}
