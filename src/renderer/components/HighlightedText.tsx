import { Fragment } from 'react';
import type { SnippetMatch } from '../../shared/types';

interface Props {
  text: string;
  matches: SnippetMatch[];
}

/**
 * Hebt Fundstellen hervor, ohne HTML aus Nutzertext zu erzeugen. Der Text
 * wird in Stuecke zerlegt und die Treffer in <mark> gesetzt.
 */
export function HighlightedText({ text, matches }: Props) {
  if (matches.length === 0) return <>{text}</>;

  const parts: JSX.Element[] = [];
  let cursor = 0;

  matches.forEach((match, position) => {
    if (match.from > cursor) {
      parts.push(<Fragment key={`t${position}`}>{text.slice(cursor, match.from)}</Fragment>);
    }
    parts.push(<mark key={`m${position}`}>{text.slice(match.from, match.to)}</mark>);
    cursor = match.to;
  });

  if (cursor < text.length) parts.push(<Fragment key="rest">{text.slice(cursor)}</Fragment>);

  return <>{parts}</>;
}
