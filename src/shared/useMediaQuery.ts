import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
  );
}

/** 이 너비보다 좁으면 패널 레이아웃 대신 세로로 쌓는 모바일 레이아웃 */
export const MOBILE_QUERY = '(max-width: 900px)';
