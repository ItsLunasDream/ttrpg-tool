import { AssistantThread, type AiStatus } from './AssistantThread';
import { useT } from '../i18n';

export type { AiStatus };

interface Props {
  status: AiStatus | null;
  sendLinked: boolean;
  onToggleSendLinked: (value: boolean) => void;
  linkedCount: number;
}

/**
 * Der Assistent in der Sidebar. Dasselbe Gespraech steht in gross im
 * Schreibhilfe-Dialog, beide holen es aus demselben Kontext.
 */
export function AssistantPanel(props: Props) {
  const t = useT();

  return (
    <section className="panel">
      <h3 className="panel__title">{t('ai.title')}</h3>
      <AssistantThread {...props} variant="panel" />
    </section>
  );
}
