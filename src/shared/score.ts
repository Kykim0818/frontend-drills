import type { Progress, ShareData } from './progress';
import type { Topic } from './types';

export function quizScore(topic: Topic, p: Progress) {
  const answers = p.quiz[topic.id] ?? {};
  const answered = topic.questions.filter((q) => q.id in answers);
  const correct = answered.filter((q) => answers[q.id] === q.answer).length;
  return { correct, answered: answered.length, total: topic.questions.length };
}

export function assignmentScore(topic: Topic, assignmentId: string, p: Progress) {
  return p.assignments[`${topic.id}/${assignmentId}`];
}

export function isCleared(topic: Topic, assignmentId: string, p: Progress) {
  const s = assignmentScore(topic, assignmentId, p);
  return !!s && s.total > 0 && s.passed === s.total;
}

export function buildShareData(topics: Topic[], p: Progress): ShareData {
  const t: ShareData['t'] = {};
  for (const topic of topics) {
    const q = quizScore(topic, p);
    const a: Record<string, [number, number]> = {};
    for (const asg of topic.assignments) {
      const s = assignmentScore(topic, asg.id, p);
      if (s) a[asg.id] = [s.passed, s.total];
    }
    t[topic.id] = { q: [q.correct, q.total], a };
  }
  return { v: 1, n: p.nickname.trim() || '익명', d: new Date().toISOString().slice(0, 10), t };
}
