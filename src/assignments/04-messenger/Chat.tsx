import type { Dispatch } from 'react';
import type { Contact } from './contacts';
import type { MessengerAction } from './messengerReducer';

type Props = {
  contact: Contact;
  message: string;
  dispatch: Dispatch<MessengerAction>;
  onSend: (message: string, contact: Contact) => void;
};

export default function Chat({ contact, message, dispatch, onSend }: Props) {
  return (
    <section className="chat">
      <textarea
        aria-label="메시지"
        value={message}
        placeholder={'Chat to ' + contact.name}
        onChange={() => {
          // TODO(1단계): edited_message 를 dispatch (e.target.value)
        }}
      />
      <br />
      <button
        onClick={() => {
          // TODO(2단계): onSend(message, contact) 호출 후 sent_message 를 dispatch
          void onSend;
        }}
      >
        {contact.email} 에게 보내기
      </button>
    </section>
  );
}
