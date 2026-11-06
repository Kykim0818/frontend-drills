/**
 * 객체를 깊게 얼립니다. 얼린 state를 리듀서에 넣었을 때 리듀서가 state를 직접 변경(mutation)하면
 * strict mode의 ES 모듈에서는 TypeError가 발생하므로, "불변성 위반"을 테스트로 잡아낼 수 있습니다.
 */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
