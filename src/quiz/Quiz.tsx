import { useReducer } from 'react';
import Md from '../Md';
import { questions, type Level } from './questions';
import { filterQuestions, initialQuizState, quizReducer } from './quizReducer';

const levels: (Level | '전체')[] = ['전체', '기초', '동작 원리', '함정', '설계', '심화'];

export default function Quiz() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
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
          <p className="tag">
            Q{q.id} · {q.level}
          </p>
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
