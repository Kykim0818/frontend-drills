import { runReducerContextSuite } from '../../specs/reducerContext.suite';
import AddTask from './AddTask';
import TaskList from './TaskList';
import { TasksProvider, useTasks, useTasksDispatch } from './TasksContext';

runReducerContextSuite({ TasksProvider, useTasks, useTasksDispatch, AddTask, TaskList });
