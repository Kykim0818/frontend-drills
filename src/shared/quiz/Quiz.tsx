import { useEffect, useReducer } from 'react';
import { progress } from '../progress';
import AskButton from '../AskButton';
import { codeBlock } from '../ask';
import Md from '../Md';
import type { Question } from '../types';
import { filterQuestions, initialQuizState, quizReducer } from './quizReducer';

type Props = { topicId: string; topicTitle: string; questions: Question[]; levels: string[] };

export default function Quiz({ topicId, topicTitle, questions, levels: topicLevels }: Props) {
  const levels = ['전체', ...topicLevels];
  // 저장된 답이 있으면 이어서 풀기 (init 함수로 첫 렌더링에만 읽음)
  const [state, dispatch] = useReducer(quizReducer, topicId, (id) => ({
    ...initialQuizState,
    answers: progress.get().quiz[id] ?? {},
  }));

  useEffect(() => {
    progress.setQuizAnswers(topicId, state.answers);
  }, [topicId, state.answers]);
  const list = filterQuestions(questions, state.level);
  const total = list.length;
  const answeredInList = list.filter((q) => q.id in state.answers);
  const correct = answeredInList.filter((q) => state.answers[q.id] === q.answer).length;
  const q = list[state.index];

  return (
    <div className="quiz">
      <div className="levels">
        {levels.map((lv) => (
          <button
            key={lv}
            className={lv === state.level ? 'chip active' : 'chip'}
            onClick={() => dispatch({ type: 'level_selected', level: lv })}
          >
            {lv}
          </button>
        ))}
      </div>

      <div className="progress">
        <div className="bar" style={{ width: `${(answeredInList.length / total) * 100}%` }} />
      </div>
      <p className="muted">
        {answeredInList.length}/{total} 풀이 · 정답 {correct}개
      </p>

      {q ? (
        <article className="card question">
          <div className="question-head">
            <p className="tag">
              Q{q.id} · {q.level}
            </p>
            <AskButton
              label="❓ 이 문제 질문하기"
              getContext={() => {
                const picked = state.answers[q.id];
                const lines = [
                  `### 문제 Q${q.id} (${q.level})`,
                  q.question,
                  q.code ? codeBlock(q.code, 'js') : '',
                  '### 보기',
                  ...q.choices.map((c, i) => `${i + 1}. ${c}${i === picked ? '  ← 내가 고른 답' : ''}`),
                  picked === undefined
                    ? '_(아직 답을 고르지 않음)_'
                    : `\n정답: ${q.answer + 1}번 / 내 답: ${picked + 1}번 ${picked === q.answer ? '✅' : '❌'}`,
                  `\n📖 ${q.docs.label}: ${q.docs.url}`,
                ];
                return {
                  where: `${topicTitle} › 퀴즈 Q${q.id}`,
                  short: `퀴즈 Q${q.id}`,
                  details: lines.filter(Boolean).join('\n'),
                  hash: `#/t/${topicId}/quiz`,
                };
              }}
            />
          </div>
          <div className="q-title">
            <Md>{q.question}</Md>
          </div>
          {q.code && (
            <pre>
              <code>{q.code}</code>
            </pre>
          )}
          <ol className="choices">
            {q.choices.map((c, i) => {
              const picked = state.answers[q.id];
              const done = picked !== undefined;
              let cls = 'choice';
              if (done && i === q.answer) cls += ' correct';
              else if (done && i === picked) cls += ' wrong';
              return (
                <li key={i}>
                  <button
                    className={cls}
                    disabled={done}
                    onClick={() => dispatch({ type: 'answered', questionId: q.id, choice: i })}
                  >
                    <span className="num">{i + 1}</span>
                    <Md>{c}</Md>
                  </button>
                </li>
              );
            })}
          </ol>
          {q.id in state.answers && (
            <div className={state.answers[q.id] === q.answer ? 'explain ok' : 'explain ng'}>
              <strong>{state.answers[q.id] === q.answer ? '✅ 정답!' : `❌ 오답 — 정답은 ${q.answer + 1}번`}</strong>
              <Md>{q.explanation}</Md>
              <a href={q.docs.url} target="_blank" rel="noreferrer">
                📖 {q.docs.label}
              </a>
            </div>
          )}
          <div className="row nav">
            <button disabled={state.index === 0} onClick={() => dispatch({ type: 'moved', delta: -1, total })}>
              ← 이전
            </button>
            <button onClick={() => dispatch({ type: 'moved', delta: 1, total })}>
              {state.index === total - 1 ? '결과 보기' : '다음 →'}
            </button>
          </div>
        </article>
      ) : (
        <article className="card">
          <h2>
            결과: {correct} / {total}
          </h2>
          <p>
            {correct === total
              ? '🎉 완벽합니다! 과제로 넘어가세요.'
              : '틀린 문제의 공식 문서 링크를 다시 읽어보고, 관련 과제를 풀어보세요.'}
          </p>
          <ul>
            {list
              .filter((x) => state.answers[x.id] !== x.answer)
              .map((x) => (
                <li key={x.id}>
                  Q{x.id}. <a href={x.docs.url} target="_blank" rel="noreferrer">{x.docs.label}</a>
                </li>
              ))}
          </ul>
          <div className="row">
            <button onClick={() => dispatch({ type: 'moved', delta: -1, total })}>← 돌아가기</button>
            <button onClick={() => dispatch({ type: 'restarted' })}>처음부터 다시</button>
          </div>
        </article>
      )}
    </div>
  );
}
