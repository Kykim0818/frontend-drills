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
  // TODO: 구현하세요
  void action;
  return state;
}
