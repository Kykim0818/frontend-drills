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
        onChange={(e) => dispatch({ type: 'edited_message', message: e.target.value })}
      />
      <br />
      <button
        onClick={() => {
          // 전송은 부수 효과 → 이벤트 핸들러에서. 리듀서는 "보냈다"는 사실만 받아 state를 계산.
          onSend(message, contact);
          dispatch({ type: 'sent_message' });
        }}
      >
        {contact.email} 에게 보내기
      </button>
    </section>
  );
}
