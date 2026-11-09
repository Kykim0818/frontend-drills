import { runCounterSuite } from '../../specs/counter.suite';
import { counterReducer, initialCounterState } from './reducer';
import Counter from './Counter';

runCounterSuite({ counterReducer, initialCounterState, Counter });
