import { runMessengerSuite } from '../../specs/messenger.suite';
import { initialState, messengerReducer } from './messengerReducer';
import Messenger from './Messenger';

runMessengerSuite({ messengerReducer, initialState, Messenger });
