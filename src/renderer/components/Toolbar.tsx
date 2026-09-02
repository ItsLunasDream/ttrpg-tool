import type { Editor } from '@tiptap/react';
import { useT, type Translate } from '../i18n';
import { IMAGE_WIDTHS } from '../editor/sizedImage';

interface Props {
  editor: Editor | null;
  onInsertImage: () => void;
}

interface Action {
  label: string;
  title: (t: Translate) => string;
  isActive?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const ACTIONS: Action[] = [
  { label: 'B', title: (t) => t('toolbar.bold'), isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { label: 'I', title: (t) => t('toolbar.italic'), isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { label: 'S', title: (t) => t('toolbar.strike'), isActive: (e) => e.isActive('strike'), run: (e) => e.chain().focus().toggleStrike().run() },
  { label: 'H1', title: (t) => t('toolbar.heading', { level: 1 }), isActive: (e) => e.isActive('heading', { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'H2', title: (t) => t('toolbar.heading', { level: 2 }), isActive: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3', title: (t) => t('toolbar.heading', { level: 3 }), isActive: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: '•', title: (t) => t('toolbar.bulletList'), isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: '1.', title: (t) => t('toolbar.orderedList'), isActive: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: '❝', title: (t) => t('toolbar.quote'), isActive: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { label: '</>', title: (t) => t('toolbar.code'), isActive: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { label: '―', title: (t) => t('toolbar.rule'), run: (e) => e.chain().focus().setHorizontalRule().run() }
];

export function Toolbar({ editor, onInsertImage }: Props) {
  const t = useT();
  if (!editor) return <div className="toolbar" />;

  return (
    <div className="toolbar">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.title(t)}
          className={action.isActive?.(editor) ? 'is-active' : undefined}
          onMouseDown={(event) => {
            event.preventDefault();
            action.run(editor);
          }}
        >
          {action.label}
        </button>
      ))}
      {/* Nur wenn ein Bild ausgewaehlt ist: Markdown kennt keine Groesse,
          deshalb steht sie als Attribut am Bild. */}
      {editor.isActive('image')
        ? IMAGE_WIDTHS.map((entry) => (
            <button
              key={entry.label}
              type="button"
              title={t('image.width', { size: entry.label })}
              onMouseDown={(event) => {
                event.preventDefault();
                editor.chain().focus().updateAttributes('image', { width: entry.width }).run();
              }}
            >
              {entry.label}
            </button>
          ))
        : null}

      <button
        type="button"
        title={t('image.insert')}
        onMouseDown={(event) => {
          event.preventDefault();
          onInsertImage();
        }}
      >
        ▣
      </button>

      <span className="toolbar__spacer" />
      <button type="button" title={t('toolbar.undo')} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}>
        ↶
      </button>
      <button type="button" title={t('toolbar.redo')} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}>
        ↷
      </button>
    </div>
  );
}
