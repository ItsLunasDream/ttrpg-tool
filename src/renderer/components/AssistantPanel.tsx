import { useState } from 'react';
import type { AiTask } from '../../main/ai/provider';
import { useT } from '../i18n';

export interface AiStatus {
  provider: string;
  ready: boolean;
  detail: string;
  hasKey: boolean;
}

interface Props {
  status: AiStatus | null;
  onAsk: (task: AiTask) => Promise<string | null>;
}

const TASKS: { task: AiTask; key: 'ai.questions' | 'ai.consistency' | 'ai.style' }[] = [
  { task: 'questions', key: 'ai.questions' },
  { task: 'consistency', key: 'ai.consistency' },
  { task: 'style', key: 'ai.style' }
];

/**
 * Sidebar-Assistent. Er antwortet in den Bereich unter den Knoepfen, der Text
 * der Notiz wird nie angefasst: das Schreiben bleibt bei der Autorin.
 */
export function AssistantPanel({ status, onAsk }: Props) {
  const t = useT();
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const disabled = !status || status.provider === 'none';

  async function ask(task: AiTask) {
    setBusy(true);
    setAnswer(null);
    try {
      setAnswer(await onAsk(task));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h3 className="panel__title">{t('ai.title')}</h3>

      {disabled ? (
        <p className="panel__empty">{t('ai.disabled')}</p>
      ) : (
        <>
          <p className={`panel__hint${status.ready ? '' : ' assistant__warning'}`}>
            {status.ready ? t('ai.ready', { detail: status.detail }) : t('ai.notReady', { detail: status.detail })}
          </p>

          <div className="assistant__actions">
            {TASKS.map((entry) => (
              <button key={entry.task} type="button" disabled={busy || !status.ready} onClick={() => void ask(entry.task)}>
                {t(entry.key)}
              </button>
            ))}
          </div>

          {busy ? <p className="panel__hint">{t('ai.thinking')}</p> : null}

          {answer ? (
            <>
              <div className="assistant__answer">{answer}</div>
              <button type="button" className="link-button" onClick={() => setAnswer(null)}>
                {t('ai.clear')}
              </button>
            </>
          ) : null}

          <p className="panel__hint assistant__note">{t('ai.hint')}</p>
        </>
      )}
    </section>
  );
}
