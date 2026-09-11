import { useEffect, useRef, useState } from 'react';
import type { AiTask } from '../../shared/types';
import { useAssistant } from '../assistant';
import { useT } from '../i18n';

export interface AiStatus {
  provider: string;
  ready: boolean;
  detail: string;
  hasKey: boolean;
  /** Ob eine Huelle die KI fuehrt. Dann wird sie nicht hier eingerichtet. */
  managedByShell: boolean;
}

interface Props {
  status: AiStatus | null;
  /**
   * `chat` ist die grosse Fassung im Schreibhilfe-Dialog: mit abgesetzten
   * Blasen und mitlaufendem Bildlauf. `panel` ist die schmale Sidebar.
   */
  variant: 'panel' | 'chat';
}

const TASKS: { task: AiTask; key: 'ai.questions' | 'ai.consistency' | 'ai.style' }[] = [
  { task: 'questions', key: 'ai.questions' },
  { task: 'consistency', key: 'ai.consistency' },
  { task: 'style', key: 'ai.style' }
];

/**
 * Das Gespraech mit dem Assistenten. Der Text der Notiz wird nie angefasst:
 * das Schreiben bleibt bei der Autorin.
 *
 * Rueckfragen schicken den bisherigen Verlauf mit. Der Knopf einer Aufgabe
 * faengt dagegen bewusst neu an, damit ein alter Faden nicht unbemerkt
 * weiterlaeuft.
 */
export function AssistantThread({ status, variant }: Props) {
  const t = useT();
  const { messages, streaming, busy, start, followUp, clear } = useAssistant();
  const [question, setQuestion] = useState('');
  const end = useRef<HTMLDivElement>(null);

  // In der grossen Fassung dem Gespraech nachlaufen, sonst muesste man
  // waehrend der Antwort von Hand scrollen.
  useEffect(() => {
    if (variant === 'chat') end.current?.scrollIntoView({ block: 'end' });
  }, [variant, messages, streaming]);

  const disabled = !status || status.provider === 'none';
  if (disabled) return <p className="panel__empty">{t('ai.disabled')}</p>;

  function send() {
    followUp(question);
    setQuestion('');
  }

  return (
    <div className={variant === 'chat' ? 'assistant assistant--chat' : 'assistant'}>
      <p className={`panel__hint${status.ready ? '' : ' assistant__warning'}`}>
        {status.ready ? t('ai.ready', { detail: status.detail }) : t('ai.notReady', { detail: status.detail })}
      </p>

      <div className="assistant__actions">
        {TASKS.map((entry) => (
          <button key={entry.task} type="button" disabled={busy || !status.ready} onClick={() => start(entry.task)}>
            {t(entry.key)}
          </button>
        ))}
      </div>

      <div className="assistant__thread">
        {messages.map((message, position) => (
          <div className={`assistant__turn assistant__turn--${message.role}`} key={position}>
            <span className="assistant__role">{t(message.role === 'user' ? 'ai.you' : 'ai.assistant')}</span>
            <div className="assistant__answer">{message.content}</div>
          </div>
        ))}

        {busy && !streaming ? <p className="panel__hint">{t('ai.thinking')}</p> : null}

        {streaming ? (
          <div className="assistant__turn assistant__turn--assistant">
            <span className="assistant__role">{t('ai.assistant')}</span>
            <div className="assistant__answer is-streaming">{streaming}</div>
          </div>
        ) : null}

        <div ref={end} />
      </div>

      {messages.length > 0 && !busy ? (
        <>
          <div className="assistant__followUp">
            <input
              value={question}
              placeholder={t('ai.followUp')}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <button type="button" disabled={!question.trim()} onClick={send}>
              {t('ai.send')}
            </button>
          </div>

          <button type="button" className="link-button" onClick={clear}>
            {t('ai.clear')}
          </button>
          <p className="panel__hint assistant__note">{t('ai.historyHint')}</p>
        </>
      ) : null}

      <p className="panel__hint assistant__note">{t('ai.hint')}</p>
    </div>
  );
}
