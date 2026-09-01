import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
}

interface Action {
  label: string;
  title: string;
  isActive?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const ACTIONS: Action[] = [
  { label: 'B', title: 'Fett (Strg+B)', isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { label: 'I', title: 'Kursiv (Strg+I)', isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { label: 'S', title: 'Durchgestrichen', isActive: (e) => e.isActive('strike'), run: (e) => e.chain().focus().toggleStrike().run() },
  { label: 'H1', title: 'Überschrift 1', isActive: (e) => e.isActive('heading', { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'H2', title: 'Überschrift 2', isActive: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3', title: 'Überschrift 3', isActive: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: '•', title: 'Aufzählung', isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: '1.', title: 'Nummerierte Liste', isActive: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: '❝', title: 'Zitat', isActive: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { label: '</>', title: 'Code', isActive: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { label: '―', title: 'Trennlinie', run: (e) => e.chain().focus().setHorizontalRule().run() }
];

export function Toolbar({ editor }: Props) {
  if (!editor) return <div className="toolbar" />;

  return (
    <div className="toolbar">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.title}
          className={action.isActive?.(editor) ? 'is-active' : undefined}
          onMouseDown={(event) => {
            event.preventDefault();
            action.run(editor);
          }}
        >
          {action.label}
        </button>
      ))}
      <span className="toolbar__spacer" />
      <button type="button" title="Rückgängig (Strg+Z)" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}>
        ↶
      </button>
      <button type="button" title="Wiederholen (Strg+Umschalt+Z)" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}>
        ↷
      </button>
    </div>
  );
}
