import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as JSXRuntime from 'react/jsx-runtime';
import { transform } from 'sucrase';

/** 파일 이름 → 소스 코드. 예: { 'reducer.ts': '...', 'Counter.tsx': '...' } */
export type SourceFiles = Record<string, string>;
/** 모듈 이름(확장자 없음) → exports. 예: { reducer: {...}, Counter: { default: fn } } */
export type Modules = Record<string, any>;

export class CompileError extends Error {
  constructor(
    public file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
  }
}

const asModule = (ns: object) => ({ ...ns, default: (ns as { default?: unknown }).default ?? ns, __esModule: true });

/** 학습자 코드에서 import 할 수 있는 외부 패키지 */
const externals: Record<string, unknown> = {
  react: asModule(React),
  'react/jsx-runtime': asModule(JSXRuntime),
  'react-dom': asModule(ReactDOM),
  'react-dom/client': asModule(ReactDOMClient),
};

const EXT = ['', '.ts', '.tsx', '.js', '.jsx'];
export const moduleName = (file: string) => file.replace(/\.(tsx?|jsx?)$/, '');

/**
 * TypeScript/JSX 소스들을 브라우저에서 변환하고 CommonJS 방식으로 실행해서 exports 를 돌려줍니다.
 * 같은 폴더의 './xxx' import 와 react 계열 패키지만 허용합니다.
 */
export function loadModules(files: SourceFiles): Modules {
  const compiled: Record<string, string> = {};
  for (const [file, source] of Object.entries(files)) {
    try {
      compiled[file] = transform(source, {
        transforms: ['typescript', 'jsx', 'imports'],
        jsxRuntime: 'automatic',
        production: true,
        filePath: file,
      }).code;
    } catch (e) {
      throw new CompileError(file, e instanceof Error ? e.message : String(e));
    }
  }

  const cache: Record<string, { exports: any }> = {};

  function resolveFile(spec: string, from: string): string {
    if (!spec.startsWith('./')) {
      throw new CompileError(from, `'${spec}' 는 import 할 수 없습니다. (react, react-dom, 같은 폴더의 './파일' 만 가능)`);
    }
    const base = spec.slice(2);
    const hit = EXT.map((ext) => base + ext).find((f) => f in compiled);
    if (!hit) throw new CompileError(from, `'${spec}' 파일을 찾을 수 없습니다.`);
    return hit;
  }

  function load(file: string): any {
    if (cache[file]) return cache[file].exports; // 순환 import 대비: 실행 중인 모듈도 반환
    const module = { exports: {} as any };
    cache[file] = module;
    const require = (spec: string) => (spec in externals ? externals[spec] : load(resolveFile(spec, file)));
    try {
      new Function('require', 'module', 'exports', compiled[file])(require, module, module.exports);
    } catch (e) {
      if (e instanceof CompileError) throw e;
      throw new CompileError(file, `실행 중 에러 — ${e instanceof Error ? e.message : String(e)}`);
    }
    return module.exports;
  }

  const modules: Modules = {};
  for (const file of Object.keys(compiled)) modules[moduleName(file)] = load(file);
  return modules;
}
