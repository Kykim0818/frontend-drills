import { pickFiles } from '../../shared/files';
import type { Assignment, Topic } from '../../shared/types';
import concepts from './concepts.md?raw';
import { levels, questions } from './questions';
import { runCartSuite } from './specs/cart.suite';
import { runCounterSuite } from './specs/counter.suite';
import { runFetchSuite } from './specs/fetch.suite';
import { runLazyInitSuite } from './specs/lazyInit.suite';
import { runMessengerSuite } from './specs/messenger.suite';
import { runMyUseReducerSuite } from './specs/myUseReducer.suite';
import { runReducerContextSuite } from './specs/reducerContext.suite';
import { runTasksSuite } from './specs/tasks.suite';

// 과제 폴더의 소스를 문자열로 가져옵니다. (테스트 파일 제외)
const raw = import.meta.glob(
  ['./assignments/*/*.{md,ts,tsx}', './solutions/*/*.{ts,tsx}', '!./**/*.test.tsx'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

function define(
  id: string,
  title: string,
  folder: string,
  order: string[],
  entry: string,
  grade: Assignment['grade'],
): Assignment {
  return {
    id,
    title,
    folder,
    readme: raw[`./assignments/${folder}/README.md`],
    files: pickFiles(raw, `./assignments/${folder}/`, order),
    solutionFiles: pickFiles(raw, `./solutions/${folder}/`, order),
    entry,
    grade,
  };
}

const assignments: Assignment[] = [
  define('01', 'useState → useReducer', '01-counter', ['reducer.ts', 'Counter.tsx'], 'Counter', (m) =>
    runCounterSuite({
      counterReducer: m.reducer.counterReducer,
      initialCounterState: m.reducer.initialCounterState,
      Counter: m.Counter.default,
    }),
  ),
  define('02', '할 일 목록 리팩터링', '02-tasks', ['tasksReducer.ts', 'TaskApp.tsx'], 'TaskApp', (m) =>
    runTasksSuite({ tasksReducer: m.tasksReducer.tasksReducer, TaskApp: m.TaskApp.default }),
  ),
  define('03', '버그 사냥 (순수성)', '03-cart-bugs', ['cartReducer.ts', 'CartApp.tsx'], 'CartApp', (m) =>
    runCartSuite({ cartReducer: m.cartReducer.cartReducer, CartApp: m.CartApp.default }),
  ),
  define(
    '04',
    '메신저 (챌린지)',
    '04-messenger',
    ['messengerReducer.ts', 'Chat.tsx', 'ContactList.tsx', 'Messenger.tsx'],
    'Messenger',
    (m) =>
      runMessengerSuite({
        messengerReducer: m.messengerReducer.messengerReducer,
        initialState: m.messengerReducer.initialState,
        Messenger: m.Messenger.default,
      }),
  ),
  define('05', '초기화 함수 & key', '05-lazy-init', ['todosReducer.ts', 'TodoList.tsx'], 'TodoList', (m) =>
    runLazyInitSuite({
      todosReducer: m.todosReducer.todosReducer,
      createInitialState: m.todosReducer.createInitialState,
      TodoList: m.TodoList.TodoList,
      TodoApp: m.TodoList.default,
    }),
  ),
  define('06', 'useReducer 직접 구현', '06-my-usereducer', ['useMyReducer.ts', 'Demo.tsx'], 'Demo', (m) =>
    runMyUseReducerSuite(m.useMyReducer.useMyReducer),
  ),
  define(
    '07',
    '리듀서 + 컨텍스트',
    '07-reducer-context',
    ['TasksContext.tsx', 'AddTask.tsx', 'TaskList.tsx', 'TaskApp.tsx'],
    'TaskApp',
    (m) =>
      runReducerContextSuite({
        TasksProvider: m.TasksContext.TasksProvider,
        useTasks: m.TasksContext.useTasks,
        useTasksDispatch: m.TasksContext.useTasksDispatch,
        AddTask: m.AddTask.default,
        TaskList: m.TaskList.default,
      }),
  ),
  define(
    '08',
    '(심화) 비동기 상태 머신',
    '08-fetch-state-machine',
    ['fetchReducer.ts', 'UserProfile.tsx'],
    'UserProfile',
    (m) => runFetchSuite({ fetchReducer: m.fetchReducer.fetchReducer, UserProfile: m.UserProfile.UserProfile }),
  ),
];

const topic: Topic = {
  id: 'react-usereducer',
  title: 'React · useReducer',
  emoji: '🧠',
  description: '리듀서로 state 로직 모으기 — 순수성, 업데이트 큐, 초기화 함수, 컨텍스트까지',
  concepts,
  levels,
  questions,
  assignments,
};

export default topic;
