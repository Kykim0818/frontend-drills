import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import { useSyncExternalStore } from 'react';

const extensions = [javascript({ jsx: true, typescript: true })];

const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function useDarkMode() {
  return useSyncExternalStore(
    (cb) => {
      darkQuery?.addEventListener('change', cb);
      return () => darkQuery?.removeEventListener('change', cb);
    },
    () => darkQuery?.matches ?? false,
  );
}

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  label: string;
};

export default function CodeEditor({ value, onChange, readOnly, label }: Props) {
  const dark = useDarkMode();
  return (
    <CodeMirror
      className="editor"
      aria-label={label}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={dark ? 'dark' : 'light'}
      extensions={extensions}
      basicSetup={{ tabSize: 2, foldGutter: false }}
      height="440px"
    />
  );
}
