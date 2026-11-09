import { decodeShare } from './progress';
import type { Topic } from './types';

export default function SharePage({ data, topics }: { data: string; topics: Topic[] }) {
  const share = decodeShare(data);
  if (!share) return <p>공유 링크가 올바르지 않습니다.</p>;

  return (
    <div className="readme">
      <h1>🏅 {share.n} 님의 frontend-drills 기록</h1>
      <p className="muted">{share.d} 기준</p>
      {Object.entries(share.t).map(([topicId, s]) => {
        const topic = topics.find((t) => t.id === topicId);
        if (!topic) return null;
        const cleared = topic.assignments.filter((a) => s.a[a.id] && s.a[a.id][0] === s.a[a.id][1]).length;
        return (
          <section key={topicId} className="card">
            <h3>
              {topic.emoji} {topic.title}
            </h3>
            <div className="stats">
              <div>
                <span className="big">
                  {s.q[0]}/{s.q[1]}
                </span>
                <span className="muted">퀴즈 정답</span>
              </div>
              <div>
                <span className="big">
                  {cleared}/{topic.assignments.length}
                </span>
                <span className="muted">과제 완료</span>
              </div>
            </div>
            <ul className="results">
              {topic.assignments.map((a) => {
                const r = s.a[a.id];
                return (
                  <li key={a.id} className={r && r[0] === r[1] ? 'pass' : 'fail'}>
                    <span>{r ? (r[0] === r[1] ? '✅' : '🟡') : '⬜'}</span>
                    <div>
                      {a.id}. {a.title} {r && <span className="muted">— {r[0]}/{r[1]}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p>
        <a href="#/">나도 풀어보기 →</a>
      </p>
    </div>
  );
}
