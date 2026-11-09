import { useReducer } from 'react';
import AssignmentPage from './shared/AssignmentPage';
import Md from './shared/Md';
import Quiz from './shared/quiz/Quiz';
import { topics } from './topics';

type Page =
  | { kind: 'home' }
  | { kind: 'concepts'; topicId: string }
  | { kind: 'quiz'; topicId: string }
  | { kind: 'assignment'; topicId: string; id: string };

type NavAction = { type: 'navigated'; page: Page };

// 네비게이션도 리듀서로 ✋
function navReducer(_state: Page, action: NavAction): Page {
  switch (action.type) {
    case 'navigated':
      return action.page;
  }
}

function isActive(page: Page, target: Page) {
  return JSON.stringify(page) === JSON.stringify(target);
}

export default function App() {
  const [page, dispatch] = useReducer(navReducer, { kind: 'home' });
  const go = (p: Page) => dispatch({ type: 'navigated', page: p });
  const topic = page.kind === 'home' ? null : topics.find((t) => t.id === page.topicId)!;
  const assignment =
    page.kind === 'assignment' && topic ? topic.assignments.find((a) => a.id === page.id)! : null;

  const navButton = (target: Page, label: string) => (
    <button key={label} className={isActive(page, target) ? 'active' : ''} onClick={() => go(target)}>
      {label}
    </button>
  );

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>
          <button className="brand" onClick={() => go({ kind: 'home' })}>
            🏋️ frontend-drills
          </button>
        </h1>
        {topics.map((t) => (
          <div key={t.id} className="topic-nav">
            <p className="section">
              {t.emoji} {t.title}
            </p>
            {navButton({ kind: 'concepts', topicId: t.id }, '📘 핵심 개념')}
            {navButton({ kind: 'quiz', topicId: t.id }, `❓ 퀴즈 (${t.questions.length})`)}
            {t.assignments.map((a) =>
              navButton({ kind: 'assignment', topicId: t.id, id: a.id }, `${a.id}. ${a.title}`),
            )}
          </div>
        ))}
        <p className="muted small">
          <code>npm test</code> 로 내 과제를 채점하세요.
        </p>
      </nav>
      <main className="content">
        {page.kind === 'home' && (
          <div className="readme">
            <h1>🏋️ frontend-drills</h1>
            <p>
              공식 문서를 바탕으로 만든 프론트엔드 <strong>퀴즈 + 과제</strong> 모음입니다. 개념 정리 → 퀴즈 →
              과제(테스트로 자동 채점) 순서로 연습하세요.
            </p>
            <div className="topic-grid">
              {topics.map((t) => (
                <button key={t.id} className="card topic-card" onClick={() => go({ kind: 'concepts', topicId: t.id })}>
                  <span className="topic-emoji">{t.emoji}</span>
                  <strong>{t.title}</strong>
                  <span className="muted">{t.description}</span>
                  <span className="tag">
                    퀴즈 {t.questions.length}문제 · 과제 {t.assignments.length}개
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {page.kind === 'concepts' && topic && (
          <div className="readme">
            <Md>{topic.concepts}</Md>
          </div>
        )}
        {page.kind === 'quiz' && topic && (
          <Quiz key={topic.id} questions={topic.questions} levels={topic.levels} />
        )}
        {assignment && topic && (
          <AssignmentPage key={topic.id + assignment.id} topicId={topic.id} assignment={assignment} />
        )}
      </main>
    </div>
  );
}
