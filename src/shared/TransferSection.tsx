import { useRef, useState } from 'react';
import {
  applyBackup,
  createBackup,
  decodeTransfer,
  encodeTransfer,
  parseBackup,
  type Backup,
  type ImportMode,
} from './progress';

type Status = { kind: 'ok' | 'error'; text: string } | null;

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TransferSection() {
  const [mode, setMode] = useState<ImportMode>('merge');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExportFile() {
    const date = new Date().toISOString().slice(0, 10);
    download(`frontend-drills-backup-${date}.json`, JSON.stringify(createBackup(), null, 2));
    setStatus({ kind: 'ok', text: '백업 파일을 내려받았어요. 다른 기기에서 "파일 가져오기"로 불러오세요.' });
  }

  async function handleCopyCode() {
    try {
      const text = await encodeTransfer(createBackup());
      try {
        await navigator.clipboard.writeText(text);
        setStatus({ kind: 'ok', text: `옮기기 코드를 복사했어요 (${text.length.toLocaleString()}자). 다른 기기에 붙여넣으세요.` });
      } catch {
        setCode(text);
        setStatus({ kind: 'ok', text: '클립보드 복사가 막혀 있어요. 아래 칸의 코드를 직접 복사하세요.' });
      }
    } catch (e) {
      setStatus({ kind: 'error', text: `코드를 만들지 못했어요: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  function restore(backup: Backup) {
    if (mode === 'replace' && !confirm('지금 브라우저의 진행 상황과 작성한 코드를 모두 지우고 백업으로 바꿀까요?')) return;
    const s = applyBackup(backup, mode);
    const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : '알 수 없음';
    setStatus({
      kind: 'ok',
      text: `✅ ${mode === 'merge' ? '합쳤어요' : '덮어썼어요'} — ${when}에 만든 백업 (퀴즈 답 ${s.quiz}개, 과제 점수 ${s.assignments}개, 코드 ${s.code}개 적용)`,
    });
  }

  async function handleImportFile(file: File) {
    try {
      restore(parseBackup(JSON.parse(await file.text())));
    } catch (e) {
      setStatus({ kind: 'error', text: `가져오지 못했어요: ${e instanceof SyntaxError ? 'JSON 파일이 아닙니다.' : e instanceof Error ? e.message : String(e)}` });
    }
  }

  async function handleImportCode() {
    try {
      restore(await decodeTransfer(code));
      setCode('');
    } catch (e) {
      setStatus({ kind: 'error', text: `가져오지 못했어요: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  return (
    <section className="card">
      <h3>💾 다른 기기로 옮기기</h3>
      <p className="muted small-text">퀴즈 답, 과제 점수, 작성 중인 코드를 모두 옮겨요.</p>

      <h4>보내기</h4>
      <div className="row">
        <button className="primary" onClick={handleExportFile}>
          ⬇ 백업 파일 내려받기
        </button>
        <button onClick={handleCopyCode}>📋 옮기기 코드 복사</button>
      </div>
      <p className="muted small-text">
        파일이 가장 확실해요. 휴대폰처럼 파일 옮기기가 번거로우면 옮기기 코드를 메신저나 메모로 보내세요.
      </p>

      <h4>가져오기</h4>
      <div className="row kind">
        <label>
          <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} /> 합치기 (추천)
        </label>
        <label>
          <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} /> 덮어쓰기
        </label>
      </div>
      <p className="muted small-text">
        {mode === 'merge'
          ? '과제는 더 높은 점수, 코드는 더 최근에 고친 쪽, 퀴즈는 안 푼 문제의 답만 가져와요.'
          : '지금 브라우저의 기록을 지우고 백업 내용으로 바꿔요.'}
      </p>
      <div className="row">
        <button onClick={() => fileRef.current?.click()}>📂 백업 파일 가져오기</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          aria-label="백업 파일"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = '';
          }}
        />
      </div>
      <textarea
        className="transfer-code"
        aria-label="옮기기 코드"
        rows={3}
        placeholder="옮기기 코드(FD1. 로 시작)를 여기에 붙여넣으세요"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <div className="row">
        <button disabled={!code.trim()} onClick={handleImportCode}>
          코드로 가져오기
        </button>
      </div>

      {status && (
        <p role="status" className={status.kind === 'ok' ? 'transfer-status ok' : 'transfer-status ng'}>
          {status.text}
        </p>
      )}
    </section>
  );
}
