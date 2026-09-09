import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

/**
 * Haelt fest, warum `base: './'` in vite.config.ts steht — siehe die
 * Begruendung dort. Ohne dieses Feld verweist die gebaute index.html absolut
 * auf /assets/…, was unter file:// und in einer eingebetteten
 * WebContentsView gleichermassen ins Leere zeigt. Das ist kein theoretischer
 * Fall: genau daran ist der Kartenmacher beim Umzug in den Workspace erst
 * gescheitert, bevor die Ursache gefunden war.
 *
 * Der Test prueft den Quelltext, nicht das Ergebnis eines echten Builds — ein
 * `vite build` hier waere fuer eine einzelne Einstellung zu teuer. Das
 * eigentliche Ergebnis (relative Pfade in dist/index.html) prueft der
 * Rauchtest der Huelle in ihrer eigenen Ansicht.
 */
describe('vite.config.ts', () => {
  it('setzt eine relative Basis, nicht die absolute Voreinstellung', () => {
    const hier = dirname(fileURLToPath(import.meta.url));
    const quelle = readFileSync(join(hier, '..', 'vite.config.ts'), 'utf8');
    expect(quelle).toMatch(/base:\s*['"]\.\/['"]/);
  });
});
