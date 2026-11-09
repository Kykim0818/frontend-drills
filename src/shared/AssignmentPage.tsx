import { Component, useState, type ReactNode } from 'react';
import Md from './Md';
import type { Assignment } from './types';

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="explain ng">
          <strong>렌더링 에러</strong>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => this.setState({ error: null })}>다시 시도</button>
        </div>
      );
    return this.props.children;
  }
}

export default function AssignmentPage({ topicId, assignment }: { topicId: string; assignment: Assignment }) {
  const { Mine, Solution, readme, folder } = assignment;
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="assignment">
      <div className="readme">
        <Md>{readme}</Md>
        <p className="muted">
          📁 작업 폴더: <code>src/topics/{topicId}/assignments/{folder}</code> · 정답:{' '}
          <code>src/topics/{topicId}/solutions/{folder}</code>
        </p>
      </div>
      <div className="preview">
        <h3>▶ 내 코드 실행 결과</h3>
        <Boundary key={folder + 'mine'}>
          <Mine />
        </Boundary>
        <label className="toggle">
          <input type="checkbox" checked={showSolution} onChange={(e) => setShowSolution(e.target.checked)} /> 정답
          동작 미리보기 (스포일러 주의 — 코드는 직접!)
        </label>
        {showSolution && (
          <Boundary key={folder + 'sol'}>
            <Solution />
          </Boundary>
        )}
      </div>
    </div>
  );
}
