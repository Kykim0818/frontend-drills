import { useSyncExternalStore } from 'react';

/**
 * 테마: 'system'(OS 설정 따름) | 'light' | 'dark'
 * <html data-theme="light|dark"> 로 적용하고, CSS 는 이 속성에 따라 색 토큰을 바꿉니다.
 * 첫 화면 깜빡임을 막기 위해 index.html 의 인라인 스크립트가 같은 일을 먼저 합니다.
 */
export type ThemePref = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const KEY = 'frontend-drills:theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

let pref: ThemePref = readPref();
const listeners = new Set<() => void>();

const resolve = (p: ThemePref): Theme => (p === 'system' ? (media.matches ? 'dark' : 'light') : p);

function apply() {
  document.documentElement.dataset.theme = resolve(pref);
  listeners.forEach((l) => l());
}

media.addEventListener('change', () => pref === 'system' && apply());
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    pref = readPref();
    apply();
  }
});

export function setThemePref(next: ThemePref) {
  pref = next;
  try {
    if (next === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* 무시 */
  }
  apply();
}

const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));

export function useThemePref(): ThemePref {
  return useSyncExternalStore(subscribe, () => pref);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => resolve(pref));
}

apply();
