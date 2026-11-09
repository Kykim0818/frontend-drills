import { runFetchSuite } from '../../specs/fetch.suite';
import { fetchReducer } from './fetchReducer';
import { UserProfile } from './UserProfile';

runFetchSuite({ fetchReducer, UserProfile });
