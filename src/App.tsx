import { useEffect, useReducer, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import AskButton from './shared/AskButton';
import { questionsListUrl } from './shared/ask';
import AssignmentPage from './shared/AssignmentPage';
import { ExternalIcon, SidebarIcon } from './shared/icons';
import Md from './shared/Md';
import ProgressPage from './shared/ProgressPage';
import { useProgress, type Progress } from './shared/progress';
import Quiz from './shared/quiz/Quiz';
import { parseHash, toHash, type Page } from './shared/route';
import { isCleared, quizScore } from './shared/score';
import SharePage from './shared/SharePage';
import ThemeToggle from './shared/ThemeToggle';
import type { Topic } from './shared/types';
import { MOBILE_QUERY, useMediaQuery } from './shared/useMediaQuery';
import { topics } from './topics';

type NavAction = { type: 'hash_changed'; hash: string };

// 네비게이션도 리듀서로 ✋ (주소의 #해시 가 바뀌면 페이지 state 를 다시 계산)
function navReducer(_state: Page, action: NavAction): Page {
  switch (action.type) {
    case 'hash_changed':
      return parseHash(action.hash);
  }
}

// ───────────────────────── 사이드바 ─────────────────────────

type Status = 'done' | 'progress' | 'todo';

function StatusDot({ status }: { status: Status }) {
  const label = { done: '완료', progress: '진행 중', todo: '시작 전' }[status];
  return <span className={`status-dot is-${status}`} role="img" aria-label={label} title={label} />;
}

function Sidebar({ current, p }: { current: string; p: Progress }) {
  const item = (target: Page, label: string, opts: { status?: Status; extra?: string } = {}) => {
    const href = toHash(target);
    return (
      <a key={href} href={href} className="nav-item" aria-current={current === href ? 'page' : undefined}>
        {opts.status && <StatusDot status={opts.status} />}
        <span className="nav-label">{label}</span>
        {opts.extra && <span className="nav-extra">{opts.extra}</span>}
      </a>
    );
  };

  return (
    <nav className="sidebar" aria-label="메뉴">
      <div className="nav-group">
        {item({ kind: 'home' }, '홈')}
        {item({ kind: 'progress' }, '내 진행 상황 · 공유')}
        <a className="nav-item" href={questionsListUrl} target="_blank" rel="noreferrer">
          <span className="nav-label">질문 게시판</span>
          <span className="nav-extra">
            <ExternalIcon />
          </span>
        </a>
      </div>
      {topics.map((t) => {
        const q = quizScore(t, p);
        const cleared = t.assignments.filter((a) => isCleared(t, a.id, p)).length;
        const pct = Math.round(((q.correct + cleared) / (q.total + t.assignments.length)) * 100);
        return (
          <div key={t.id} className="nav-group">
            <div className="nav-heading">
              <span>
                {t.emoji} {t.title}
              </span>
              <span className="nav-extra">{pct}%</span>
            </div>
            <div className="meter" aria-hidden>
              <span style={{ width: `${pct}%` }} />
            </div>
            {item({ kind: 'concepts', topicId: t.id }, '핵심 개념')}
            {item({ kind: 'quiz', topicId: t.id }, '퀴즈', { extra: `${q.correct}/${q.total}` })}
            <div className="nav-subheading">과제</div>
            {t.assignments.map((a) => {
              const status: Status = isCleared(t, a.id, p) ? 'done' : p.assignments[`${t.id}/${a.id}`] ? 'progress' : 'todo';
              return item({ kind: 'assignment', topicId: t.id, id: a.id }, `${a.id}. ${a.title}`, { status });
            })}
          </div>
        );
      })}
    </nav>
  );
}

// ───────────────────────── 페이지 본문 ─────────────────────────

function Home({ p }: { p: Progress }) {
  return (
    <div className="page prose">
      <p className="eyebrow">frontend-drills</p>
      <h1>공식 문서로 배우는 프론트엔드 연습장</h1>
      <p className="lead">
        개념을 읽고, 퀴즈로 확인하고, 과제를 직접 고쳐서 채점까지. 설치 없이 이 페이지에서 바로 풀 수 있어요.
      </p>
      <ol className="steps">
        <li>
          <strong>핵심 개념</strong> 읽기
        </li>
        <li>
          <strong>퀴즈</strong> 풀기 — 해설과 공식 문서 링크
        </li>
        <li>
          <strong>과제</strong> — 편집기에서 고치고 <kbd>▶ 채점하기</kbd>
        </li>
        <li>
          막히면 <strong>❓ 질문하기</strong>, 다 풀면 <strong>공유 링크</strong>로 자랑하기
        </li>
      </ol>
      <div className="topic-grid not-prose">
        {topics.map((t) => (
          <TopicCard key={t.id} topic={t} p={p} />
        ))}
      </div>
    </div>
  );
}

function TopicCard({ topic: t, p }: { topic: Topic; p: Progress }) {
  const q = quizScore(t, p);
  const cleared = t.assignments.filter((a) => isCleared(t, a.id, p)).length;
  return (
    <a className="card topic-card" href={toHash({ kind: 'concepts', topicId: t.id })}>
      <span className="topic-emoji" aria-hidden>
        {t.emoji}
      </span>
      <strong>{t.title}</strong>
      <span className="muted">{t.description}</span>
      <span className="topic-stats">
        <span>
          퀴즈 <b>{q.correct}</b>/{q.total}
        </span>
        <span>
          과제 <b>{cleared}</b>/{t.assignments.length}
        </span>
      </span>
    </a>
  );
}

function crumbs(page: Page, topic?: Topic) {
  const parts: string[] = [];
  if (topic) parts.push(topic.title);
  if (page.kind === 'concepts') parts.push('핵심 개념');
  if (page.kind === 'quiz') parts.push('퀴즈');
  if (page.kind === 'assignment' && topic) {
    const a = topic.assignments.find((x) => x.id === page.id);
    if (a) parts.push(`과제 ${a.id}. ${a.title}`);
  }
  if (page.kind === 'progress') parts.push('내 진행 상황');
  if (page.kind === 'share') parts.push('공유된 기록');
  return parts;
}

// ───────────────────────── 앱 ─────────────────────────

export default function App() {
  const [page, dispatch] = useReducer(navReducer, location.hash, parseHash);
  const p = useProgress();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onHash = () => {
      dispatch({ type: 'hash_changed', hash: location.hash });
      setDrawerOpen(false);
      mainRef.current?.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Ctrl/Cmd + B 로 사이드바 토글
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const topic = 'topicId' in page ? topics.find((t) => t.id === page.topicId) : undefined;
  const assignment = page.kind === 'assignment' && topic ? topic.assignments.find((a) => a.id === page.id) : undefined;
  const current = toHash(page);

  function toggleSidebar() {
    if (isMobile) return setDrawerOpen((o) => !o);
    const panel = sidebarRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  const toggleSidebarRef = useRef(toggleSidebar);
  useEffect(() => {
    toggleSidebarRef.current = toggleSidebar;
  });

  const content = (
    <main ref={mainRef} className={assignment ? 'main main-full' : 'main'} id="main">
      {page.kind === 'home' && <Home p={p} />}
      {page.kind === 'progress' && <ProgressPage topics={topics} />}
      {page.kind === 'share' && <SharePage data={page.data} topics={topics} />}
      {page.kind === 'concepts' && topic && (
        <div className="page prose">
          <div className="page-actions not-prose">
            <AskButton
              label="❓ 개념 질문하기"
              getContext={() => ({
                where: `${topic.title} › 핵심 개념`,
                short: `${topic.title} 개념`,
                details: '(질문하려는 부분을 위 질문 칸에 인용해 주세요)',
                hash: `#/t/${topic.id}`,
              })}
            />
          </div>
          <Md>{topic.concepts}</Md>
        </div>
      )}
      {page.kind === 'quiz' && topic && (
        <Quiz key={topic.id} topicId={topic.id} topicTitle={topic.title} questions={topic.questions} levels={topic.levels} />
      )}
      {assignment && topic && (
        <AssignmentPage key={topic.id + assignment.id} topicId={topic.id} topicTitle={topic.title} assignment={assignment} />
      )}
      {'topicId' in page && !topic && (
        <div className="page prose">
          <p>
            존재하지 않는 페이지입니다. <a href="#/">홈으로</a>
          </p>
        </div>
      )}
    </main>
  );

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="topbar">
        <button
          type="button"
          className="icon-button"
          onClick={toggleSidebar}
          aria-label={isMobile ? '메뉴 열기' : sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={isMobile ? drawerOpen : !sidebarCollapsed}
          title="사이드바 (Ctrl+B)"
        >
          <SidebarIcon />
        </button>
        <a className="brand" href="#/">
          <span aria-hidden>🏋️</span> frontend-drills
        </a>
        <ol className="crumbs" aria-label="현재 위치">
          {crumbs(page, topic).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
        <span className="spacer" />
        <ThemeToggle />
      </header>

      {isMobile ? (
        <div className="body">
          {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}
          <div className={drawerOpen ? 'drawer open' : 'drawer'}>
            <Sidebar current={current} p={p} />
          </div>
          {content}
        </div>
      ) : (
        <PanelGroup direction="horizontal" autoSaveId="fd:shell" className="body">
          <Panel
            ref={sidebarRef}
            id="sidebar"
            order={1}
            defaultSize={19}
            minSize={13}
            maxSize={32}
            collapsible
            collapsedSize={0}
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
          >
            <Sidebar current={current} p={p} />
          </Panel>
          <PanelResizeHandle className="resize-handle vertical" hitAreaMargins={{ coarse: 12, fine: 6 }} />
          <Panel id="content" order={2} minSize={50}>
            {content}
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
