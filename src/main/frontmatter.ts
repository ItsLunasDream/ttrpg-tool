import yaml from 'js-yaml';

const FENCE = '---';

export interface ParsedFile {
  data: Record<string, unknown>;
  body: string;
}

/** Liest YAML-Frontmatter zwischen zwei `---`-Zeilen am Dateianfang. */
export function parseFrontmatter(raw: string): ParsedFile {
  const text = raw.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== FENCE) {
    return { data: {}, body: text };
  }

  const closing = lines.findIndex((line, index) => index > 0 && line.trim() === FENCE);
  if (closing === -1) {
    return { data: {}, body: text };
  }

  const front = lines.slice(1, closing).join('\n');
  const body = lines.slice(closing + 1).join('\n').replace(/^\n/, '');
  const parsed = yaml.load(front);

  return {
    data: parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {},
    body
  };
}

export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const front = yaml.dump(data, { lineWidth: 0, noRefs: true, sortKeys: false }).trimEnd();
  const trimmedBody = body.replace(/\s+$/, '');
  return `${FENCE}\n${front}\n${FENCE}\n\n${trimmedBody}\n`;
}
