import type { Level, Question } from './questions';

// 이 퀴즈 화면 자체도 useReducer로 만들었습니다. 다 풀고 나서 코드를 읽어보세요!
export type QuizState = {
  level: Level | '전체';
  index: number; // 필터된 목록에서의 위치
  answers: Record<number, number>; // questionId → 선택한 보기
};

export type QuizAction =
  | { type: 'level_selected'; level: QuizState['level'] }
  | { type: 'answered'; questionId: number; choice: number }
  | { type: 'moved'; delta: 1 | -1; total: number }
  | { type: 'restarted' };

export const initialQuizState: QuizState = { level: '전체', index: 0, answers: {} };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'level_selected': {
      return { ...state, level: action.level, index: 0 };
    }
    case 'answered': {
      if (action.questionId in state.answers) return state; // 한 번 고른 답은 바꿀 수 없음
      return { ...state, answers: { ...state.answers, [action.questionId]: action.choice } };
    }
    case 'moved': {
      const next = Math.min(Math.max(state.index + action.delta, 0), action.total);
      return next === state.index ? state : { ...state, index: next };
    }
    case 'restarted': {
      return initialQuizState;
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}

export function filterQuestions(all: Question[], level: QuizState['level']) {
  return level === '전체' ? all : all.filter((q) => q.level === level);
}
