import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import CodeMirror from '@uiw/react-codemirror';
import { useTheme } from './theme';
import { MOBILE_QUERY, useMediaQuery } from './useMediaQuery';

const extensions = [
  javascript({ jsx: true, typescript: true }),
  EditorView.theme({
    '&': { fontSize: 'var(--code-size)', height: '100%' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.65' },
    '.cm-gutters': { borderRight: '1px solid var(--border)' },
    '&.cm-focused': { outline: 'none' },
  }),
];

// 모바일에서는 긴 줄을 가로 스크롤 대신 화면 폭에서 줄바꿈
const mobileExtensions = [...extensions, EditorView.lineWrapping];

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  label: string;
};

export default function CodeEditor({ value, onChange, readOnly, label }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  return (
    <CodeMirror
      className="editor"
      aria-label={label}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={theme === 'dark' ? githubDark : githubLight}
      extensions={isMobile ? mobileExtensions : extensions}
      basicSetup={{ tabSize: 2, foldGutter: false }}
      height="100%"
    />
  );
}
