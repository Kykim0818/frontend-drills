# 과제 4. 메신저 만들기 (공식 문서 챌린지 1~3)

> 📖 공식 문서: [Extracting State Logic into a Reducer – Challenges](https://react.dev/learn/extracting-state-logic-into-a-reducer#challenges)

## 현재 상태
- 연락처를 고르면 해당 사람과의 채팅 화면이 나옵니다.
- `messengerReducer.ts`는 `{ selectedId, message }` 형태로 **메시지 하나만** 저장합니다.
- `Chat.tsx`의 "보내기" 버튼은 아직 아무 일도 하지 않습니다.

## 단계별 요구사항
### 1단계 — 이벤트 핸들러에서 dispatch 하기
`ContactList`와 `Chat`에서 `TODO` 부분을 채워 연락처 선택/입력이 동작하게 하세요.

### 2단계 — 보내기 시 입력창 비우기
"보내기"를 누르면
1. `onSend(message, contact)`를 호출 (실제 앱이라면 서버 전송 → **부수 효과**)
2. 입력창을 비웁니다.

> ❓ `onSend` 호출은 리듀서 안과 이벤트 핸들러 중 어디에 있어야 할까요? 왜?
> ❓ "입력 비우기"를 위해 `edited_message`를 빈 문자열로 dispatch 하는 방법과 `sent_message`라는 새 action을 만드는 방법, 무엇이 더 나을까요? (공식 문서는 둘 다 가능하지만 **사용자가 한 일**을 나타내는 `sent_message`를 권합니다)

### 3단계 — 연락처별 입력 초안 유지
지금은 Alice에게 쓰던 글이 Bob을 선택해도 그대로 남아 있습니다.
state를 다음처럼 바꿔서 **연락처마다 초안을 따로** 기억하게 하세요.
```ts
type MessengerState = {
  selectedId: number;
  messages: Record<number, string>; // contactId → 초안
};
```
- 처음 상태: `{ selectedId: 0, messages: { 0: 'Hello, Taylor', 1: 'Hello, Alice', 2: 'Hello, Bob' } }`
- `changed_selection`은 더 이상 메시지를 비우지 않습니다.
- `edited_message`, `sent_message`는 **현재 선택된 연락처**의 초안만 바꿉니다.
- 💡 **리듀서만** 바꾸고 컴포넌트는 최소한으로 고치는 게 포인트입니다. 리듀서가 로직을 품고 있으면 UI는 거의 안 바뀝니다.

## 확인
```bash
npx vitest src/assignments/04-messenger
```
