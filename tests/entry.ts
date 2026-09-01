// Sammelpunkt fuer die Tests: buendelt die reinen Logikmodule ohne Electron.
export { findWikiLinks, rewriteWikiLinks, normalizeName } from '../src/shared/wikilinks';
export { DEFAULT_NOTE_TYPES, findNoteType, fieldLabel, toKey } from '../src/shared/noteTypes';
export { parseFrontmatter, stringifyFrontmatter } from '../src/main/frontmatter';
export { countWords, markdownToHtml, htmlToMarkdown, textPreview, stripMarkdown } from '../src/renderer/editor/markdown';
export {
  buildIndex,
  backlinksFor,
  unresolvedLinks,
  filterNotes,
  searchNotes,
  findOccurrences
} from '../src/renderer/noteIndex';
export { Vault } from '../src/main/vault';
export { zipDirectory } from '../src/main/export';
