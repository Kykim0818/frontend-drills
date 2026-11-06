import { runLazyInitSuite } from '../../specs/lazyInit.suite';
import { createInitialState, todosReducer } from './todosReducer';
import TodoApp, { TodoList } from './TodoList';

runLazyInitSuite({ todosReducer, createInitialState, TodoList, TodoApp });
