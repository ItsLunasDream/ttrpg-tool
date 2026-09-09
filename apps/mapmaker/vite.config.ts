import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync } from 'node:fs';

/**
 * Dev-Hilfe: die Seite kann ein gerendertes Bild an /__shot posten, das dann
 * unter .dev-shots/ landet. Nur im Dev-Server aktiv, nie im Build — gedacht für
 * visuelle Kontrolle ohne Screenshot-Werkzeug.
 */
function shotEndpoint(): Plugin {
  return {
    name: 'dev-shot-endpoint',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__shot', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const name = (req.headers['x-shot-name'] as string) || 'shot';
          const safe = name.replace(/[^a-z0-9_-]/gi, '') || 'shot';
          mkdirSync('.dev-shots', { recursive: true });
          const file = `.dev-shots/${safe}.jpg`;
          writeFileSync(file, Buffer.from(body, 'base64'));
          res.statusCode = 200;
          res.end(file);
        });
      });
    },
  };
}

/**
 * Packt den gesamten Build in *eine* HTML-Datei.
 *
 * Der Grund ist nicht Bequemlichkeit, sondern Reichweite: eine einzelne Datei
 * lässt sich doppelklicken. Ein normaler Build besteht aus `index.html` plus
 * einem Dutzend JS-Dateien, und ein Browser weigert sich, die über `file://`
 * nachzuladen — er verlangt dafür einen Webserver. Wer keinen Node-Server
 * starten kann oder darf, käme damit nicht an das Programm.
 *
 * Drei Dinge müssen dafür zusammenkommen, alle drei in `portableBuild()`
 * eingestellt: keine getrennten CSS-Dateien, keine ausgelagerten Assets, und
 * vor allem `inlineDynamicImports` — Pixi lädt seine Renderer sonst per
 * dynamischem Import nach, und genau das geht über `file://` nicht.
 */
function singleFile(): Plugin {
  return {
    name: 'single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      let js = '';
      let css = '';
      let html = '';
      let htmlName = '';

      for (const [name, datei] of Object.entries(bundle)) {
        if (datei.type === 'chunk' && datei.isEntry) js = datei.code;
        else if (name.endsWith('.css') && datei.type === 'asset')
          css = String(datei.source);
        else if (name.endsWith('.html') && datei.type === 'asset') {
          html = String(datei.source);
          htmlName = name;
        }
      }
      if (!html) return;

      // Alles, was jetzt eingebettet wird, muss aus dem Bündel verschwinden —
      // sonst liegen die Dateien doppelt daneben und stiften Verwirrung.
      for (const name of Object.keys(bundle))
        if (name !== htmlName) delete bundle[name];

      html = html
        .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '')
        .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '')
        .replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');

      /**
       * `__VITE_PRELOAD__` ist die Stelle, an der Vite die Liste der
       * vorzuladenden Dateien einsetzt. Sind die dynamischen Importe
       * eingebettet, gibt es diese Dateien nicht mehr — die Marke bleibt aber
       * stehen, und die Bühne stürzt beim Start mit
       * „__VITE_PRELOAD__ is not defined" ab.
       *
       * Sie muss hier weg und nicht über `define`: Vite setzt sie erst beim
       * Ausgeben der Chunks ein, also *nach* jedem `define`. Vites
       * Preload-Helfer nimmt eine fehlende Liste hin und lädt dann eben nichts
       * vor — was richtig ist, weil alles schon in der Datei steht.
       */
      js = js.replace(/\b__VITE_PRELOAD__\b/g, 'undefined');

      // `</script>` im Code würde das umschließende Tag vorzeitig beenden.
      // React schreibt die Stelle selbst schon escaped, aber verlassen wollen
      // wir uns darauf nicht.
      const sicher = js.replace(/<\/script/gi, '<\\/script');

      /**
       * Einsetzen über eine *Funktion*, nicht über einen Ersatz-String.
       *
       * `String.replace` deutet in einem Ersatz-String `$&`, `$\`` und `$1` als
       * Platzhalter. Minifizierter Code enthält solche Folgen — in diesem
       * Bündel dreimal `$&` —, und als String eingesetzt würde daraus der
       * gefundene Text: aus gültigem JavaScript wird Unsinn, der beim Laden
       * mit „Invalid regular expression flags" abbricht. Eine Funktion als
       * Ersatz kennt diese Sonderdeutung nicht.
       */
      const einsetzen = (wo: string, marke: string, inhalt: string) =>
        wo.replace(marke, () => inhalt);

      if (css) html = einsetzen(html, '</head>', `<style>${css}</style></head>`);
      html = einsetzen(html, '</body>', `<script type="module">${sicher}</script></body>`);

      (bundle[htmlName] as { source: string }).source = html;
    },
  };
}

export default defineConfig(({ mode }) => {
  const portabel = mode === 'portable';
  return {
    // Ohne das verweist die gebaute index.html absolut auf /assets/ — das
    // geht unter file:// ins Leere und in einer eingebetteten WebContentsView
    // ebenso. Tauri lädt das Bündel über einen eigenen Host, dem relative
    // Pfade genauso recht sind, hier ändert sich also nichts.
    base: './',
    // `as Plugin[]`: seit dem Umzug in den Workspace teilt sich diese App
    // ihr @vitejs/plugin-react mit apps/backstory und apps/shell, die auf
    // Vite 5 stehen, waehrend diese App Vite 6 benutzt. npm haelt das fuer
    // kompatibel und installiert nur eine Kopie von plugin-react — deren
    // eigene vite-Typen loest TypeScript darum gegen die fremde, aeltere
    // Vite-Installation auf. Zur Laufzeit ist das folgenlos, Plugins sind
    // strukturell gleich; nur die zwei Typ-Instanzen sind sich fremd.
    plugins: [react(), shotEndpoint(), ...(portabel ? [singleFile()] : [])] as Plugin[],
    resolve: {
      // Root-relativer Alias — spart die @types/node-Abhängigkeit für node:url.
      alias: { '@': '/src' },
    },

    server: {
      port: 5173,
    },
    build: portabel
      ? {
          outDir: 'dist-portable',
          // Ohne Größengrenze: jedes Bild, jede Schrift wird als data:-URI
          // eingebettet, statt als eigene Datei danebenzuliegen.
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          cssCodeSplit: false,
          chunkSizeWarningLimit: 4000,
          modulePreload: false,
          rollupOptions: { output: { inlineDynamicImports: true } },
        }
      : {},
  };
});
