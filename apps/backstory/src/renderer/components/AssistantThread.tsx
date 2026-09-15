import { Fragment, useEffect, useRef, useState } from 'react';
import type { AiTask } from '../../shared/types';
import { leseAntwort, type Stueck } from '../../shared/antwortMarkdown';
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
  /** Ob die verlinkten Notizen als Kontext mitgehen. */
  sendLinked: boolean;
  onToggleSendLinked: (value: boolean) => void;
  /** Wie viele Notizen das gerade waeren. */
  linkedCount: number;
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
 * Die Antwort mit ihrer Auszeichnung.
 *
 * Aus Bausteinen gebaut, nicht aus HTML: die Antwort kommt von einem
 * Sprachmodell, und was daraus kommt, wird nie als Markup eingesetzt.
 */
function Stuecke({ stuecke }: { stuecke: Stueck[] }) {
  return (
    <>
      {stuecke.map((stueck, position) => {
        if (stueck.art === 'fett') return <strong key={position}>{stueck.text}</strong>;
        if (stueck.art === 'kursiv') return <em key={position}>{stueck.text}</em>;
        if (stueck.art === 'code') return <code key={position}>{stueck.text}</code>;
        return <Fragment key={position}>{stueck.text}</Fragment>;
      })}
    </>
  );
}

function Antwort({ text, className }: { text: string; className: string }) {
  return (
    <div className={className}>
      {leseAntwort(text).map((baustein, position) => {
        if (baustein.art === 'code') {
          return (
            <pre className="assistant__code" key={position}>
              {baustein.text}
            </pre>
          );
        }

        if (baustein.art === 'ueberschrift') {
          return (
            <p className="assistant__heading" key={position}>
              <Stuecke stuecke={baustein.stuecke} />
            </p>
          );
        }

        if (baustein.art === 'liste') {
          const punkte = baustein.punkte.map((punkt, stelle) => (
            <li key={stelle}>
              <Stuecke stuecke={punkt} />
            </li>
          ));
          return baustein.nummeriert ? <ol key={position}>{punkte}</ol> : <ul key={position}>{punkte}</ul>;
        }

        return (
          <p key={position}>
            <Stuecke stuecke={baustein.stuecke} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * Das Gespraech mit dem Assistenten. Der Text der Notiz wird nie angefasst:
 * das Schreiben bleibt bei der Autorin.
 *
 * Rueckfragen schicken den bisherigen Verlauf mit. Der Knopf einer Aufgabe
 * faengt dagegen bewusst neu an, damit ein alter Faden nicht unbemerkt
 * weiterlaeuft.
 */
export function AssistantThread({ status, variant, sendLinked, onToggleSendLinked, linkedCount }: Props) {
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

      {/* Was mitgeht, soll dastehen. Sonst weiss niemand, was er da an ein
          kostenpflichtiges Modell verschickt. */}
      <label className="assistant__context">
        <input
          type="checkbox"
          checked={sendLinked}
          onChange={(event) => onToggleSendLinked(event.target.checked)}
        />
        <span>{t('ai.sendLinked', { count: linkedCount })}</span>
      </label>

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
            <Antwort className="assistant__answer" text={message.content} />
          </div>
        ))}

        {busy && !streaming ? <p className="panel__hint">{t('ai.thinking')}</p> : null}

        {streaming ? (
          <div className="assistant__turn assistant__turn--assistant">
            <span className="assistant__role">{t('ai.assistant')}</span>
            <Antwort className="assistant__answer is-streaming" text={streaming} />
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
