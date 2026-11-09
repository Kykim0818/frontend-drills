import type { SourceFiles } from './grader/compile';

/**
 * import.meta.glob 결과에서 한 폴더의 소스 파일만 골라 { 파일이름: 소스 } 로 만듭니다.
 * order 에 적힌 파일이 앞에 오고, 나머지는 이름순으로 뒤에 붙습니다. (README.md 는 제외)
 */
export function pickFiles(raw: Record<string, string>, dir: string, order: string[] = []): SourceFiles {
  const names = Object.keys(raw)
    .filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/') && !p.endsWith('.md'))
    .map((p) => p.slice(dir.length));
  const rank = (n: string) => (order.includes(n) ? order.indexOf(n) : order.length);
  names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return Object.fromEntries(names.map((n) => [n, raw[dir + n]]));
}
