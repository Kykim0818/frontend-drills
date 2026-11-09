// 숨겨진 iframe 안에서 실행되는 채점 전용 엔트리. (src/shared/grader/gradeInIframe.ts 참고)
import { CompileError, loadModules } from './shared/grader/compile';
import type { RunRequest, RunResponse } from './shared/grader/protocol';
import { runSuite } from './shared/grader/runner';
import { topics } from './topics';

function snapshotStorage() {
  const saved = Object.entries(localStorage);
  // 테스트가 localStorage 를 비우거나 바꿔도 앱의 진행 상황(같은 origin)은 지켜지도록 복원
  return () => {
    localStorage.clear();
    for (const [k, v] of saved) localStorage.setItem(k, v);
  };
}

window.addEventListener('message', async (e: MessageEvent<RunRequest>) => {
  if (e.source !== window.parent || e.origin !== location.origin || e.data?.type !== 'run') return;
  const { id, topicId, assignmentId, files } = e.data;
  const reply = (r: Omit<RunResponse, 'type' | 'id'>) =>
    window.parent.postMessage({ type: 'result', id, ...r } satisfies RunResponse, location.origin);

  const assignment = topics.find((t) => t.id === topicId)?.assignments.find((a) => a.id === assignmentId);
  if (!assignment) return reply({ results: [], compileError: `과제를 찾을 수 없습니다: ${topicId}/${assignmentId}` });

  const restore = snapshotStorage();
  try {
    const modules = loadModules(files);
    const results = await runSuite(() => assignment.grade(modules));
    reply({ results });
  } catch (err) {
    reply({
      results: [],
      compileError: err instanceof CompileError ? err.message : `채점 준비 중 에러 — ${err instanceof Error ? err.message : String(err)}`,
    });
  } finally {
    restore();
  }
});

window.parent.postMessage({ type: 'ready' }, location.origin);
