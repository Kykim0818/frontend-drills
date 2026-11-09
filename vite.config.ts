/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isVitest = !!process.env.VITEST;

export default defineConfig(({ command }) => ({
  // GitHub Pages(https://<user>.github.io/<repo>/) 에서도 동작하도록 상대 경로 + 해시 라우팅 사용
  base: './',
  // 배포 빌드에서도 React "개발 빌드"를 씁니다.
  //  - 채점에 쓰는 act() 는 React 개발 빌드에만 있음
  //  - Strict Mode 의 두 번 호출, key 경고 등 학습에 필요한 개발 모드 동작을 그대로 보여주기 위해
  define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('development') } : undefined,
  plugins: [react()],
  resolve: {
    // 앱(브라우저)에서는 specs/*.suite.tsx 의 `from 'vitest'` 를 브라우저용 테스트 도구로 바꿔치기
    alias: isVitest ? ({} as Record<string, string>) : { vitest: fileURLToPath(new URL('./src/shared/grader/testkit.ts', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        grader: fileURLToPath(new URL('./grader.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
}));
