// Sammelpunkt fuer die Tests: buendelt die reinen Logikmodule ohne Electron.
export { findWikiLinks, rewriteWikiLinks, normalizeName } from '../src/shared/wikilinks';
export { DEFAULT_NOTE_TYPES, findNoteType, fieldLabel, toKey } from '../src/shared/noteTypes';
export { translate, isLanguage, LANGUAGES, MESSAGE_KEYS } from '../src/shared/i18n';
export { parseFrontmatter, stringifyFrontmatter } from '../src/main/frontmatter';
export { countWords, markdownToHtml, htmlToMarkdown, textPreview, stripMarkdown } from '../src/renderer/editor/markdown';
export { assetUrl, assetPath } from '../src/renderer/editor/assets';
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
export { renderNoteMarkdown, referencedAssets, toFileName } from '../src/main/markdownExport';
export { defaultPrompts } from '../src/shared/writingPrompts';
