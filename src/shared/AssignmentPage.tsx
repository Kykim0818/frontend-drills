import { Component, useEffect, useMemo, useReducer, useState, type ComponentType, type ReactNode } from 'react';
import AskButton from './AskButton';
import { codeBlock, type AskContext } from './ask';
import CodeEditor from './CodeEditor';
import { loadModules, type SourceFiles } from './grader/compile';
import { gradeInIframe } from './grader/gradeInIframe';
import type { GradeOutcome } from './grader/protocol';
import Md from './Md';
import { loadCode, progress, saveCode, useProgress } from './progress';
import type { Assignment } from './types';

// ───────────────────────── 화면 상태 (역시 useReducer) ─────────────────────────

type State = {
  files: SourceFiles; // 내 코드
  activeFile: string;
  view: 'mine' | 'solution';
  grading: boolean;
  outcome: GradeOutcome | null;
  error: string | null;
};

type Action =
  | { type: 'file_selected'; file: string }
  | { type: 'code_edited'; file: string; code: string }
  | { type: 'code_reset'; files: SourceFiles }
  | { type: 'view_changed'; view: State['view'] }
  | { type: 'grading_started' }
  | { type: 'grading_finished'; outcome: GradeOutcome }
  | { type: 'grading_failed'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'file_selected':
      return { ...state, activeFile: action.file };
    case 'code_edited':
      return { ...state, files: { ...state.files, [action.file]: action.code } };
    case 'code_reset':
      return { ...state, files: action.files, outcome: null, error: null };
    case 'view_changed':
      return { ...state, view: action.view };
    case 'grading_started':
      return { ...state, grading: true, error: null };
    case 'grading_finished':
      return { ...state, grading: false, outcome: action.outcome };
    case 'grading_failed':
      return { ...state, grading: false, error: action.error };
    default:
      throw Error('Unknown action: ' + (action as { type: string }).type);
  }
}

function init({ topicId, assignment }: { topicId: string; assignment: Assignment }): State {
  const saved = loadCode(topicId, assignment.id);
  // 저장된 코드가 있으면 이어서. 시작 코드에 새 파일이 추가된 경우를 대비해 병합
  const files = saved ? { ...assignment.files, ...pick(saved, Object.keys(assignment.files)) } : assignment.files;
  return {
    files,
    activeFile: Object.keys(assignment.files)[0],
    view: 'mine',
    grading: false,
    outcome: null,
    error: null,
  };
}

function pick(obj: Record<string, string>, keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => keys.includes(k)));
}

