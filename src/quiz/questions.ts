export type Level = '기초' | '동작 원리' | '함정' | '설계' | '심화';

export type Question = {
  id: number;
  level: Level;
  question: string;
  code?: string;
  choices: string[];
  answer: number; // choices 의 index
  explanation: string;
  docs: { label: string; url: string };
};

const REF = 'https://react.dev/reference/react/useReducer';
const LEARN = 'https://react.dev/learn/extracting-state-logic-into-a-reducer';
const SCALE = 'https://react.dev/learn/scaling-up-with-reducer-and-context';

export const questions: Question[] = [
  // ───────────────────────── 기초 ─────────────────────────
  {
    id: 1,
    level: '기초',
    question: '`useReducer`가 반환하는 것은?',
    code: `const ??? = useReducer(reducer, initialArg, init?);`,
    choices: [
      '현재 state 하나',
      '[현재 state, dispatch 함수] 배열',
      '{ state, dispatch } 객체',
      '[dispatch 함수, 현재 state] 배열',
    ],
    answer: 1,
    explanation:
      '`useReducer`는 정확히 두 개의 값을 가진 배열을 반환합니다. ① 현재 state (첫 렌더에서는 `init(initialArg)` 또는 `initialArg`) ② state를 다른 값으로 업데이트하고 리렌더링을 일으키는 `dispatch` 함수.',
    docs: { label: 'useReducer › Returns', url: `${REF}#returns` },
  },
  {
    id: 2,
    level: '기초',
    question: '리듀서 함수의 올바른 시그니처는?',
    choices: [
      '(action) => nextState',
      '(state, action) => nextState',
      '(state, dispatch) => void',
      '(prevState, nextState) => action',
    ],
    answer: 1,
    explanation:
      '리듀서는 현재 state와 action을 인자로 받아 **다음 state를 반환**하는 순수 함수입니다. 이름은 배열의 `reduce((acc, item) => nextAcc)`에서 따왔습니다. `[a1, a2, a3].reduce(tasksReducer, initialState)` 처럼 action 배열을 reduce 하면 최종 state가 나옵니다.',
    docs: { label: 'Comparing useState and useReducer', url: `${LEARN}#step-2-write-a-reducer-function` },
  },
  {
    id: 3,
    level: '기초',
    question: '공식 문서가 권장하는 action 설계는?',
    choices: [
      "{ type: 'set_tasks', tasks: newTasks }  — 무엇을 설정할지 명령",
      "{ type: 'added', id, text }  — 사용자가 한 일(일어난 사건)을 설명",
      "{ tasks: newTasks }  — type 없이 다음 state를 통째로",
      'action은 항상 문자열 하나여야 한다',
    ],
    answer: 1,
    explanation:
      'action은 "state를 어떻게 바꿔라"가 아니라 **"사용자가 무엇을 했는지"** 를 최소한의 정보로 담는 것이 좋습니다. 그래야 로직이 리듀서에 모이고 디버깅 시 action 로그만 봐도 흐름이 보입니다. action 모양 자체는 자유지만 관례상 `type` 필드를 둡니다.',
    docs: { label: 'Step 1: Move from setting state to dispatching actions', url: `${LEARN}#step-1-move-from-setting-state-to-dispatching-actions` },
  },
  {
    id: 4,
    level: '기초',
    question: '"이름 입력 필드 5개를 한 번에 초기화" 버튼. 어떤 dispatch가 가장 바람직할까?',
    choices: [
      "set_field를 5번 dispatch",
      "{ type: 'reset_form' } 한 번 dispatch",
      'dispatch 대신 state를 직접 빈 값으로 바꾼다',
      'useEffect 안에서 리셋한다',
    ],
    answer: 1,
    explanation:
      '공식 문서: "각 action은 데이터에 여러 변경이 생기더라도 **하나의 사용자 상호작용**을 설명해야 한다." 필드 5개를 리셋하는 버튼이라면 `set_field` 5번보다 `reset_form` 하나가 의미 있고 로그도 깔끔합니다.',
    docs: { label: 'Writing reducers well', url: `${LEARN}#writing-reducers-well` },
  },
  {
    id: 5,
    level: '기초',
    question: '리듀서의 `switch`에서 알 수 없는 action을 만났을 때 공식 문서 예제는 무엇을 하나?',
    code: `switch (action.type) {
  case 'added': { ... }
  case 'changed': { ... }
  default: {
    ???
  }
}`,
    choices: [
      'return state;  (조용히 무시)',
      "throw Error('Unknown action: ' + action.type);",
      'return initialState;',
      'console.log만 찍고 undefined 반환',
    ],
    answer: 1,
    explanation:
      '문서 예제들은 `default`에서 에러를 던집니다. 오타 난 action type(`"chnaged"`)을 조용히 무시하면 버그를 찾기 어렵기 때문입니다. TypeScript라면 `const _: never = action` 으로 컴파일 타임에 빠진 case도 잡을 수 있습니다.',
    docs: { label: 'Adding a reducer to a component', url: `${REF}#adding-a-reducer-to-a-component` },
  },
  {
    id: 6,
    level: '기초',
    question: '각 `case`를 `{ }` 블록으로 감싸라고 권장하는 이유는?',
    code: `case 'added': {
  const nextTasks = [...];
  return nextTasks;
}`,
    choices: [
      '성능이 좋아져서',
      '서로 다른 case에서 선언한 변수가 충돌하지 않게 하려고',
      '블록이 없으면 React가 리듀서를 인식하지 못해서',
      'break를 쓰지 않아도 되게 하려고',
    ],
    answer: 1,
    explanation:
      '`switch` 전체가 하나의 스코프라서, 블록 없이 여러 case에서 `const nextState`를 선언하면 충돌합니다. 또 공식 문서는 각 case가 보통 `return`으로 끝나야 하며 깜빡하면 다음 case로 **fallthrough** 되는 실수를 경고합니다.',
    docs: { label: 'Step 2: Write a reducer function', url: `${LEARN}#step-2-write-a-reducer-function` },
  },

  // ───────────────────────── 동작 원리 ─────────────────────────
  {
    id: 7,
    level: '동작 원리',
    question: '버튼 클릭 시 콘솔에 찍히는 값은? (현재 age = 42)',
    code: `function handleClick() {
  console.log(state.age);  // ①
  dispatch({ type: 'incremented_age' });
  console.log(state.age);  // ②
  setTimeout(() => {
    console.log(state.age); // ③
  }, 5000);
}`,
    choices: ['42, 43, 43', '42, 42, 42', '42, 43, 42', '42, 42, 43'],
    answer: 1,
    explanation:
      'state는 **스냅샷**처럼 동작합니다. dispatch는 *다음 렌더링*의 state를 바꿀 뿐, 이미 실행 중인 이벤트 핸들러의 `state` 변수는 바뀌지 않습니다. setTimeout 콜백도 그 렌더링의 `state`를 클로저로 붙잡고 있어서 42입니다. 다음 값을 미리 알고 싶다면 `reducer(state, action)`을 직접 호출해 계산할 수 있습니다.',
    docs: { label: "I've dispatched an action, but logging gives me the old state value", url: `${REF}#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value` },
  },
  {
    id: 8,
    level: '동작 원리',
    question: 'age가 42일 때 클릭 한 번 후 age는?',
    code: `function handleClick() {
  dispatch({ type: 'incremented_age' });
  dispatch({ type: 'incremented_age' });
  dispatch({ type: 'incremented_age' });
}`,
    choices: ['43', '45', '42', '에러 발생'],
    answer: 1,
    explanation:
      'dispatch된 action들은 **큐**에 쌓이고, React는 다음 렌더링 때 리듀서를 순서대로 실행하면서 매번 *직전 결과*를 state로 넘깁니다. `setAge(age + 1)`을 세 번 부르면 43이 되는 것과 달리, 리듀서는 `setAge(a => a + 1)` 업데이터 함수와 같은 방식이라 45가 됩니다.',
    docs: { label: 'Queueing a Series of State Updates', url: 'https://react.dev/learn/queueing-a-series-of-state-updates' },
  },
  {
    id: 9,
    level: '동작 원리',
    question: '리듀서가 이전 state와 `Object.is`로 같은 값을 반환하면?',
    choices: [
      '항상 컴포넌트와 모든 자식이 리렌더링된다',
      'React가 컴포넌트와 자식의 리렌더링을 건너뛴다 (단, 컴포넌트가 한 번 호출될 수는 있다)',
      '에러가 발생한다',
      'state가 initialArg로 초기화된다',
    ],
    answer: 1,
    explanation:
      '새 값이 현재 state와 `Object.is`로 같으면 React는 컴포넌트와 그 자식의 리렌더링을 건너뜁니다(bail out). 다만 건너뛰기 전에 해당 컴포넌트를 한 번 호출해야 할 수도 있는데, 결과에는 영향이 없습니다. 그래서 "변경 없음"일 때 기존 state를 그대로 반환하는 것은 좋은 최적화입니다.',
    docs: { label: 'dispatch › Caveats', url: `${REF}#dispatch` },
  },
  {
    id: 10,
    level: '동작 원리',
    question: '`dispatch` 함수에 대한 설명으로 **틀린** 것은?',
    choices: [
      'dispatch 함수의 참조는 안정적이라 effect 의존성에서 빼도 린터가 경고하지 않는다',
      'dispatch는 반환값이 없다',
      'dispatch는 호출 즉시 리듀서를 실행하고 새 state를 반환한다',
      '한 이벤트에서 여러 번 호출해도 React가 배치(batch) 처리해 한 번만 리렌더링한다',
    ],
    answer: 2,
    explanation:
      '`dispatch`는 아무것도 반환하지 않으며, state는 *다음 렌더링*에서야 바뀝니다. 나머지는 모두 사실입니다. dispatch 함수의 식별자는 안정적이고, React는 이벤트 핸들러의 모든 코드가 실행된 뒤 업데이트를 일괄 처리합니다.',
    docs: { label: 'dispatch function', url: `${REF}#dispatch` },
  },
  {
    id: 11,
    level: '동작 원리',
    question: '개발 모드(Strict Mode)에서 리듀서와 init 함수에 일어나는 일은?',
    choices: [
      '아무 일도 없다',
      '두 번 호출된다 — 순수하지 않은 로직을 찾아내기 위해',
      '리듀서는 한 번, 컴포넌트만 두 번 호출된다',
      '프로덕션에서도 두 번 호출된다',
    ],
    answer: 1,
    explanation:
      'Strict Mode에서 React는 리듀서와 초기화 함수를 **두 번** 호출해 실수로 생긴 불순함을 찾게 도와줍니다. 개발 전용 동작이며 프로덕션에는 영향이 없습니다. 둘 중 하나의 결과는 버려지므로, 리듀서가 순수하다면 결과는 같습니다.',
    docs: { label: 'My reducer or initializer function runs twice', url: `${REF}#my-reducer-or-initializer-function-runs-twice` },
  },

  // ───────────────────────── 함정 ─────────────────────────
  {
    id: 12,
    level: '함정',
    question: '버튼을 눌러도 화면이 바뀌지 않는다. 원인은?',
    code: `function reducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
      state.age = state.age + 1;
      return state;
    }
  }
}`,
    choices: [
      'case 블록에 break가 없어서',
      '기존 객체를 변경(mutation)하고 같은 참조를 반환해서 React가 변경을 감지하지 못함',
      'dispatch를 두 번 해야 해서',
      'age가 문자열이라서',
    ],
    answer: 1,
    explanation:
      'React는 `Object.is(이전, 다음)`이 true면 업데이트를 무시합니다. 객체를 직접 고쳐서 같은 객체를 반환하면 바뀐 게 없다고 판단합니다. `return { ...state, age: state.age + 1 }` 처럼 **새 객체**를 반환하세요.',
    docs: { label: "I've dispatched an action, but the screen doesn't update", url: `${REF}#ive-dispatched-an-action-but-the-screen-doesnt-update` },
  },
  {
    id: 13,
    level: '함정',
    question: '`changed_name` 이후 화면에 `undefined살` 같은 값이 보인다. 원인은?',
    code: `case 'changed_name': {
  return {
    name: action.nextName
  };
}`,
    choices: [
      'nextName이 undefined라서',
      '새 객체에 기존 필드(age)를 복사하지 않아서 state의 일부가 사라짐',
      '리듀서가 두 번 호출되어서',
      'switch에 default가 없어서',
    ],
    answer: 1,
    explanation:
      '리듀서가 반환한 값이 **state 전체**를 대체합니다. `useState`의 클래스 컴포넌트 `setState` 같은 자동 병합은 없습니다. `{ ...state, name: action.nextName }` 처럼 기존 필드를 펼쳐 넣으세요.',
    docs: { label: 'A part of my reducer state becomes undefined after dispatching', url: `${REF}#a-part-of-my-reducer-state-becomes-undefined-after-dispatching` },
  },
  {
    id: 14,
    level: '함정',
    question: '개발 모드에서 할 일을 추가하면 **두 개씩** 추가된다. 원인은?',
    code: `case 'added_todo': {
  state.todos.push({ id: action.id, text: action.text });
  return { ...state };
}`,
    choices: [
      'React 버그다',
      'Strict Mode가 리듀서를 두 번 호출하는데, 리듀서가 이전 state의 배열을 직접 변경(push)해서 두 번 들어감',
      '버튼의 onClick이 두 번 등록되어서',
      '{ ...state } 가 깊은 복사를 해서',
    ],
    answer: 1,
    explanation:
      '`{ ...state }`는 얕은 복사라 `todos` 배열은 이전 state와 **같은 배열**입니다. push로 이전 state를 변경하면 순수하지 않으므로 Strict Mode의 두 번 호출에서 두 번 push 됩니다. `todos: [...state.todos, newTodo]`로 새 배열을 만드세요. (공식 문서의 바로 그 예제!)',
    docs: { label: 'My reducer or initializer function runs twice', url: `${REF}#my-reducer-or-initializer-function-runs-twice` },
  },
  {
    id: 15,
    level: '함정',
    question: '"Too many re-renders" 에러가 난다. 원인은?',
    code: `return <button onClick={handleClick(1)}>Click me</button>;`,
    choices: [
      'handleClick이 async가 아니어서',
      '렌더링 도중에 handleClick(1)이 즉시 실행되어 dispatch → 렌더링 → dispatch… 무한 루프',
      'button에 key가 없어서',
      'useReducer를 조건문 안에서 호출해서',
    ],
    answer: 1,
    explanation:
      '`onClick={handleClick(1)}`은 함수를 **전달**하는 게 아니라 렌더링 중에 **호출**합니다. 그 안의 dispatch가 또 렌더링을 일으켜 무한 루프가 됩니다. `onClick={() => handleClick(1)}`로 고치세요.',
    docs: { label: "I'm getting an error: Too many re-renders", url: `${REF}#im-getting-an-error-too-many-re-renders` },
  },
  {
    id: 16,
    level: '함정',
    question: '다음 코드의 문제점은?',
    code: `function createInitialState(username) { /* 무거운 계산 */ }

function TodoList({ username }) {
  const [state, dispatch] = useReducer(reducer, createInitialState(username));
}`,
    choices: [
      '문제없다. 초기 state는 첫 렌더에만 쓰이니까 함수도 한 번만 호출된다',
      '결과는 첫 렌더에만 쓰이지만 createInitialState는 **매 렌더링마다** 호출된다',
      'useReducer의 두 번째 인자로 함수 호출 결과를 넣으면 에러가 난다',
      'username이 바뀌면 state가 자동으로 다시 초기화된다',
    ],
    answer: 1,
    explanation:
      'JS는 인자를 먼저 평가하므로 `createInitialState(username)`은 렌더링마다 실행됩니다. 결과가 버려질 뿐이죠. `useReducer(reducer, username, createInitialState)`처럼 **세 번째 인자로 함수 자체**를 넘기면 첫 렌더링에만 호출됩니다.',
    docs: { label: 'Avoiding recreating the initial state', url: `${REF}#avoiding-recreating-the-initial-state` },
  },
  {
    id: 17,
    level: '함정',
    question: '`useReducer(reducer, createInitialState)` 라고 쓰면? (함수를 두 번째 인자로)',
    choices: [
      'useState(fn)처럼 lazy initializer로 동작한다',
      '함수 객체 자체가 초기 state가 된다',
      '에러가 발생한다',
      'createInitialState(undefined)가 호출된다',
    ],
    answer: 1,
    explanation:
      '`useState(() => ...)`와 달리 `useReducer`의 두 번째 인자 `initialArg`는 그냥 값입니다. 함수를 넣으면 **그 함수가 state**가 됩니다. lazy 초기화는 반드시 **세 번째 인자 `init`** 으로 해야 합니다. 인자가 필요 없다면 `useReducer(reducer, null, createInitialState)` 처럼 씁니다.',
    docs: { label: 'Parameters', url: `${REF}#parameters` },
  },
  {
    id: 18,
    level: '함정',
    question: '`useReducer(reducer, username, init)` 사용 중, 부모가 `username` prop을 바꿨다. state는?',
    choices: [
      'init(새 username)으로 자동 재초기화된다',
      '그대로 유지된다. init은 첫 렌더링에만 실행된다',
      'undefined가 된다',
      '리듀서가 reset action을 자동으로 받는다',
    ],
    answer: 1,
    explanation:
      'initialArg/init은 **초기** state에만 쓰입니다. prop이 바뀐다고 state가 리셋되지 않습니다. 사용자가 바뀌면 완전히 새로 시작하고 싶다면 `<TodoList key={username} username={username} />`처럼 **key**를 바꿔 컴포넌트를 새로 마운트하세요. (과제 5)',
    docs: { label: 'Resetting state with a key', url: 'https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key' },
  },
  {
    id: 19,
    level: '함정',
    question: '다음 중 리듀서 안에 있어도 **괜찮은** 것은?',
    choices: [
      "fetch('/api/save', { body: ... })",
      'setTimeout(() => ..., 1000)',
      'const id = Math.random()',
      'state.items.filter(...) 로 새 배열 계산',
    ],
    answer: 3,
    explanation:
      '리듀서는 **렌더링 중에** 실행되므로 순수해야 합니다: 같은 입력 → 같은 출력, 부수 효과 없음. 요청/타이머 같은 부수 효과는 이벤트 핸들러나 effect에서, 랜덤 id는 이벤트 핸들러에서 만들어 action에 담아 보내세요. 기존 값을 바꾸지 않고 새 값을 계산하는 `filter`는 순수합니다.',
    docs: { label: 'Reducers must be pure', url: `${LEARN}#writing-reducers-well` },
  },

  // ───────────────────────── 설계 ─────────────────────────
  {
    id: 20,
    level: '설계',
    question: '공식 문서의 useState vs useReducer 비교로 **틀린** 것은?',
    choices: [
      '코드 크기: useReducer는 리듀서와 action을 미리 작성해야 해서 보통 더 길다',
      '가독성: 간단한 업데이트는 useState가, 복잡해지면 useReducer가 읽기 쉽다',
      '디버깅: useReducer는 리듀서에 로그를 찍어 어떤 action 때문에 바뀌었는지 볼 수 있다',
      '성능: useReducer가 항상 더 빠르므로 가능하면 useReducer를 써야 한다',
    ],
    answer: 3,
    explanation:
      '문서는 코드 크기, 가독성, 디버깅, 테스트(리듀서는 순수 함수라 따로 테스트 쉬움), 개인 취향을 비교합니다. 성능상 우월하다는 말은 없고, **한 컴포넌트 안에서 둘을 섞어 써도 된다**고 합니다. 잘못된 업데이트로 버그가 자주 생기면 리듀서 도입을 고려하세요.',
    docs: { label: 'Comparing useState and useReducer', url: `${LEARN}#comparing-usestate-and-usereducer` },
  },
  {
    id: 21,
    level: '설계',
    question: '리듀서를 보통 컴포넌트 **바깥**(또는 별도 파일)에 선언하는 이유로 가장 적절한 것은?',
    choices: [
      '컴포넌트 안에 선언하면 문법 에러가 나서',
      '리듀서는 컴포넌트의 props/state에 의존하지 않는 순수 함수라 분리하면 테스트·재사용·가독성이 좋아져서',
      'React가 컴포넌트 바깥의 함수만 리듀서로 인정해서',
      'dispatch가 바깥 함수만 호출할 수 있어서',
    ],
    answer: 1,
    explanation:
      '리듀서는 `(state, action)`만으로 다음 state를 계산하므로 컴포넌트 클로저가 필요 없습니다. 바깥에 두면 `tasksReducer.js` 처럼 파일로 분리해 단위 테스트하기 쉽고, 컴포넌트는 "무슨 일이 일어났는지"만 dispatch 하는 얇은 코드가 됩니다.',
    docs: { label: 'Step 3: Use the reducer from your component', url: `${LEARN}#step-3-use-the-reducer-from-your-component` },
  },
  {
    id: 22,
    level: '설계',
    question: '리듀서 + 컨텍스트 패턴에서 `TasksContext`와 `TasksDispatchContext`를 **분리**하는 이점은?',
    choices: [
      '컨텍스트는 값 하나만 담을 수 있어서 어쩔 수 없다',
      'dispatch는 안정적인 참조라, dispatch만 쓰는 컴포넌트(예: AddTask)는 tasks가 바뀌어도 컨텍스트로 인한 리렌더링을 피할 수 있다',
      'dispatch를 컨텍스트에 넣으면 동작하지 않는다',
      '타입스크립트에서만 필요하다',
    ],
    answer: 1,
    explanation:
      '컨텍스트 값이 바뀌면 그 컨텍스트를 읽는 모든 컴포넌트가 리렌더링됩니다. `{ tasks, dispatch }`를 한 객체로 넣으면 dispatch만 필요한 컴포넌트도 tasks 변경 때마다 리렌더링됩니다. 분리하면 각자 필요한 것만 구독합니다.',
    docs: { label: 'Scaling Up with Reducer and Context', url: `${SCALE}#step-1-create-the-context` },
  },
  {
    id: 23,
    level: '설계',
    question: '`useTasks()` 같은 커스텀 훅으로 컨텍스트를 감싸는 이점이 **아닌** 것은?',
    code: `export function useTasks() {
  return useContext(TasksContext);
}`,
    choices: [
      '사용하는 쪽이 컨텍스트 객체를 직접 import할 필요가 없다',
      'Provider 밖에서 쓰는 실수를 감지해 명확한 에러를 던질 수 있다',
      '나중에 컨텍스트 구현을 바꿔도 사용처 코드는 그대로 둘 수 있다',
      '커스텀 훅으로 감싸면 컨텍스트 값이 바뀌어도 리렌더링되지 않는다',
    ],
    answer: 3,
    explanation:
      '커스텀 훅은 그저 `useContext`를 감싼 함수입니다. 리렌더링 동작은 그대로입니다. 대신 캡슐화, 에러 메시지(Provider 누락), 구현 교체 용이성 같은 장점이 있습니다.',
    docs: { label: 'Moving all wiring into a single file', url: `${SCALE}#moving-all-wiring-into-a-single-file` },
  },

  // ───────────────────────── 심화 ─────────────────────────
  {
    id: 24,
    level: '심화',
    question: '`useState`로 `useReducer`를 구현할 때 올바른 dispatch는?',
    code: `function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);
  function dispatch(action) {
    ???
  }
  return [state, dispatch];
}`,
    choices: [
      'setState(reducer(state, action));',
      'setState(s => reducer(s, action));',
      'state = reducer(state, action);',
      'reducer(state, action); setState(state);',
    ],
    answer: 1,
    explanation:
      '①은 대부분 동작하지만 한 이벤트에서 여러 번 dispatch하면 모두 같은 `state` 스냅샷을 기준으로 계산되어 마지막 것만 남습니다. 업데이터 함수 `s => reducer(s, action)`를 큐에 넣으면 React가 직전 결과를 넘겨주므로 실제 useReducer처럼 누적됩니다. (과제 6)',
    docs: { label: 'Challenge: Implement useReducer from scratch', url: `${LEARN}#implement-usereducer-from-scratch` },
  },
  {
    id: 25,
    level: '심화',
    question: '다음 state 설계의 가장 큰 문제는?',
    code: `type State = {
  isLoading: boolean;
  isError: boolean;
  data: User | null;
  error: string | null;
};`,
    choices: [
      '필드가 너무 적다',
      '`isLoading: true, isError: true, data: user` 같은 **불가능한 조합**을 표현할 수 있다',
      'null을 쓰면 안 된다',
      'boolean은 리듀서에서 쓸 수 없다',
    ],
    answer: 1,
    explanation:
      '공식 문서의 "state 구조 선택" 원칙 중 하나는 **모순을 피하라**입니다. `{ status: "idle" } | { status: "loading" } | { status: "success", data } | { status: "error", error }` 같은 판별 유니온 + 리듀서로 상태 전이를 한 곳에서 통제하면 불가능한 상태가 사라집니다. (과제 8)',
    docs: { label: 'Avoid contradictions in state', url: 'https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state' },
  },
  {
    id: 26,
    level: '심화',
    question: 'Immer의 `useImmerReducer`를 쓰면 리듀서에서 `draft.push(...)` 같은 변경 문법을 쓸 수 있다. 그래도 지켜야 하는 것은?',
    code: `function tasksReducer(draft, action) {
  switch (action.type) {
    case 'added': {
      draft.push({ id: action.id, text: action.text, done: false });
      break;
    }
  }
}`,
    choices: [
      '아무것도 없다. Immer를 쓰면 부수 효과도 자유롭게 써도 된다',
      '여전히 순수해야 한다 — draft 변경은 Immer가 불변 업데이트로 바꿔줄 뿐, fetch/랜덤 같은 부수 효과는 금지',
      'draft를 변경한 뒤 반드시 draft를 return 해야 한다',
      'Immer는 배열에서만 동작한다',
    ],
    answer: 1,
    explanation:
      'Immer의 `draft`는 특별한 Proxy라서 마음껏 "변경"해도 Immer가 내부에서 새 불변 객체를 만들어 줍니다. 그래서 변경 후 return 없이 `break`만 해도 됩니다. 하지만 리듀서가 렌더링 중 실행된다는 사실은 그대로라 **순수성 규칙**은 여전히 지켜야 합니다.',
    docs: { label: 'Writing concise reducers with Immer', url: `${LEARN}#writing-concise-reducers-with-immer` },
  },
];
