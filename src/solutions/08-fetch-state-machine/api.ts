export type User = { id: number; name: string };

/** 데모용 가짜 API. userId가 0이면 실패합니다. */
export function fakeFetchUser(userId: number): Promise<User> {
  const names = ['???', 'Taylor', 'Alice', 'Bob'];
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 0) reject(new Error('사용자를 찾을 수 없습니다'));
      else resolve({ id: userId, name: names[userId] ?? `User ${userId}` });
    }, 400 + Math.random() * 600);
  });
}
