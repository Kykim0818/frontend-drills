import { Component, useEffect, useMemo, useReducer, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels';
import {
  BookIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronUpIcon,
  MaximizeIcon,
  MinimizeIcon,
  ResetIcon,
} from './icons';
import { MOBILE_QUERY, useMediaQuery } from './useMediaQuery';
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
  outputTab: 'results' | 'preview';
  grading: boolean;
  outcome: GradeOutcome | null;
  error: string | null;
};

type Action =
  | { type: 'file_selected'; file: string }
  | { type: 'code_edited'; file: string; code: string }
  | { type: 'code_reset'; files: SourceFiles }
  | { type: 'view_changed'; view: State['view'] }
  | { type: 'output_tab_changed'; tab: State['outputTab'] }
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
      // 정답 보기에서는 채점 결과 대신 미리보기를 보여줌
      return { ...state, view: action.view, outputTab: action.view === 'solution' ? 'preview' : state.outputTab };
    case 'output_tab_changed':
      return { ...state, outputTab: action.tab };
    case 'grading_started':
      return { ...state, grading: true, error: null, outputTab: 'results' };
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
    outputTab: 'preview',
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
  if (state.grading)
    return (
      <p className="muted" role="status">
        <span className="spinner" aria-hidden /> 채점 중… 테스트를 실행하고 있어요
      </p>
    );
  if (state.error)
    return (
      <div className="explain ng">
        <pre>{state.error}</pre>
      </div>
    );
  const o = state.outcome;
  if (!o)
    return (
      <p className="muted empty">
        코드를 고친 뒤 <kbd>▶ 채점하기</kbd>를 누르면 여기에 테스트 결과가 나와요.
      </p>
    );
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
      <div className={all ? 'score ok' : 'score'} role="status">
        <span>{all ? '🎉 모두 통과!' : '아직 통과하지 못한 테스트가 있어요'}</span>
        <span className="score-num">
          {passed} / {o.results.length}
        </span>
      </div>
      <div className="meter score-meter" aria-hidden>
        <span style={{ width: `${(passed / o.results.length) * 100}%` }} />
      </div>
      <ul className="results">
        {/* 실패한 테스트를 먼저 */}
        {[...o.results]
          .sort((a, b) => Number(a.ok) - Number(b.ok))
          .map((r) => (
            <li key={r.name} className={r.ok ? 'pass' : 'fail'}>
              <span className="result-icon" aria-label={r.ok ? '통과' : '실패'}>
                {r.ok ? '✓' : '✕'}
              </span>
              <div>
                <div className="result-name">{r.name}</div>
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
    if (outputRef.current?.isCollapsed()) outputRef.current.expand();
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

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const outerRef = useRef<ImperativePanelGroupHandle>(null);
  const innerRef = useRef<ImperativePanelGroupHandle>(null);
  const readmeRef = useRef<ImperativePanelHandle>(null);
  const outputRef = useRef<ImperativePanelHandle>(null);
  const beforeMaximize = useRef<number[] | null>(null);
  const [readmeCollapsed, setReadmeCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const [outputSize, setOutputSize] = useState<number>(LAYOUT.inner[1]);
  const outputMaximized = !outputCollapsed && outputSize >= OUTPUT_MAX - 0.5;
  const passedNow = state.outcome && !state.outcome.compileError ? state.outcome.results.filter((r) => r.ok).length : null;

  function resetLayout() {
    beforeMaximize.current = null;
    outerRef.current?.setLayout(LAYOUT.outer);
    innerRef.current?.setLayout(LAYOUT.inner);
  }

  function toggleReadme() {
    const panel = readmeRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  function toggleOutput() {
    const panel = outputRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  function toggleMaximizeOutput() {
    const group = innerRef.current;
    if (!group) return;
    if (outputMaximized) {
      group.setLayout(beforeMaximize.current ?? LAYOUT.inner);
      beforeMaximize.current = null;
    } else {
      const now = group.getLayout();
      // 접혀 있던 상태에서 최대화했다가 되돌리면 적당한 크기로 돌아오게
      beforeMaximize.current = outputRef.current?.isCollapsed() ? LAYOUT.inner : now;
      group.setLayout([100 - OUTPUT_MAX, OUTPUT_MAX]);
    }
  }

  function selectOutputTab(tab: State['outputTab']) {
    dispatch({ type: 'output_tab_changed', tab });
    if (outputRef.current?.isCollapsed()) outputRef.current.expand();
  }

  const readme = (
    <section className="pane readme-pane" aria-label="과제 설명">
      {!isMobile && (
        <div className="pane-header pane-title">
          <span className="pane-title-text">
            <BookIcon size={14} /> 과제 설명
          </span>
          <button className="icon-button" onClick={toggleReadme} title="설명 접기" aria-label="설명 접기">
            <ChevronsLeftIcon size={15} />
          </button>
        </div>
      )}
      <div className="pane-scroll">
        <div className="page prose assignment-readme">
          {best && (
            <p className={best.passed === best.total ? 'badge ok not-prose' : 'badge not-prose'}>
              최고 점수 {best.passed} / {best.total}
            </p>
          )}
          <Md>{assignment.readme}</Md>
        </div>
      </div>
    </section>
  );

  const editor = (
    <section className="pane editor-pane" aria-label="코드 편집기">
      <div className="pane-header">
        {readmeCollapsed && (
          <button className="rail-button" onClick={toggleReadme} title="과제 설명 펼치기" aria-label="과제 설명 펼치기">
            <BookIcon size={14} /> 설명
          </button>
        )}
        <div className="file-tabs" role="tablist" aria-label="파일">
          {Object.keys(visibleFiles).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={state.activeFile === f}
              onClick={() => dispatch({ type: 'file_selected', file: f })}
            >
              {f}
              {!showingSolution && state.files[f] !== assignment.files[f] && (
                <span className="dirty" aria-label="수정됨" title="수정됨" />
              )}
            </button>
          ))}
        </div>
        <label className="switch" title="모범 답안을 읽기 전용으로 봅니다">
          <input
            type="checkbox"
            role="switch"
            checked={showingSolution}
            onChange={(e) => dispatch({ type: 'view_changed', view: e.target.checked ? 'solution' : 'mine' })}
          />
          <span className="switch-track" aria-hidden />
          정답 보기
        </label>
      </div>
      {showingSolution && <div className="solution-banner">💡 모범 답안 (읽기 전용) — 내 코드는 그대로 있어요</div>}
      <div className="editor-host">
        <CodeEditor
          key={state.view + state.activeFile}
          label={state.activeFile}
          value={visibleFiles[state.activeFile] ?? ''}
          readOnly={showingSolution}
          onChange={(code) => dispatch({ type: 'code_edited', file: state.activeFile, code })}
        />
      </div>
      <div className="pane-footer">
        <button className="primary" disabled={state.grading || showingSolution} onClick={handleGrade}>
          ▶ 채점하기
        </button>
        <button disabled={showingSolution} onClick={handleReset}>
          ↺ 시작 코드로
        </button>
        <AskButton getContext={askContext} />
        <span className="spacer" />
        {!isMobile && (
          <button className="icon-button" onClick={resetLayout} title="패널 크기 초기화" aria-label="패널 크기 초기화">
            <ResetIcon size={15} />
          </button>
        )}
      </div>
    </section>
  );

  const outputBar = (
    <div className="pane-header output-bar">
      <div className="file-tabs sans" role="tablist" aria-label="결과 보기">
        {!showingSolution && (
          <button
            role="tab"
            aria-selected={!outputCollapsed && state.outputTab === 'results'}
            onClick={() => selectOutputTab('results')}
          >
            채점 결과
            {passedNow !== null && (
              <span className={passedNow === state.outcome!.results.length ? 'pill ok' : 'pill'}>
                {passedNow}/{state.outcome!.results.length}
              </span>
            )}
          </button>
        )}
        <button
          role="tab"
          aria-selected={!outputCollapsed && state.outputTab === 'preview'}
          onClick={() => selectOutputTab('preview')}
        >
          {showingSolution ? '정답 미리보기' : '미리보기'}
        </button>
      </div>
      {!isMobile && (
        <div className="pane-tools">
          <button
            className="icon-button"
            onClick={toggleMaximizeOutput}
            title={outputMaximized ? '결과 영역 원래 크기로' : '결과 영역 크게 보기'}
            aria-label={outputMaximized ? '결과 영역 원래 크기로' : '결과 영역 크게 보기'}
          >
            {outputMaximized ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
          </button>
          <button
            className="icon-button"
            onClick={toggleOutput}
            title={outputCollapsed ? '결과 영역 펼치기' : '결과 영역 접기'}
            aria-label={outputCollapsed ? '결과 영역 펼치기' : '결과 영역 접기'}
            aria-expanded={!outputCollapsed}
          >
            {outputCollapsed ? <ChevronUpIcon size={15} /> : <ChevronDownIcon size={15} />}
          </button>
        </div>
      )}
    </div>
  );

  const outputBody = (
    <section className="pane output-pane" aria-label="결과">
      <div className="pane-body">
        {state.outputTab === 'results' && !showingSolution ? (
          <Results state={state} />
        ) : (
          <div className="preview-frame">
            <Preview files={visibleFiles} entry={assignment.entry} />
          </div>
        )}
      </div>
    </section>
  );

  if (isMobile) {
    return (
      <div className="assignment-stack">
        {readme}
        {editor}
        {outputBar}
        {outputBody}
      </div>
    );
  }

  return (
    <PanelGroup ref={outerRef} direction="horizontal" autoSaveId="fd:assignment" className="assignment-layout">
      <Panel
        ref={readmeRef}
        id="readme"
        order={1}
        defaultSize={LAYOUT.outer[0]}
        minSize={20}
        collapsible
        collapsedSize={0}
        onCollapse={() => setReadmeCollapsed(true)}
        onExpand={() => setReadmeCollapsed(false)}
      >
        {readme}
      </Panel>
      <PanelResizeHandle className="resize-handle vertical" />
      <Panel id="workbench" order={2} defaultSize={LAYOUT.outer[1]} minSize={35}>
        <PanelGroup ref={innerRef} direction="vertical" autoSaveId="fd:workbench">
          <Panel id="editor" order={1} defaultSize={LAYOUT.inner[0]} minSize={25}>
            {editor}
          </Panel>
          <PanelResizeHandle className="resize-handle horizontal" />
          {/* 결과 탭 막대는 패널 밖에 둬서, 결과 영역을 접어도 항상 보이게 */}
          {outputBar}
          <Panel
            ref={outputRef}
            id="output"
            order={2}
            defaultSize={LAYOUT.inner[1]}
            minSize={10}
            collapsible
            collapsedSize={0}
            onCollapse={() => setOutputCollapsed(true)}
            onExpand={() => setOutputCollapsed(false)}
            onResize={(size) => setOutputSize(size)}
          >
            {outputBody}
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

const LAYOUT = { outer: [40, 60], inner: [60, 40] };
/** 결과 영역 '크게 보기' 때 비율 (편집기 최소 크기 25% 를 남김) */
const OUTPUT_MAX = 75;
