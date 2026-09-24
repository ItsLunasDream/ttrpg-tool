/**
 * Der Statblock eines Teilnehmers, per Klick auf 📜 in der Zeile.
 *
 * Er kommt als Markdown aus dem Encounter Creator (SRD-Monster und eigene
 * aus dem Monster Creator). Gerendert wird nur, was ein Statblock braucht:
 * Ueberschriften, Absaetze, fett und kursiv. Alles andere bleibt Text —
 * es gibt kein HTML, das hier hineinrutschen koennte.
 */
import { Fragment, useEffect, type ReactNode } from 'react';
import { t } from './i18n';

function inline(text: string): ReactNode[] {
  const teile: ReactNode[] = [];
  const muster = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let rest = 0;
  let treffer: RegExpExecArray | null;
  let n = 0;
  while ((treffer = muster.exec(text))) {
    if (treffer.index > rest) teile.push(text.slice(rest, treffer.index));
    if (treffer[2]) teile.push(<b key={n++}><i>{treffer[2]}</i></b>);
    else if (treffer[3]) teile.push(<b key={n++}>{treffer[3]}</b>);
    else if (treffer[4]) teile.push(<i key={n++}>{treffer[4]}</i>);
    rest = treffer.index + treffer[0].length;
  }
  if (rest < text.length) teile.push(text.slice(rest));
  return teile;
}

function Bloecke({ markdown }: { readonly markdown: string }) {
  const bloecke = markdown.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {bloecke.map((block, i) => {
        const kopf = /^(#{1,4})\s+(.*)$/.exec(block);
        if (kopf) {
          const stufe = Math.min(4, kopf[1].length + 1);
          const Tag = `h${stufe}` as 'h2' | 'h3' | 'h4';
          return <Tag key={i}>{inline(kopf[2])}</Tag>;
        }
        return (
          <p key={i}>
            {block.split(/\r?\n/).map((zeile, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {inline(zeile.replace(/^[-*]\s+/, '• '))}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function Statblockfenster({
  titel,
  markdown,
  onZu
}: {
  readonly titel: string;
  readonly markdown: string;
  readonly onZu: () => void;
}) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onZu();
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [onZu]);
  return (
    <div className="statblock-huelle" role="presentation" onClick={onZu}>
      <aside
        className="statblock-fenster"
        role="dialog"
        aria-label={titel}
        data-statblock
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="statblock-fenster__zu" onClick={onZu} aria-label={t('knopf.schliessen')}>
          ×
        </button>
        <Bloecke markdown={markdown} />
      </aside>
    </div>
  );
}
