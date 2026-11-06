import type { ComponentType } from 'react';

import readme1 from './assignments/01-counter/README.md?raw';
import Mine1 from './assignments/01-counter/Counter';
import Sol1 from './solutions/01-counter/Counter';
import readme2 from './assignments/02-tasks/README.md?raw';
import Mine2 from './assignments/02-tasks/TaskApp';
import Sol2 from './solutions/02-tasks/TaskApp';
import readme3 from './assignments/03-cart-bugs/README.md?raw';
import Mine3 from './assignments/03-cart-bugs/CartApp';
import Sol3 from './solutions/03-cart-bugs/CartApp';
import readme4 from './assignments/04-messenger/README.md?raw';
import Mine4 from './assignments/04-messenger/Messenger';
import Sol4 from './solutions/04-messenger/Messenger';
import readme5 from './assignments/05-lazy-init/README.md?raw';
import Mine5 from './assignments/05-lazy-init/TodoList';
import Sol5 from './solutions/05-lazy-init/TodoList';
import readme6 from './assignments/06-my-usereducer/README.md?raw';
import Mine6 from './assignments/06-my-usereducer/Demo';
import Sol6 from './solutions/06-my-usereducer/Demo';
import readme7 from './assignments/07-reducer-context/README.md?raw';
import Mine7 from './assignments/07-reducer-context/TaskApp';
import Sol7 from './solutions/07-reducer-context/TaskApp';
import readme8 from './assignments/08-fetch-state-machine/README.md?raw';
import Mine8 from './assignments/08-fetch-state-machine/UserProfile';
import Sol8 from './solutions/08-fetch-state-machine/UserProfile';

export type Assignment = {
  id: string;
  title: string;
  folder: string;
  readme: string;
  Mine: ComponentType;
  Solution: ComponentType;
};

export const assignments: Assignment[] = [
  { id: '01', title: 'useState → useReducer', folder: '01-counter', readme: readme1, Mine: Mine1, Solution: Sol1 },
  { id: '02', title: '할 일 목록 리팩터링', folder: '02-tasks', readme: readme2, Mine: Mine2, Solution: Sol2 },
  { id: '03', title: '버그 사냥 (순수성)', folder: '03-cart-bugs', readme: readme3, Mine: Mine3, Solution: Sol3 },
  { id: '04', title: '메신저 (챌린지)', folder: '04-messenger', readme: readme4, Mine: Mine4, Solution: Sol4 },
  { id: '05', title: '초기화 함수 & key', folder: '05-lazy-init', readme: readme5, Mine: Mine5, Solution: Sol5 },
  { id: '06', title: 'useReducer 직접 구현', folder: '06-my-usereducer', readme: readme6, Mine: Mine6, Solution: Sol6 },
  { id: '07', title: '리듀서 + 컨텍스트', folder: '07-reducer-context', readme: readme7, Mine: Mine7, Solution: Sol7 },
  { id: '08', title: '(심화) 비동기 상태 머신', folder: '08-fetch-state-machine', readme: readme8, Mine: Mine8, Solution: Sol8 },
];
