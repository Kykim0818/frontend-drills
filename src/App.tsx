import { useReducer } from 'react';
import Md from './Md';
import AssignmentPage from './AssignmentPage';
import concepts from './content/concepts.md?raw';
import Quiz from './quiz/Quiz';
import { questions } from './quiz/questions';
import { assignments } from './registry';

type Page = { kind: 'concepts' } | { kind: 'quiz' } | { kind: 'assignment'; id: string };
type NavAction = { type: 'navigated'; page: Page };

// 네비게이션도 리듀서로 ✋
function navReducer(_state: Page, action: NavAction): Page {
  switch (action.type) {
    case 'navigated':
      return action.page;
  }
}

export default function App() {
  const [page, dispatch] = useReducer(navReducer, { kind: 'concepts' });
  const go = (p: Page) => dispatch({ type: 'navigated', page: p });
  const current = page.kind === 'assignment' ? assignments.find((a) => a.id === page.id)! : null;

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>useReducer 마스터하기</h1>
        <button className={page.kind === 'concepts' ? 'active' : ''} onClick={() => go({ kind: 'concepts' })}>
          📘 핵심 개념 정리
        </button>
        <button className={page.kind === 'quiz' ? 'active' : ''} onClick={() => go({ kind: 'quiz' })}>
          ❓ 퀴즈 ({questions.length}문제)
        </button>
        <p className="section">📝 과제</p>
        {assignments.map((a) => (
          <button
            key={a.id}
            className={current?.id === a.id ? 'active' : ''}
            onClick={() => go({ kind: 'assignment', id: a.id })}
          >
            {a.id}. {a.title}
          </button>
        ))}
        <p className="muted small">
          <code>npm test</code> 로 내 과제를 채점하세요.
        </p>
      </nav>
      <main className="content">
        {page.kind === 'concepts' && (
          <div className="readme">
            <Md>{concepts}</Md>
          </div>
        )}
        {page.kind === 'quiz' && <Quiz />}
        {current && <AssignmentPage key={current.id} assignment={current} />}
      </main>
    </div>
  );
}
