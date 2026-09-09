/**
 * Auffangnetz für Render-Fehler.
 *
 * Ohne das wirft React bei einer Ausnahme den gesamten Baum weg und die Seite
 * wird schlicht leer — ohne jeden Hinweis, was passiert ist.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: '' };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ui] Render-Fehler:', error, info.componentStack);
    this.setState({ info: info.componentStack ?? '' });
  }

  render(): ReactNode {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    // Klassenkomponente, darum kein Hook: t() liest die aktuelle Sprache direkt.
    return (
      <div className="crash">
        <h2>{t('crash.title')}</h2>
        <p className="hint">{t('crash.body')}</p>
        <pre>{error.message}</pre>
        {info ? <pre className="stack">{info.trim().split('\n').slice(0, 12).join('\n')}</pre> : null}
        <button onClick={() => this.setState({ error: null, info: '' })}>{t('crash.retry')}</button>
      </div>
    );
  }
}
