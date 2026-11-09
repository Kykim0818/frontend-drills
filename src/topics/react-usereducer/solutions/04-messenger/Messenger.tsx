import { useReducer } from 'react';
import Chat from './Chat';
import ContactList from './ContactList';
import { contacts, type Contact } from './contacts';
import { initialState, messengerReducer } from './messengerReducer';

const defaultOnSend = (message: string, contact: Contact) =>
  alert(`"${message}" 를 ${contact.email} 에게 보냈습니다`);

export default function Messenger({ onSend = defaultOnSend }: { onSend?: (message: string, contact: Contact) => void }) {
  const [state, dispatch] = useReducer(messengerReducer, initialState);
  const message = state.messages[state.selectedId];
  const contact = contacts.find((c) => c.id === state.selectedId)!;

  return (
    <div className="card messenger">
      <ContactList contacts={contacts} selectedId={state.selectedId} dispatch={dispatch} />
      <Chat key={contact.id} message={message} contact={contact} dispatch={dispatch} onSend={onSend} />
    </div>
  );
}
