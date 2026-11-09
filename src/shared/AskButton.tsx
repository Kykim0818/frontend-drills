import { useRef, useState } from 'react';
import { buildIssueUrl, questionsListUrl, type AskContext, type AskKind } from './ask';

type Props = {
  /** 버튼을 누르는 순간의 문맥 (최신 코드/답을 담기 위해 함수로 받음) */
  getContext: () => AskContext;
  label?: string;
  className?: string;
};

/**
 * "질문하기" 버튼 + 다이얼로그.
 * 서버가 없으므로 내용을 채운 GitHub "새 이슈" 페이지를 새 탭으로 엽니다. (GitHub 로그인 필요)
 */
export default function AskButton({ getContext, label = '❓ 질문하기', className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [ctx, setCtx] = useState<AskContext | null>(null);
  const [kind, setKind] = useState<AskKind>('question');
  const [text, setText] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  function open() {
    setCtx(getContext());
    setShowDetails(false);
    dialogRef.current?.showModal();
  }

  function submit() {
    if (!ctx) return;
    window.open(buildIssueUrl(kind, ctx, text), '_blank', 'noopener');
    setText('');
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className={className ?? 'ask-button'} onClick={open}>
        {label}
      </button>
      <dialog ref={dialogRef} className="ask-dialog" onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}>
        {ctx && (
          <form
            method="dialog"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <h3>질문 남기기</h3>
            <p className="muted small-text">📍 {ctx.where}</p>

            <div className="row kind">
              <label>
                <input type="radio" checked={kind === 'question'} onChange={() => setKind('question')} /> ❓ 이해가 안 돼요
              </label>
              <label>
                <input type="radio" checked={kind === 'content-error'} onChange={() => setKind('content-error')} /> 🐞 내용이
                틀린 것 같아요
              </label>
            </div>

            <textarea
              aria-label="질문 내용"
              autoFocus
              required
              rows={6}
              placeholder={
                kind === 'question'
                  ? '무엇이 이해가 안 되나요? 내가 어떻게 생각했는지도 적어주면 답하기 쉬워요.'
                  : '어떤 부분이 왜 틀린 것 같은지 적어주세요.'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button type="button" className="link-button" onClick={() => setShowDetails((v) => !v)}>
              {showDetails ? '▾' : '▸'} 함께 첨부되는 정보 보기
            </button>
            {showDetails && <pre className="ask-details">{ctx.details}</pre>}

            <p className="muted small-text">
              <strong>GitHub 이슈</strong>로 올라갑니다. 새 탭에서 내용을 확인하고 <strong>Create</strong>를 누르면 끝! (GitHub
              로그인 필요)
            </p>
            <div className="row actions">
              <a href={questionsListUrl} target="_blank" rel="noreferrer" className="muted small-text">
                다른 질문 보기 ↗
              </a>
              <span className="spacer" />
              <button type="button" onClick={() => dialogRef.current?.close()}>
                취소
              </button>
              <button type="submit" className="primary" disabled={!text.trim()}>
                GitHub에 올리기 ↗
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
