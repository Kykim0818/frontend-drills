// TODO(3단계): state 모양을 { selectedId, messages: Record<number, string> } 로 바꾸세요.
export type MessengerState = {
  selectedId: number;
  message: string;
};

export type MessengerAction =
  | { type: 'changed_selection'; contactId: number }
  | { type: 'edited_message'; message: string };
// TODO(2단계): | { type: 'sent_message' }

export const initialState: MessengerState = {
  selectedId: 0,
  message: 'Hello',
};

export function messengerReducer(state: MessengerState, action: MessengerAction): MessengerState {
  switch (action.type) {
    case 'changed_selection': {
      return { ...state, selectedId: action.contactId, message: '' };
    }
    case 'edited_message': {
      return { ...state, message: action.message };
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}
