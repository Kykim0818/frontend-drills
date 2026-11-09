import type { SourceFiles } from './compile';
import type { GradeOutcome, RunRequest, RunResponse } from './protocol';

let seq = 0;

/**
 * 채점은 숨겨진 iframe(grader.html) 안에서 실행합니다.
 * 테스트의 screen.getByRole(...) 같은 쿼리가 앱 화면(미리보기, 사이드바 버튼 등)과 섞이지 않게 하기 위해서입니다.
 * 매번 새 iframe 을 만들어 이전 실행의 상태가 남지 않게 합니다.
 */
export function gradeInIframe(topicId: string, assignmentId: string, files: SourceFiles): Promise<GradeOutcome> {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const iframe = document.createElement('iframe');
    iframe.src = `${import.meta.env.BASE_URL}grader.html`;
    iframe.title = 'grader';
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '1024px',
      height: '768px',
      border: '0',
    });

    const timer = setTimeout(() => finish(() => reject(new Error('채점 시간이 초과되었습니다 (60초).'))), 60_000);

    function finish(cb: () => void) {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      iframe.remove();
      cb();
    }

    function onMessage(e: MessageEvent) {
      if (e.source !== iframe.contentWindow || e.origin !== location.origin) return;
      const msg = e.data as { type: string };
      if (msg.type === 'ready') {
        const req: RunRequest = { type: 'run', id, topicId, assignmentId, files };
        iframe.contentWindow!.postMessage(req, location.origin);
      } else if (msg.type === 'result' && (msg as RunResponse).id === id) {
        const { results, compileError } = msg as RunResponse;
        finish(() => resolve({ results, compileError }));
      }
    }

    window.addEventListener('message', onMessage);
    document.body.appendChild(iframe);
  });
}
