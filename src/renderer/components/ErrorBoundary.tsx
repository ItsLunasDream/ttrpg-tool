import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Faengt Fehler der Oberflaeche ab. Ohne dieses Netz zeigt Electron nach einem
 * Fehler ein leeres Fenster, und die Nutzerin haette keinen Weg zurueck.
 *
 * Bewusst ohne Uebersetzung: der Fehler kann aus der Sprachschicht selbst
 * kommen, dann waere ein Uebersetzungsaufruf hier der naechste Absturz.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Fehler in der Oberfläche', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="crash">
        <h1>Da ist etwas schiefgegangen</h1>
        <p>
          Deine Notizen liegen als Dateien auf der Platte und sind davon nicht betroffen. Zuletzt gespeicherte Änderungen
          sind erhalten.
        </p>
        <pre>{error.message}</pre>
        <div className="modal__actions">
          <button type="button" className="primary" onClick={() => window.location.reload()}>
            Neu laden
          </button>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Weitermachen
          </button>
        </div>
        <p className="modal__hint">
          Hilft das Neuladen nicht, öffne den Speicherort über die Einstellungen und sieh dort nach den Dateien.
        </p>
      </div>
    );
  }
}
