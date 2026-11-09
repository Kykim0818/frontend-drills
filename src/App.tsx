import { useEffect, useReducer } from 'react';
import AskButton from './shared/AskButton';
import { questionsListUrl } from './shared/ask';
import AssignmentPage from './shared/AssignmentPage';
import Md from './shared/Md';
import ProgressPage from './shared/ProgressPage';
import { useProgress } from './shared/progress';
import Quiz from './shared/quiz/Quiz';
import { parseHash, toHash, type Page } from './shared/route';
import { isCleared, quizScore } from './shared/score';
import SharePage from './shared/SharePage';
import { topics } from './topics';

type NavAction = { type: 'hash_changed'; hash: string };

// 네비게이션도 리듀서로 ✋ (주소의 #해시 가 바뀌면 페이지 state 를 다시 계산)
function navReducer(_state: Page, action: NavAction): Page {
  switch (action.type) {
    case 'hash_changed':
      return parseHash(action.hash);
  }
}

export default function App() {
  const [page, dispatch] = useReducer(navReducer, location.hash, parseHash);
  const p = useProgress();

  useEffect(() => {
    const onHash = () => {
      dispatch({ type: 'hash_changed', hash: location.hash });
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const topic = 'topicId' in page ? topics.find((t) => t.id === page.topicId) : undefined;
  const assignment = page.kind === 'assignment' && topic ? topic.assignments.find((a) => a.id === page.id) : undefined;
  const current = toHash(page);

  const link = (target: Page, label: string, extra?: string) => {
    const href = toHash(target);
    return (
      <a key={href} href={href} className={current === href ? 'active' : ''}>
        <span>{label}</span>
        {extra && <span className="nav-extra">{extra}</span>}
      </a>
    );
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>
          <a className="brand" href="#/">
            🏋️ frontend-drills
          </a>
        </h1>
        {link({ kind: 'progress' }, '📊 내 진행 상황 · 공유')}
        <a href={questionsListUrl} target="_blank" rel="noreferrer">
          <span>💬 질문 게시판</span>
          <span className="nav-extra">↗</span>
        </a>
        {topics.map((t) => {
          const q = quizScore(t, p);
          return (
            <div key={t.id} className="topic-nav">
              <p className="section">
                {t.emoji} {t.title}
              </p>
              {link({ kind: 'concepts', topicId: t.id }, '📘 핵심 개념')}
              {link({ kind: 'quiz', topicId: t.id }, '❓ 퀴즈', `${q.correct}/${q.total}`)}
              {t.assignments.map((a) =>
                link(
                  { kind: 'assignment', topicId: t.id, id: a.id },
                  `${a.id}. ${a.title}`,
                  isCleared(t, a.id, p) ? '✅' : p.assignments[`${t.id}/${a.id}`] ? '🟡' : '',
                ),
              )}
            </div>
          );
        })}
      </nav>
      <main className="content">
        {page.kind === 'home' && (
          <div className="readme">
            <h1>🏋️ frontend-drills</h1>
            <p>
              공식 문서를 바탕으로 만든 프론트엔드 <strong>퀴즈 + 과제</strong> 모음입니다. 설치 없이 이 페이지에서 바로
              풀 수 있어요.
            </p>
            <ol>
              <li>
                <strong>핵심 개념</strong>을 읽고
              </li>
              <li>
                <strong>퀴즈</strong>를 풀고 (해설 + 공식 문서 링크)
              </li>
              <li>
                <strong>과제</strong>는 화면 안의 코드 편집기에서 고친 뒤 <strong>▶ 채점하기</strong>
              </li>
              <li>
                <strong>📊 내 진행 상황</strong>에서 공유 링크로 점수 자랑하기
              </li>
            </ol>
            <div className="topic-grid">
              {topics.map((t) => {
                const q = quizScore(t, p);
                const cleared = t.assignments.filter((a) => isCleared(t, a.id, p)).length;
                return (
                  <a key={t.id} className="card topic-card" href={toHash({ kind: 'concepts', topicId: t.id })}>
                    <span className="topic-emoji">{t.emoji}</span>
                    <strong>{t.title}</strong>
                    <span className="muted">{t.description}</span>
                    <span className="tag">
                      퀴즈 {q.correct}/{q.total} · 과제 {cleared}/{t.assignments.length}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        {page.kind === 'progress' && <ProgressPage topics={topics} />}
        {page.kind === 'share' && <SharePage data={page.data} topics={topics} />}
        {page.kind === 'concepts' && topic && (
          <div className="readme">
            <div className="page-actions">
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
        {'topicId' in page && !topic && <p>존재하지 않는 페이지입니다. <a href="#/">홈으로</a></p>}
      </main>
    </div>
  );
}
