import { runTasksSuite } from '../../specs/tasks.suite';
import { tasksReducer } from './tasksReducer';
import TaskApp from './TaskApp';

runTasksSuite({ tasksReducer, TaskApp });
