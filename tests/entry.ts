// Sammelpunkt fuer die Tests: buendelt die reinen Logikmodule ohne Electron.
export { findWikiLinks, rewriteWikiLinks, normalizeName } from '../src/shared/wikilinks';
export { parseFrontmatter, stringifyFrontmatter } from '../src/main/frontmatter';
export { countWords, markdownToHtml, htmlToMarkdown } from '../src/renderer/editor/markdown';
export { buildIndex, backlinksFor, unresolvedLinks, filterNotes, searchNotes, findOccurrences } from '../src/renderer/noteIndex';
export { Vault } from '../src/main/vault';
export { zipDirectory } from '../src/main/export';
export { textPreview, stripMarkdown } from '../src/renderer/editor/markdown';
