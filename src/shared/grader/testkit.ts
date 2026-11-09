/**
 * 브라우저에서 채점하기 위한 아주 작은 vitest 호환 테스트 도구.
 *
 * 앱 빌드에서는 vite.config.ts 의 alias 로 `import { describe, it, expect, vi } from 'vitest'`
 * 가 이 파일을 가리킵니다. 그래서 specs/*.suite.tsx 를 CLI(vitest)와 브라우저 양쪽에서 그대로 씁니다.
 *
 * 지원하는 matcher 는 아래 `matchers` 에 있는 것뿐입니다. 새 토픽에서 다른 matcher 가 필요하면 여기에 추가하세요.
 */

// ───────────────────────── 수집 / 실행 ─────────────────────────

type TestFn = () => void | Promise<void>;
export type CollectedTest = { name: string; fn: TestFn };

let collecting: CollectedTest[] | null = null;
const prefix: string[] = [];

export function describe(name: string, body: () => void) {
  prefix.push(name);
  try {
    body();
  } finally {
    prefix.pop();
  }
}

export function it(name: string, fn: TestFn) {
  if (!collecting) throw new Error('it()은 collectTests() 안에서만 호출할 수 있습니다.');
  collecting.push({ name: [...prefix, name].join(' › '), fn });
}
export const test = it;

/** suite 함수를 실행해서 it() 들을 모읍니다. */
export function collectTests(register: () => void): CollectedTest[] {
  collecting = [];
  try {
    register();
    return collecting;
  } finally {
    collecting = null;
  }
}

// ───────────────────────── 비교 ─────────────────────────

const ASYM = Symbol('asymmetric');
type Asymmetric = { [ASYM]: true; match: (v: unknown) => boolean; toString: () => string };

function isAsym(v: unknown): v is Asymmetric {
  return typeof v === 'object' && v !== null && ASYM in v;
}

