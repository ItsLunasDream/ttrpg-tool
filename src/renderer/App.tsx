import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, call } from './api';
import { buildIndex, filterNotes, searchNotes, type SearchFilters } from './noteIndex';
import { normalizeName } from '../shared/wikilinks';
import { NOTE_TYPES } from '../shared/noteTypes';
import type { AppSettings, Campaign, Note, NoteType, SearchHit } from '../shared/types';
import { CampaignBar } from './components/CampaignBar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { InfoCard } from './components/InfoCard';
import { SettingsDialog } from './components/SettingsDialog';
import { PromptDialog } from './components/PromptDialog';
import { ConfirmDialog } from './components/ConfirmDialog';

type Dialog =
  | { kind: 'none' }
  | { kind: 'settings' }
  | { kind: 'newCampaign' }
  | { kind: 'renameCampaign'; campaign: Campaign }
  | { kind: 'deleteCampaign'; campaign: Campaign }
  | { kind: 'newNote'; type: NoteType }
  | { kind: 'deleteNote'; note: Note };

const EMPTY_FILTERS: SearchFilters = { query: '', type: 'all', tag: null };

export function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState<Note | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [hover, setHover] = useState<{ note: Note; rect: DOMRect } | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' });
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'error' } | null>(null);

  const draftRef = useRef<Note | null>(null);
  draftRef.current = draft;
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const notesRef = useRef<Note[]>([]);
  notesRef.current = notes;
  const savingRef = useRef(false);

  const index = useMemo(() => buildIndex(notes), [notes]);
  const visibleNotes = useMemo(() => filterNotes(index, filters), [index, filters]);

  // Treffer der Volltextsuche, damit die Liste Ausschnitt und Fundstelle
  // zeigen kann. Ohne Suchbegriff bleibt die Zuordnung leer.
  const searchHits = useMemo(() => {
    if (!filters.query.trim()) return new Map<string, SearchHit>();
    return new Map(searchNotes(index, filters.query).map((hit) => [hit.noteId, hit]));
  }, [index, filters.query]);
  const activeCampaign = campaigns.find((campaign) => campaign.id === activeCampaignId) ?? null;

  const report = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    setMessage({ text, tone });
  }, []);

  const guard = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | null> => {
      try {
        return await action();
      } catch (error) {
        report(error instanceof Error ? error.message : String(error), 'error');
        return null;
      }
    },
    [report]
  );

  // --- Laden ---------------------------------------------------------------

  useEffect(() => {
    void guard(async () => {
      const loaded = await call(api.settings.get());
      setSettings(loaded);

      const list = await call(api.campaigns.list());
      setCampaigns(list);

      const preferred = list.find((campaign) => campaign.id === loaded.lastCampaignId) ?? list[0] ?? null;
      setActiveCampaignId(preferred?.id ?? null);
    });
  }, [guard]);

  const reloadNotes = useCallback(
    async (campaignId: string) => {
      const list = await call(api.notes.list(campaignId));
      setNotes(list);
      return list;
    },
    []
  );

  useEffect(() => {
    if (!activeCampaignId) {
      setNotes([]);
      setDraft(null);
      return;
    }
    void guard(async () => {
      const list = await reloadNotes(activeCampaignId);
      setDraft(list[0] ?? null);
      setDirty(false);
      setFilters(EMPTY_FILTERS);
      await call(api.settings.update({ lastCampaignId: activeCampaignId }));
    });
  }, [activeCampaignId, guard, reloadNotes]);

  // --- Speichern -----------------------------------------------------------

  const persist = useCallback(async (): Promise<Note | null> => {
    const current = draftRef.current;
    const campaignId = activeCampaignId;
    if (!current || !campaignId || !dirtyRef.current || savingRef.current) return current;

    savingRef.current = true;
    setSaving(true);
    try {
      const persisted = notesRef.current.find((note) => note.id === current.id);
      const renamed = Boolean(persisted && persisted.title !== current.title);

      let saved: Note;
      if (renamed && persisted) {
        // Erst den Inhalt unter dem alten Titel sichern, dann umbenennen.
        // Das Umbenennen zieht die [[Links]] in der ganzen Kampagne mit.
        await call(api.notes.save(campaignId, { ...current, title: persisted.title }));
        const result = await call(api.notes.rename(campaignId, current.id, current.title));
        saved = result.note;
        await reloadNotes(campaignId);
        if (result.rewritten > 0) {
          report(`Umbenannt, ${result.rewritten} Notiz${result.rewritten === 1 ? '' : 'en'} mit Links angepasst.`);
        }
      } else {
        saved = await call(api.notes.save(campaignId, current));
        setNotes((previous) => previous.map((note) => (note.id === saved.id ? saved : note)));
      }

      setDraft((previous) => (previous && previous.id === saved.id ? saved : previous));
      setDirty(false);
      return saved;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [activeCampaignId, reloadNotes, report]);

  const save = useCallback(() => guard(persist), [guard, persist]);

  // Autosave laeuft nur, wenn er in den Einstellungen aktiv ist.
  useEffect(() => {
    if (!settings?.autosaveEnabled || !dirty || !draft) return;
    const timer = window.setTimeout(() => void save(), settings.autosaveDelayMs);
    return () => window.clearTimeout(timer);
  }, [settings?.autosaveEnabled, settings?.autosaveDelayMs, dirty, draft, save]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (dirtyRef.current) event.preventDefault();
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  // --- Aktionen ------------------------------------------------------------

  const patchDraft = useCallback((patch: Partial<Note>) => {
    setDraft((previous) => (previous ? { ...previous, ...patch } : previous));
    setDirty(true);
  }, []);

  const openNote = useCallback(
    (noteId: string) => {
      if (draftRef.current?.id === noteId) return;
      void guard(async () => {
        await persist();
        const target = notesRef.current.find((note) => note.id === noteId);
        if (!target) return;
        setDraft(target);
        setDirty(false);
        setHover(null);
      });
    },
    [guard, persist]
  );

  const createNote = useCallback(
    (type: NoteType, title: string) => {
      const campaignId = activeCampaignId;
      if (!campaignId) return;

      void guard(async () => {
        await persist();
        const created = await call(api.notes.create(campaignId, type, title));
        const list = await reloadNotes(campaignId);
        setDraft(list.find((note) => note.id === created.id) ?? created);
        setDirty(false);
      });
    },
    [activeCampaignId, guard, persist, reloadNotes]
  );

  /** Aus einem offenen [[Link]] heraus: nur anlegen, wenn es den Namen noch nicht gibt. */
  const createNoteFromLink = useCallback(
    (title: string) => {
      if (index.byName.has(normalizeName(title))) {
        report(`„${title}“ existiert bereits.`);
        return;
      }
      setDialog({ kind: 'newNote', type: 'character' });
      // Titel vorbelegen, indem direkt angelegt wird: der Dialog dient nur der Typwahl.
      setPendingLinkTitle(title);
    },
    [index, report]
  );

  const [pendingLinkTitle, setPendingLinkTitle] = useState<string | null>(null);

  const switchCampaign = useCallback(
    (campaignId: string) => {
      if (campaignId === activeCampaignId) return;
      void guard(async () => {
        await persist();
        setActiveCampaignId(campaignId);
      });
    },
    [activeCampaignId, guard, persist]
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      void guard(async () => setSettings(await call(api.settings.update(patch))));
    },
    [guard]
  );

  if (!settings) {
    return <div className="boot">Lädt …</div>;
  }

  return (
    <div className="app" onMouseLeave={() => setHover(null)}>
      <CampaignBar
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        settings={settings}
        onSelect={switchCampaign}
        onCreate={() => setDialog({ kind: 'newCampaign' })}
        onRename={() => activeCampaign && setDialog({ kind: 'renameCampaign', campaign: activeCampaign })}
        onDelete={() => activeCampaign && setDialog({ kind: 'deleteCampaign', campaign: activeCampaign })}
        onExport={() =>
          activeCampaign &&
          void guard(async () => {
            const target = await call(api.exportCampaignZip(activeCampaign.id, activeCampaign.name));
            if (target) report(`Sicherung geschrieben: ${target}`);
          })
        }
        onOpenSettings={() => setDialog({ kind: 'settings' })}
      />

      {activeCampaignId ? (
        <main className="app__body">
          <aside className="app__sidebar">
            <NoteList
              index={index}
              notes={visibleNotes}
              hits={searchHits}
              activeNoteId={draft?.id ?? null}
              filters={filters}
              onFiltersChange={setFilters}
              onSelect={openNote}
              onCreate={(type) => setDialog({ kind: 'newNote', type })}
            />
          </aside>

          <section className="app__content">
            {draft ? (
              <NoteEditor
                note={draft}
                index={index}
                dirty={dirty}
                saving={saving}
                autosaveEnabled={settings.autosaveEnabled}
                onPatch={patchDraft}
                onSave={() => void save()}
                onRename={() => void save()}
                onDelete={() => setDialog({ kind: 'deleteNote', note: draft })}
                onOpenNote={openNote}
                onCreateNote={createNoteFromLink}
                onHoverNote={(note, rect) => setHover(note && rect ? { note, rect } : null)}
                onOpenExternal={(url) => void guard(() => call(api.openExternal(url)))}
                searchQuery={filters.query}
              />
            ) : (
              <div className="placeholder">
                <p>Noch keine Notiz in dieser Kampagne.</p>
                <p>Leg links eine an, zum Beispiel einen Charakter.</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="placeholder">
          <p>Keine Kampagne vorhanden.</p>
          <button type="button" className="primary" onClick={() => setDialog({ kind: 'newCampaign' })}>
            Erste Kampagne anlegen
          </button>
        </div>
      )}

      {hover ? <InfoCard note={hover.note} rect={hover.rect} onOpen={openNote} /> : null}

      {message ? <div className={`toast toast--${message.tone}`}>{message.text}</div> : null}

      {dialog.kind === 'settings' ? (
        <SettingsDialog
          settings={settings}
          onChange={updateSettings}
          onChooseVaultRoot={() =>
            void guard(async () => {
              const next = await call(api.settings.chooseVaultRoot());
              if (!next) return;
              setSettings(next);
              const list = await call(api.campaigns.list());
              setCampaigns(list);
              setActiveCampaignId(list[0]?.id ?? null);
              setDialog({ kind: 'none' });
            })
          }
          onRevealVault={() => void guard(() => call(api.vault.reveal()))}
          onClose={() => setDialog({ kind: 'none' })}
        />
      ) : null}

      {dialog.kind === 'newCampaign' ? (
        <PromptDialog
          title="Neue Kampagne"
          label="Name der Kampagne"
          confirmLabel="Anlegen"
          onClose={() => setDialog({ kind: 'none' })}
          onConfirm={(name) =>
            void guard(async () => {
              const campaign = await call(api.campaigns.create(name));
              setCampaigns(await call(api.campaigns.list()));
              setActiveCampaignId(campaign.id);
              setDialog({ kind: 'none' });
            })
          }
        />
      ) : null}

      {dialog.kind === 'renameCampaign' ? (
        <PromptDialog
          title="Kampagne umbenennen"
          label="Neuer Name"
          confirmLabel="Umbenennen"
          initialValue={dialog.campaign.name}
          onClose={() => setDialog({ kind: 'none' })}
          onConfirm={(name) =>
            void guard(async () => {
              await call(api.campaigns.rename(dialog.campaign.id, name));
              setCampaigns(await call(api.campaigns.list()));
              setDialog({ kind: 'none' });
            })
          }
        />
      ) : null}

      {dialog.kind === 'deleteCampaign' ? (
        <ConfirmDialog
          title="Kampagne löschen"
          message={`„${dialog.campaign.name}“ mit allen Notizen unwiderruflich löschen? Sichere sie vorher als ZIP, wenn du unsicher bist.`}
          onClose={() => setDialog({ kind: 'none' })}
          onConfirm={() =>
            void guard(async () => {
              await call(api.campaigns.remove(dialog.campaign.id));
              const list = await call(api.campaigns.list());
              setCampaigns(list);
              setActiveCampaignId(list[0]?.id ?? null);
              setDialog({ kind: 'none' });
            })
          }
        />
      ) : null}

      {dialog.kind === 'newNote' ? (
        <NewNoteDialog
          initialType={dialog.type}
          initialTitle={pendingLinkTitle ?? ''}
          onClose={() => {
            setDialog({ kind: 'none' });
            setPendingLinkTitle(null);
          }}
          onConfirm={(type, title) => {
            createNote(type, title);
            setDialog({ kind: 'none' });
            setPendingLinkTitle(null);
          }}
        />
      ) : null}

      {dialog.kind === 'deleteNote' ? (
        <ConfirmDialog
          title="Notiz löschen"
          message={`„${dialog.note.title}“ löschen? Beziehungen anderer Notizen auf diese werden mit entfernt, [[Links]] im Text bleiben stehen.`}
          onClose={() => setDialog({ kind: 'none' })}
          onConfirm={() =>
            void guard(async () => {
              const campaignId = activeCampaignId;
              if (!campaignId) return;
              await call(api.notes.remove(campaignId, dialog.note.id));
              const list = await reloadNotes(campaignId);
              setDraft(list[0] ?? null);
              setDirty(false);
              setDialog({ kind: 'none' });
            })
          }
        />
      ) : null}
    </div>
  );
}

interface NewNoteDialogProps {
  initialType: NoteType;
  initialTitle: string;
  onConfirm: (type: NoteType, title: string) => void;
  onClose: () => void;
}

/** Titel und Typ in einem Schritt, damit ein offener [[Link]] direkt zur Notiz wird. */
function NewNoteDialog({ initialType, initialTitle, onConfirm, onClose }: NewNoteDialogProps) {
  const [type, setType] = useState<NoteType>(initialType);

  return (
    <PromptDialog
      title="Neue Notiz"
      label="Titel"
      confirmLabel="Anlegen"
      initialValue={initialTitle}
      onClose={onClose}
      onConfirm={(value) => onConfirm(type, value)}
    >
      <label className="field">
        <span className="field__label">Typ</span>
        <select value={type} onChange={(event) => setType(event.target.value as NoteType)}>
          {NOTE_TYPES.map((def) => (
            <option value={def.type} key={def.type}>
              {def.label}
            </option>
          ))}
        </select>
      </label>
    </PromptDialog>
  );
}
