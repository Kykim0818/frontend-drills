import { useState } from 'react';
import { encodeShare, progress, useProgress } from './progress';
import { assignmentScore, buildShareData, quizScore } from './score';
import type { Topic } from './types';

export default function ProgressPage({ topics }: { topics: Topic[] }) {
  const p = useProgress();
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}${location.pathname}#/share/${encodeShare(buildShareData(topics, p))}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('아래 링크를 복사하세요', url);
    }
  }

  return (
    <div className="readme">
      <h1>📊 내 진행 상황</h1>
      <p className="muted">
        진행 상황과 작성한 코드는 <strong>이 브라우저에만</strong> 저장됩니다. 다른 사람에게 보여주려면 공유 링크를 보내세요.
      </p>

      <section className="card">
        <h3>🔗 점수 공유하기</h3>
        <div className="row">
          <label>
            닉네임{' '}
            <input value={p.nickname} placeholder="익명" onChange={(e) => progress.setNickname(e.target.value)} />
          </label>
          <button className="primary" onClick={copy}>
            {copied ? '✅ 복사됨!' : '공유 링크 복사'}
          </button>
          <a href={url} target="_blank" rel="noreferrer">
            미리보기 ↗
          </a>
        </div>
        <p className="muted small-text">링크에는 점수만 들어 있고, 작성한 코드는 포함되지 않습니다.</p>
      </section>

      {topics.map((t) => {
        const q = quizScore(t, p);
        return (
          <section key={t.id} className="card">
            <h3>
              {t.emoji} {t.title}
            </h3>
            <p>
              퀴즈: <strong>{q.correct}</strong> / {q.total} 정답 <span className="muted">({q.answered}문제 풂)</span>
            </p>
            <table>
              <thead>
                <tr>
                  <th>과제</th>
                  <th>최고 점수</th>
                  <th>마지막 채점</th>
                </tr>
              </thead>
              <tbody>
                {t.assignments.map((a) => {
                  const s = assignmentScore(t, a.id, p);
                  return (
                    <tr key={a.id}>
                      <td>
                        <a href={`#/t/${t.id}/a/${a.id}`}>
                          {a.id}. {a.title}
                        </a>
                      </td>
                      <td>{s ? `${s.passed === s.total ? '✅ ' : ''}${s.passed} / ${s.total}` : '—'}</td>
                      <td className="muted">{s ? new Date(s.at).toLocaleString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}

      <button
        className="danger"
        onClick={() => {
          if (confirm('퀴즈 답과 과제 점수를 모두 지울까요? (작성한 코드는 과제 화면의 "시작 코드로"로 지울 수 있어요)'))
            progress.reset();
        }}
      >
        진행 상황 초기화
      </button>
    </div>
  );
}