export function equals(a: unknown, b: unknown): boolean {
  if (isAsym(b)) return b.match(a);
  if (isAsym(a)) return a.match(b);
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  // toEqual 처럼 undefined 값을 가진 키는 무시
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => equals((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function format(v: unknown, depth = 0): string {
  if (isAsym(v)) return v.toString();
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
  if (typeof Element !== 'undefined' && v instanceof Element) return `<${v.tagName.toLowerCase()}>`;
  if (v === undefined) return 'undefined';
  if (typeof v !== 'object' || v === null) return String(v);
  if (depth > 3) return Array.isArray(v) ? '[…]' : '{…}';
  if (Array.isArray(v)) return `[${v.map((x) => format(x, depth + 1)).join(', ')}]`;
  const entries = Object.entries(v).map(([k, x]) => `${k}: ${format(x, depth + 1)}`);
  return `{ ${entries.join(', ')} }`;
}

// ───────────────────────── mock ─────────────────────────

type AnyFn = (...args: any[]) => any;

export type Mock<F extends AnyFn = AnyFn> = F & {
  mock: { calls: Parameters<F>[]; results: unknown[] };
  _isMock: true;
  mockImplementation(fn: F): Mock<F>;
  mockImplementationOnce(fn: F): Mock<F>;
  mockReturnValue(v: ReturnType<F>): Mock<F>;
  mockReturnValueOnce(v: ReturnType<F>): Mock<F>;
  mockResolvedValue(v: Awaited<ReturnType<F>>): Mock<F>;
  mockResolvedValueOnce(v: Awaited<ReturnType<F>>): Mock<F>;
  mockRejectedValue(e: unknown): Mock<F>;
  mockRejectedValueOnce(e: unknown): Mock<F>;
  mockClear(): Mock<F>;
  mockRestore(): void;
};

function createMock<F extends AnyFn>(impl?: F, restore?: () => void): Mock<F> {
  let base: AnyFn | undefined = impl;
  const once: AnyFn[] = [];
  const mockFn = function (this: unknown, ...args: unknown[]) {
    mockFn.mock.calls.push(args as Parameters<F>);
    const f = once.shift() ?? base;
    const result = f ? f.apply(this, args) : undefined;
    mockFn.mock.results.push(result);
    return result;
  } as Mock<F>;
  mockFn.mock = { calls: [], results: [] };
  mockFn._isMock = true;
  mockFn.mockImplementation = (fn) => ((base = fn), mockFn);
  mockFn.mockImplementationOnce = (fn) => (once.push(fn), mockFn);
  mockFn.mockReturnValue = (v) => ((base = () => v), mockFn);
  mockFn.mockReturnValueOnce = (v) => (once.push(() => v), mockFn);
  mockFn.mockResolvedValue = (v) => ((base = () => Promise.resolve(v)), mockFn);
  mockFn.mockResolvedValueOnce = (v) => (once.push(() => Promise.resolve(v)), mockFn);
  mockFn.mockRejectedValue = (e) => ((base = () => Promise.reject(e)), mockFn);
  mockFn.mockRejectedValueOnce = (e) => (once.push(() => Promise.reject(e)), mockFn);
  mockFn.mockClear = () => ((mockFn.mock.calls = []), (mockFn.mock.results = []), mockFn);
  mockFn.mockRestore = () => restore?.();
  return mockFn;
}

const activeSpies = new Set<() => void>();

export const vi = {
  fn<F extends AnyFn = AnyFn>(impl?: F): Mock<F> {
    return createMock(impl);
  },
  spyOn<T extends object, K extends keyof T>(obj: T, key: K) {
    const original = obj[key] as unknown as AnyFn;
    const restore = () => {
      obj[key] = original as T[K];
      activeSpies.delete(restore);
    };
    const spy = createMock(function (this: unknown, ...args: unknown[]) {
      return original.apply(this, args);
    }, restore);
    obj[key] = spy as unknown as T[K];
    activeSpies.add(restore);
    return spy;
  },
  restoreAllMocks() {
    for (const r of [...activeSpies]) r();
  },
};

function isMock(v: unknown): v is Mock {
  return typeof v === 'function' && (v as Mock)._isMock === true;
}

// ───────────────────────── expect ─────────────────────────

export class AssertionError extends Error {}

function textOf(el: unknown): string {
  return ((el as Element)?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function valueOf(el: unknown): unknown {
  const input = el as HTMLInputElement;
  if (input.type === 'number') return input.value === '' ? null : Number(input.value);
  if (input.type === 'checkbox' || input.type === 'radio') return input.checked;
  return input.value;
}

type MatcherResult = { pass: boolean; message: () => string };
type Matcher = (received: unknown, ...args: any[]) => MatcherResult;

const matchers: Record<string, Matcher> = {
  toBe: (r, e) => ({
    pass: Object.is(r, e),
    message: () => `기대값: ${format(e)}\n실제값: ${format(r)}${equals(r, e) ? '\n(내용은 같지만 다른 참조입니다)' : ''}`,
  }),
  toEqual: (r, e) => ({ pass: equals(r, e), message: () => `기대값: ${format(e)}\n실제값: ${format(r)}` }),
  toStrictEqual: (r, e) => ({ pass: equals(r, e), message: () => `기대값: ${format(e)}\n실제값: ${format(r)}` }),
  toBeTruthy: (r) => ({ pass: !!r, message: () => `truthy 값을 기대했지만 ${format(r)}` }),
  toBeFalsy: (r) => ({ pass: !r, message: () => `falsy 값을 기대했지만 ${format(r)}` }),
  toBeNull: (r) => ({ pass: r === null, message: () => `null 을 기대했지만 ${format(r)}` }),
  toBeUndefined: (r) => ({ pass: r === undefined, message: () => `undefined 를 기대했지만 ${format(r)}` }),
  toBeDefined: (r) => ({ pass: r !== undefined, message: () => `값이 있어야 하는데 undefined` }),
  toContain: (r, e) => ({
    pass: typeof r === 'string' ? r.includes(e) : Array.isArray(r) && r.includes(e),
    message: () => `${format(r)} 에 ${format(e)} 가 포함되어야 합니다`,
  }),
  toHaveLength: (r, n) => ({
    pass: (r as { length?: number })?.length === n,
    message: () => `길이 ${n} 을 기대했지만 ${(r as { length?: number })?.length}`,
  }),
  toThrow: (r, expected?: string | RegExp) => {
    if (typeof r !== 'function') return { pass: false, message: () => 'expect() 에 함수를 넘겨야 합니다' };
    let thrown: unknown;
    let didThrow = false;
    try {
      r();
    } catch (e) {
      didThrow = true;
      thrown = e;
    }
    const msg = thrown instanceof Error ? thrown.message : String(thrown);
    const ok =
      didThrow &&
      (expected === undefined ||
        (typeof expected === 'string' ? msg.includes(expected) : expected.test(msg)));
    return {
      pass: ok,
      message: () =>
        didThrow
          ? `에러 메시지가 ${String(expected)} 와 맞지 않습니다\n실제 메시지: ${JSON.stringify(msg)}`
          : `에러가 발생해야 하는데 발생하지 않았습니다${expected ? ` (기대: ${String(expected)})` : ''}`,
    };
  },
  toHaveBeenCalled: (r) => {
    if (!isMock(r)) return { pass: false, message: () => 'mock 함수가 아닙니다' };
    return { pass: r.mock.calls.length > 0, message: () => `호출 횟수: ${r.mock.calls.length}` };
  },
  toHaveBeenCalledTimes: (r, n) => {
    if (!isMock(r)) return { pass: false, message: () => 'mock 함수가 아닙니다' };
    return { pass: r.mock.calls.length === n, message: () => `${n}번 호출을 기대했지만 ${r.mock.calls.length}번 호출됨` };
  },
  toHaveBeenCalledWith: (r, ...args) => {
    if (!isMock(r)) return { pass: false, message: () => 'mock 함수가 아닙니다' };
    return {
      pass: r.mock.calls.some((c) => equals(c, args)),
      message: () =>
        `인자 ${format(args)} 로 호출되어야 합니다\n실제 호출: ${r.mock.calls.map((c) => format(c)).join(', ') || '(없음)'}`,
    };
  },
  // ── DOM (jest-dom 호환 일부) ──
  toBeInTheDocument: (r) => ({
    pass: r instanceof Node && document.body.contains(r),
    message: () => `요소가 문서에 있어야 합니다`,
  }),
  toHaveTextContent: (r, e: string | RegExp) => {
    const text = textOf(r);
    return {
      pass: typeof e === 'string' ? text.includes(e) : e.test(text),
      message: () => `텍스트에 ${String(e)} 가 있어야 합니다\n실제 텍스트: ${JSON.stringify(text)}`,
    };
  },
  toHaveValue: (r, e) => {
    const v = valueOf(r);
    return { pass: equals(v, e), message: () => `값 ${format(e)} 을 기대했지만 ${format(v)}` };
  },
  toBeChecked: (r) => ({
    pass: !!(r as HTMLInputElement).checked,
    message: () => `체크되어 있어야 합니다`,
  }),
  toBeDisabled: (r) => ({
    pass: !!(r as HTMLButtonElement).disabled,
    message: () => `비활성화되어 있어야 합니다`,
  }),
};

type Assertions = Record<string, (...args: any[]) => void> & { not: Record<string, (...args: any[]) => void> };

export function expect(received: unknown): Assertions {
  const make = (negate: boolean) =>
    Object.fromEntries(
      Object.entries(matchers).map(([name, m]) => [
        name,
        (...args: unknown[]) => {
          const { pass, message } = m(received, ...args);
          if (pass === negate) {
            throw new AssertionError(`expect(…)${negate ? '.not' : ''}.${name} 실패\n${negate ? '(반대여야 함) ' : ''}${message()}`);
          }
        },
      ]),
    );
  const a = make(false) as Assertions;
  a.not = make(true);
  return a;
}

expect.objectContaining = (shape: Record<string, unknown>): Asymmetric => ({
  [ASYM]: true,
  match: (v) =>
    typeof v === 'object' && v !== null && Object.entries(shape).every(([k, x]) => equals((v as Record<string, unknown>)[k], x)),
  toString: () => `objectContaining(${format(shape)})`,
});
expect.any = (ctor: unknown): Asymmetric => ({
  [ASYM]: true,
  match: (v) =>
    ctor === Number ? typeof v === 'number' : ctor === String ? typeof v === 'string' : ctor === Function ? typeof v === 'function' : v instanceof (ctor as never),
  toString: () => `any(${(ctor as { name?: string })?.name})`,
});

// 브라우저 채점기는 테스트마다 자동으로 cleanup / restoreAllMocks 를 합니다.
// beforeEach / afterEach 는 지원하지 않으니 suite 안에서는 각 it() 안에서 준비 코드를 쓰세요.
export function beforeEach(): never {
  throw new Error('브라우저 채점기는 beforeEach 를 지원하지 않습니다.');
}
export function afterEach(): never {
  throw new Error('브라우저 채점기는 afterEach 를 지원하지 않습니다.');
}
