import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AiMessage, AiTask } from '../main/ai/provider';

/** Was der Assistent gerade weiss und tut. */
export interface Assistant {
  messages: AiMessage[];
  /** Teiltext der laufenden Antwort, null wenn keine laeuft. */
  streaming: string | null;
  busy: boolean;
  /** Eine der drei Aufgaben, faengt ein neues Gespraech an. */
  start: (task: AiTask) => void;
  /** Rueckfrage im laufenden Gespraech. */
  followUp: (question: string) => void;
  clear: () => void;
}

const AssistantContext = createContext<Assistant | null>(null);

interface Props {
  /**
   * Die offene Notiz. Als Kontext geht immer sie mit, ein Verlauf ueber eine
   * andere haette das Modell in die Irre gefuehrt. Deshalb faengt das
   * Gespraech beim Wechsel von vorn an.
   */
  noteId: string | null;
  onAsk: (
    task: AiTask,
    history: AiMessage[],
    question: string,
    onChunk: (text: string) => void
  ) => Promise<string | null>;
  children: ReactNode;
}

/**
 * Haelt das Gespraech mit dem Assistenten an einer Stelle, damit die Sidebar
 * und der grosse Bereich in der Schreibhilfe dasselbe zeigen. Laege es in
 * einer der beiden, stuende in der anderen etwas anderes.
 */
export function AssistantProvider({ noteId, onAsk, children }: Props) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessages([]);
    setStreaming(null);
  }, [noteId]);

  const ask = useCallback(
    (task: AiTask, history: AiMessage[], question: string) => {
      setBusy(true);
      setStreaming('');
      setMessages(history);

      void (async () => {
        try {
          const answer = await onAsk(task, history, question, (chunk) =>
            setStreaming((previous) => (previous ?? '') + chunk)
          );
          // Bei einem Fehler kommt null zurueck. Dann bleibt der Verlauf, wie
          // er war, statt eine leere Antwort aufzunehmen.
          setMessages(answer === null ? history : [...history, { role: 'assistant', content: answer }]);
        } finally {
          setStreaming(null);
          setBusy(false);
        }
      })();
    },
    [onAsk]
  );

  const value = useMemo<Assistant>(
    () => ({
      messages,
      streaming,
      busy,
      start: (task) => ask(task, [], ''),
      followUp: (question) => {
        const trimmed = question.trim();
        if (!trimmed || busy) return;
        ask('questions', [...messages, { role: 'user', content: trimmed }], trimmed);
      },
      clear: () => setMessages([])
    }),
    [messages, streaming, busy, ask]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant(): Assistant {
  const value = useContext(AssistantContext);
  if (!value) throw new Error('useAssistant ausserhalb von AssistantProvider');
  return value;
}
