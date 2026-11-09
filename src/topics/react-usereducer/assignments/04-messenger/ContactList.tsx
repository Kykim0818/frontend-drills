import type { Dispatch } from 'react';
import type { Contact } from './contacts';
import type { MessengerAction } from './messengerReducer';

type Props = {
  contacts: Contact[];
  selectedId: number;
  dispatch: Dispatch<MessengerAction>;
};

export default function ContactList({ contacts, selectedId, dispatch }: Props) {
  return (
    <ul className="contacts">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <button
            aria-pressed={selectedId === contact.id}
            onClick={() => {
              // TODO(1단계): changed_selection 을 dispatch
              void dispatch;
            }}
          >
            {contact.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
