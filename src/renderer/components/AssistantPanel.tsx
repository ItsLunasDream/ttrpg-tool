import { useState } from 'react';
import type { AiMessage, AiTask } from '../../main/ai/provider';
import { useT } from '../i18n';

export interface AiStatus {
  provider: string;
  ready: boolean;
  detail: string;
  hasKey: boolean;
}

interface Props {
  status: AiStatus | null;
  /**
   * `onChunk` wird waehrend der Antwort mehrfach mit Teiltexten gerufen.
   * `history` ist der bisherige Verlauf, `followUp` eine Rueckfrage.
   */
  onAsk: (
    task: AiTask,
    history: AiMessage[],
    followUp: string,
    onChunk: (text: string) => void
  ) => Promise<string | null>;
}

const TASKS: { task: AiTask; key: 'ai.questions' | 'ai.consistency' | 'ai.style' }[] = [
  { task: 'questions', key: 'ai.questions' },
  { task: 'consistency', key: 'ai.consistency' },
  { task: 'style', key: 'ai.style' }
];

/**
 * Sidebar-Assistent. Er antwortet in den Bereich unter den Knoepfen, der Text
 * der Notiz wird nie angefasst: das Schreiben bleibt bei der Autorin.
 *
 * Rueckfragen schicken den bisherigen Verlauf mit. Der erste Knopf einer
 * Aufgabe faengt dagegen bewusst neu an, damit ein alter Faden nicht
 * unbemerkt weiterlaeuft.
 */
export function AssistantPanel({ status, onAsk }: Props) {
  const t = useT();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [busy, setBusy] = useState(false);

  const disabled = !status || status.provider === 'none';

  async function ask(task: AiTask, history: AiMessage[], question: string) {
    setBusy(true);
    setStreaming('');
    try {
      const answer = await onAsk(task, history, question, (chunk) =>
        setStreaming((previous) => (previous ?? '') + chunk)
      );
      setMessages(answer === null ? history : [...history, { role: 'assistant', content: answer }]);
    } finally {
      setStreaming(null);
      setBusy(false);
    }
  }

  function sendFollowUp() {
    const question = followUp.trim();
    if (!question || busy) return;
    setFollowUp('');
    void ask('questions', [...messages, { role: 'user', content: question }], question);
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
              <button
                key={entry.task}
                type="button"
                disabled={busy || !status.ready}
                onClick={() => void ask(entry.task, [], '')}
              >
                {t(entry.key)}
              </button>
            ))}
          </div>

          {busy && !streaming ? <p className="panel__hint">{t('ai.thinking')}</p> : null}

          {messages.map((message, position) => (
            <div className="assistant__turn" key={position}>
              <span className="assistant__role">{t(message.role === 'user' ? 'ai.you' : 'ai.assistant')}</span>
              <div className="assistant__answer">{message.content}</div>
            </div>
          ))}

          {streaming ? (
            <div className="assistant__turn">
              <span className="assistant__role">{t('ai.assistant')}</span>
              <div className="assistant__answer is-streaming">{streaming}</div>
            </div>
          ) : null}

          {messages.length > 0 && !busy ? (
            <>
              <div className="assistant__followUp">
                <input
                  value={followUp}
                  placeholder={t('ai.followUp')}
                  onChange={(event) => setFollowUp(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      sendFollowUp();
                    }
                  }}
                />
                <button type="button" disabled={!followUp.trim()} onClick={sendFollowUp}>
                  {t('ai.send')}
                </button>
              </div>

              <button type="button" className="link-button" onClick={() => setMessages([])}>
                {t('ai.clear')}
              </button>
              <p className="panel__hint assistant__note">{t('ai.historyHint')}</p>
            </>
          ) : null}

          <p className="panel__hint assistant__note">{t('ai.hint')}</p>
        </>
      )}
    </section>
  );
}