// ───────────────────────── 미리보기 ─────────────────────────

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="explain ng">
          <strong>렌더링 중 에러</strong>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    return this.props.children;
  }
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Preview({ files, entry }: { files: SourceFiles; entry: string }) {
  const debounced = useDebounced(files, 500);
  const compiled = useMemo(() => {
    try {
      const modules = loadModules(debounced);
      const Comp = modules[entry]?.default as ComponentType | undefined;
      if (typeof Comp !== 'function') return { error: `${entry} 파일에 default export 컴포넌트가 없습니다.` };
      return { Comp };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [debounced, entry]);
  const [version, setVersion] = useState(0);
  // 코드가 바뀔 때마다 새로 마운트 (이전 state 가 남지 않게)
  useEffect(() => setVersion((v) => v + 1), [compiled]);

  if ('error' in compiled) {
    return (
      <div className="explain ng">
        <strong>컴파일 에러</strong>
        <pre>{compiled.error}</pre>
      </div>
    );
  }
  const { Comp } = compiled;
  return (
    <Boundary key={version}>
      <Comp />
    </Boundary>
  );
}

// ───────────────────────── 채점 결과 ─────────────────────────

function Results({ state }: { state: State }) {
  if (state.grading) return <p className="muted">⏳ 채점 중... (테스트를 실행하고 있어요)</p>;
  if (state.error)
    return (
      <div className="explain ng">
        <pre>{state.error}</pre>
      </div>
    );
  const o = state.outcome;
  if (!o) return <p className="muted">코드를 고친 뒤 <strong>▶ 채점하기</strong>를 눌러보세요.</p>;
  if (o.compileError)
    return (
      <div className="explain ng">
        <strong>컴파일 에러</strong>
        <pre>{o.compileError}</pre>
      </div>
    );
  const passed = o.results.filter((r) => r.ok).length;
  const all = passed === o.results.length;
  return (
    <div>
      <p className={all ? 'score ok' : 'score'}>
        {all ? '🎉 모두 통과!' : '진행 중'} — {passed} / {o.results.length}
      </p>
      <ul className="results">
        {o.results.map((r) => (
          <li key={r.name} className={r.ok ? 'pass' : 'fail'}>
            <span>{r.ok ? '✅' : '❌'}</span>
            <div>
              <div>{r.name}</div>
              {r.error && <pre>{r.error}</pre>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───────────────────────── 페이지 ─────────────────────────

type PageProps = { topicId: string; topicTitle: string; assignment: Assignment };

export default function AssignmentPage({ topicId, topicTitle, assignment }: PageProps) {
  const [state, dispatch] = useReducer(reducer, { topicId, assignment }, init);
  const p = useProgress();
  const best = p.assignments[`${topicId}/${assignment.id}`];
  const showingSolution = state.view === 'solution';
  const visibleFiles = showingSolution ? assignment.solutionFiles : state.files;

  // 작성 중인 코드는 자동 저장
  useEffect(() => {
    const changed = Object.keys(state.files).some((f) => state.files[f] !== assignment.files[f]);
    saveCode(topicId, assignment.id, changed ? state.files : null);
  }, [state.files, topicId, assignment]);

  async function handleGrade() {
    dispatch({ type: 'grading_started' });
    try {
      const outcome = await gradeInIframe(topicId, assignment.id, state.files);
      dispatch({ type: 'grading_finished', outcome });
      if (!outcome.compileError && outcome.results.length > 0) {
        const passed = outcome.results.filter((r) => r.ok).length;
        progress.recordAssignment(topicId, assignment.id, passed, outcome.results.length);
      }
    } catch (e) {
      dispatch({ type: 'grading_failed', error: e instanceof Error ? e.message : String(e) });
    }
  }

  function askContext(): AskContext {
    const changed = Object.keys(state.files).filter((f) => state.files[f] !== assignment.files[f]);
    const o = state.outcome;
    const lines: string[] = [];
    if (o?.compileError) {
      lines.push('### 컴파일 에러', codeBlock(o.compileError, 'text'));
    } else if (o) {
      const failed = o.results.filter((r) => !r.ok);
      lines.push(`### 마지막 채점: ${o.results.length - failed.length} / ${o.results.length} 통과`);
      for (const r of failed) lines.push(`- ❌ ${r.name}`, r.error ? codeBlock(r.error, 'text') : '');
    } else {
      lines.push('_(아직 채점하지 않음)_');
    }
    // 지금 보고 있는 파일을 먼저, 그다음 고친 파일들
    const files = [state.activeFile, ...changed.filter((f) => f !== state.activeFile)];
    lines.push('### 내 코드');
    for (const f of files) {
      lines.push(`**${f}**${changed.includes(f) ? '' : ' (시작 코드 그대로)'}`, codeBlock(state.files[f] ?? ''));
    }
    return {
      where: `${topicTitle} › 과제 ${assignment.id}. ${assignment.title}`,
      short: `과제 ${assignment.id}`,
      details: lines.filter(Boolean).join('\n'),
      hash: `#/t/${topicId}/a/${assignment.id}`,
    };
  }

  function handleReset() {
    if (confirm('작성한 코드를 지우고 시작 코드로 되돌릴까요?')) {
      dispatch({ type: 'code_reset', files: assignment.files });
    }
  }

  return (
    <div className="assignment">
      <div className="readme">
        {best && (
          <p className={best.passed === best.total ? 'badge ok' : 'badge'}>
            최고 점수 {best.passed} / {best.total}
          </p>
        )}
        <Md>{assignment.readme}</Md>
      </div>

      <div className="workbench">
        <div className="card editor-card">
          <div className="file-tabs" role="tablist">
            {Object.keys(visibleFiles).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={state.activeFile === f}
                className={state.activeFile === f ? 'active' : ''}
                onClick={() => dispatch({ type: 'file_selected', file: f })}
              >
                {f}
              </button>
            ))}
          </div>
          <CodeEditor
            key={state.view + state.activeFile}
            label={state.activeFile}
            value={visibleFiles[state.activeFile] ?? ''}
            readOnly={showingSolution}
            onChange={(code) => dispatch({ type: 'code_edited', file: state.activeFile, code })}
          />
          <div className="row toolbar">
            <button className="primary" disabled={state.grading || showingSolution} onClick={handleGrade}>
              ▶ 채점하기
            </button>
            <button disabled={showingSolution} onClick={handleReset}>
              ↺ 시작 코드로
            </button>
            <AskButton getContext={askContext} />
            <label className="toggle-inline">
              <input
                type="checkbox"
                checked={showingSolution}
                onChange={(e) => dispatch({ type: 'view_changed', view: e.target.checked ? 'solution' : 'mine' })}
              />{' '}
              💡 정답 코드 보기 (읽기 전용)
            </label>
          </div>
        </div>

        {!showingSolution && (
          <section className="card">
            <h3>채점 결과</h3>
            <Results state={state} />
          </section>
        )}

        <section className="card">
          <h3>{showingSolution ? '정답 코드 미리보기' : '내 코드 미리보기'}</h3>
          <Preview files={visibleFiles} entry={assignment.entry} />
        </section>
      </div>
    </div>
  );
}
