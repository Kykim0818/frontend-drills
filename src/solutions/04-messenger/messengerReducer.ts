export type MessengerState = {
  selectedId: number;
  messages: Record<number, string>;
};

export type MessengerAction =
  | { type: 'changed_selection'; contactId: number }
  | { type: 'edited_message'; message: string }
  | { type: 'sent_message' };

export const initialState: MessengerState = {
  selectedId: 0,
  messages: {
    0: 'Hello, Taylor',
    1: 'Hello, Alice',
    2: 'Hello, Bob',
  },
};

export function messengerReducer(state: MessengerState, action: MessengerAction): MessengerState {
  switch (action.type) {
    case 'changed_selection': {
      return { ...state, selectedId: action.contactId };
    }
    case 'edited_message': {
      return {
        ...state,
        messages: { ...state.messages, [state.selectedId]: action.message },
      };
    }
    case 'sent_message': {
      return {
        ...state,
        messages: { ...state.messages, [state.selectedId]: '' },
      };
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}
