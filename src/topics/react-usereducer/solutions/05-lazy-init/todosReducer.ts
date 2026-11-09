export type Todo = { id: number; text: string };
export type TodosState = { draft: string; todos: Todo[] };

export type TodosAction =
  | { type: 'changed_draft'; nextText: string }
  | { type: 'added_todo' }
  | { type: 'reset'; username: string };

/** 일부러 "무거운" 초기화 함수라고 가정합니다. */
export function createInitialState(username: string): TodosState {
  const todos: Todo[] = [];
  for (let i = 0; i < 50; i++) {
    todos.push({ id: i, text: `${username}의 할 일 #${i + 1}` });
  }
  return { draft: '', todos };
}

export function todosReducer(state: TodosState, action: TodosAction): TodosState {
  switch (action.type) {
    case 'changed_draft': {
      return { ...state, draft: action.nextText };
    }
    case 'added_todo': {
      const text = state.draft.trim();
      if (text === '') return state;
      return {
        draft: '',
        todos: [{ id: state.todos.length, text }, ...state.todos],
      };
    }
    case 'reset': {
      // 순수 함수를 리듀서 안에서 호출하는 것은 괜찮습니다.
      return createInitialState(action.username);
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}
