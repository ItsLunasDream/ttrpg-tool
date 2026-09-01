import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, call } from './api';
import { buildIndex, filterNotes, searchNotes, type SearchFilters } from './noteIndex';
import { normalizeName } from '../shared/wikilinks';
import { DEFAULT_NOTE_TYPES } from '../shared/noteTypes';
import type {
  AppSettings,
  Campaign,
  Note,
  NoteType,
  NoteTypeDef,
  NoteVersion,
  OrphanedAsset,
  SearchHit
} from '../shared/types';
import type { PromptCategory } from '../shared/writingPrompts';
import { CampaignBar } from './components/CampaignBar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { InfoCard } from './components/InfoCard';
import { SettingsDialog } from './components/SettingsDialog';
import { PromptDialog } from './components/PromptDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LanguageProvider, useLanguage, useT } from './i18n';
import { DEFAULT_LANGUAGE } from '../shared/i18n';
import type { Language } from '../shared/i18n';
import { NoteTypesDialog } from './components/NoteTypesDialog';
import { HistoryDialog } from './components/HistoryDialog';
import { PromptsDialog } from './components/PromptsDialog';
import { GraphView } from './components/GraphView';
import { CleanupDialog } from './components/CleanupDialog';
import type { AiStatus } from './components/AssistantPanel';
import type { AiTask } from '../main/ai/provider';

type Dialog =
  | { kind: 'none' }
  | { kind: 'settings' }
  | { kind: 'newCampaign' }
  | { kind: 'renameCampaign'; campaign: Campaign }
  | { kind: 'deleteCampaign'; campaign: Campaign }
  | { kind: 'newNote'; type: NoteType }
  | { kind: 'deleteNote'; note: Note }
  | { kind: 'noteTypes' }
  | { kind: 'history'; note: Note }
  | { kind: 'prompts' }
  | { kind: 'cleanup' };

const EMPTY_FILTERS: SearchFilters = { query: '', type: 'all', tag: null };

export function App() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  return (
    <LanguageProvider language={language}>
      <Workspace onLanguageChange={setLanguage} />
    </LanguageProvider>
  );
}

function Workspace({ onLanguageChange }: { onLanguageChange: (language: Language) => void }) {
  const { t, compare, language } = useLanguage();
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
  const [versions, setVersions] = useState<NoteVersion[] | null>(null);
  // Wird hochgezaehlt, wenn der Text einer offenen Notiz von aussen ersetzt
  // wurde. Ohne dieses Signal zeigte der Editor weiter den alten Stand.
  const [reloadKey, setReloadKey] = useState(0);
  const [prompts, setPrompts] = useState<PromptCategory[] | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [orphans, setOrphans] = useState<OrphanedAsset[] | null>(null);

  const draftRef = useRef<Note | null>(null);
  draftRef.current = draft;
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const notesRef = useRef<Note[]>([]);
  notesRef.current = notes;
  const savingRef = useRef(false);

  const activeCampaign = campaigns.find((campaign) => campaign.id === activeCampaignId) ?? null;
  const noteTypes: NoteTypeDef[] = activeCampaign?.noteTypes ?? DEFAULT_NOTE_TYPES;
  const index = useMemo(() => buildIndex(notes, noteTypes, compare), [notes, noteTypes, compare]);
  const visibleNotes = useMemo(() => filterNotes(index, filters), [index, filters]);

  // Treffer der Volltextsuche, damit die Liste Ausschnitt und Fundstelle
  // zeigen kann. Ohne Suchbegriff bleibt die Zuordnung leer.
  const searchHits = useMemo(() => {
    if (!filters.query.trim()) return new Map<string, SearchHit>();
    return new Map(searchNotes(index, filters.query).map((hit) => [hit.noteId, hit]));
  }, [index, filters.query]);

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
      onLanguageChange(loaded.language);
      // Der Status haengt an einem Netzaufruf, deshalb nebenlaeufig.
      void call(api.ai.status()).then(setAiStatus, () => setAiStatus(null));

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
        if (saved.body !== current.body) setReloadKey((previous) => previous + 1);
        if (result.rewritten > 0) {
          report(result.rewritten === 1 ? t('msg.renamedOne') : t('msg.renamed', { count: result.rewritten }));
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

  /** Bild in die Kampagne kopieren. Liefert den relativen Verweis oder null. */
  const importImage = useCallback(
    async (file: File): Promise<string | null> => {
      const campaignId = activeCampaignId;
      if (!campaignId) return null;
      return guard(async () =>
        call(api.assets.save(campaignId, file.name, new Uint8Array(await file.arrayBuffer())))
      );
    },
    [activeCampaignId, guard]
  );

  const pickImage = useCallback(async (): Promise<string | null> => {
    const campaignId = activeCampaignId;
    if (!campaignId) return null;
    return (await guard(() => call(api.assets.pick(campaignId)))) ?? null;
  }, [activeCampaignId, guard]);

  /** Verlauf oeffnen. Ungespeichertes wird vorher gesichert, sonst fehlt es dort. */
  const openHistory = useCallback(
    async (note: Note) => {
      const campaignId = activeCampaignId;
      if (!campaignId) return;

      setVersions(null);
      setDialog({ kind: 'history', note });
      await guard(async () => {
        await persist();
        setVersions(await call(api.history.list(campaignId, note.id)));
      });
    },
    [activeCampaignId, guard, persist]
  );

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
        report(t('msg.alreadyExists', { title }));
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
      void guard(async () => {
        const updated = await call(api.settings.update(patch));
        setSettings(updated);
        onLanguageChange(updated.language);
        void call(api.ai.status()).then(setAiStatus, () => setAiStatus(null));
      });
    },
    [guard, onLanguageChange]
  );

  if (!settings) {
    return <div className="boot">{t('app.loading')}</div>;
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
            if (target) report(t('msg.exported', { path: target }));
          })
        }
        onExportMarkdown={() =>
          activeCampaign &&
          void guard(async () => {
            const result = await call(api.exportMarkdown.campaign(activeCampaign.id));
            if (result) report(t('export.doneCount', { count: result.count, path: result.path }));
          })
        }
        onExportPdf={() =>
          activeCampaign &&
          void guard(async () => {
            const result = await call(api.exportPdf.campaign(activeCampaign.id, activeCampaign.name));
            if (result) report(t('export.doneCount', { count: result.count, path: result.path }));
          })
        }
        onToggleGraph={() => setShowGraph((previous) => !previous)}
        graphOpen={showGraph}
        onCleanup={() =>
          activeCampaign &&
          void guard(async () => {
            setOrphans(null);
            setDialog({ kind: 'cleanup' });
            await persist();
            setOrphans(await call(api.assets.orphans(activeCampaign.id)));
          })
        }
        onOpenSettings={() => setDialog({ kind: 'settings' })}
        onEditNoteTypes={() => setDialog({ kind: 'noteTypes' })}
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
            {showGraph ? (
              <GraphView
                index={index}
                activeNoteId={draft?.id ?? null}
                onClose={() => setShowGraph(false)}
                onOpenNote={(noteId) => {
                  openNote(noteId);
                  setShowGraph(false);
                }}
              />
            ) : draft ? (
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
                onOpenHistory={() => void openHistory(draft)}
                aiStatus={aiStatus}
                onAsk={async (task: AiTask) => {
                  const campaignId = activeCampaignId;
                  if (!campaignId) return null;
                  await persist();
                  return guard(() => call(api.ai.ask(campaignId, draft.id, task)));
                }}
                onOpenPrompts={() => {
                  setDialog({ kind: 'prompts' });
                  if (!prompts) void guard(async () => setPrompts(await call(api.prompts.get())));
                }}
                onExportMarkdown={() =>
                  void guard(async () => {
                    const campaignId = activeCampaignId;
                    if (!campaignId) return;
                    await persist();
                    const result = await call(api.exportMarkdown.note(campaignId, draft.id));
                    if (result) report(t('export.done', { path: result.path }));
                  })
                }
                onExportPdf={() =>
                  void guard(async () => {
                    const campaignId = activeCampaignId;
                    if (!campaignId) return;
                    await persist();
                    const result = await call(api.exportPdf.note(campaignId, draft.id, draft.title));
                    if (result) report(t('export.done', { path: result.path }));
                  })
                }
                onOpenNote={openNote}
                onCreateNote={createNoteFromLink}
                onHoverNote={(note, rect) => setHover(note && rect ? { note, rect } : null)}
                onOpenExternal={(url) => void guard(() => call(api.openExternal(url)))}
                searchQuery={filters.query}
                campaignId={activeCampaignId}
                reloadKey={reloadKey}
                onImportImage={importImage}
                onPickImage={pickImage}
                onReport={report}
              />
            ) : (
              <div className="placeholder">
                <p>{t('app.noNotes')}</p>
                <p>{t('app.noNotesHint')}</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="placeholder">
          <p>{t('app.noCampaign')}</p>
          <button type="button" className="primary" onClick={() => setDialog({ kind: 'newCampaign' })}>
            {t('app.createFirstCampaign')}
          </button>
        </div>
      )}

      {hover && activeCampaignId ? (
        <InfoCard
          note={hover.note}
          types={noteTypes}
          campaignId={activeCampaignId}
          rect={hover.rect}
          onOpen={openNote}
        />
      ) : null}

      {message ? <div className={`toast toast--${message.tone}`}>{message.text}</div> : null}

      {dialog.kind === 'noteTypes' && activeCampaign ? (
        <NoteTypesDialog
          types={noteTypes}
          notes={notes}
          onClose={() => setDialog({ kind: 'none' })}
          onSave={(types) =>
            void guard(async () => {
              const updated = await call(api.campaigns.updateNoteTypes(activeCampaign.id, types));
              setCampaigns((previous) => previous.map((entry) => (entry.id === updated.id ? updated : entry)));
              setDialog({ kind: 'none' });
              report(t('types.saved'));
            })
          }
        />
      ) : null}

      {dialog.kind === 'cleanup' && activeCampaignId ? (
        <CleanupDialog
          campaignId={activeCampaignId}
          assets={orphans}
          onClose={() => setDialog({ kind: 'none' })}
          onDelete={(names) =>
            void guard(async () => {
              const removed = await call(api.assets.deleteMany(activeCampaignId, names));
              report(removed === 1 ? t('cleanup.deletedOne') : t('cleanup.deleted', { count: removed }));
              setOrphans(await call(api.assets.orphans(activeCampaignId)));
            })
          }
        />
      ) : null}

      {dialog.kind === 'prompts' ? (
        <PromptsDialog
          categories={prompts}
          onClose={() => setDialog({ kind: 'none' })}
          onEditFile={() => void guard(() => call(api.prompts.reveal()))}
          onInsert={(text) => {
            // An den Text anhaengen statt einzufuegen: der Vorschlag ist ein
            // Startpunkt, kein Baustein mitten im Satz.
            if (!draft) return;
            patchDraft({ body: draft.body.trimEnd() ? `${draft.body.trimEnd()}\n\n${text}` : text });
            setReloadKey((previous) => previous + 1);
            setDialog({ kind: 'none' });
          }}
        />
      ) : null}

      {dialog.kind === 'history' ? (
        <HistoryDialog
          note={dialog.note}
          versions={versions}
          historyEnabled={settings.historyEnabled}
          onClose={() => setDialog({ kind: 'none' })}
          onRestore={(versionId) =>
            void guard(async () => {
              const campaignId = activeCampaignId;
              if (!campaignId) return;

              const restored = await call(api.history.restore(campaignId, dialog.note.id, versionId));
              await reloadNotes(campaignId);
              setDraft(restored);
              setDirty(false);
              setReloadKey((previous) => previous + 1);
              setDialog({ kind: 'none' });

              const version = versions?.find((entry) => entry.id === versionId);
              if (version) {
                report(t('history.restored', { date: new Date(version.savedAt).toLocaleString(language) }));
              }
            })
          }
        />
      ) : null}

      {dialog.kind === 'settings' ? (
        <SettingsDialog
          settings={settings}
          hasApiKey={aiStatus?.hasKey ?? false}
          onSaveApiKey={(apiKey) =>
            void guard(async () => {
              setSettings(await call(api.ai.setApiKey(apiKey)));
              setAiStatus(await call(api.ai.status()));
            })
          }
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
          title={t('dialog.newCampaign')}
          label={t('dialog.campaignName')}
          confirmLabel={t('dialog.create')}
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
          title={t('dialog.renameCampaign')}
          label={t('dialog.newName')}
          confirmLabel={t('dialog.rename')}
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
          title={t('dialog.deleteCampaign')}
          message={t('dialog.deleteCampaignText', { name: dialog.campaign.name })}
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
          types={noteTypes}
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
          title={t('dialog.deleteNote')}
          message={t('dialog.deleteNoteText', { title: dialog.note.title })}
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
  types: NoteTypeDef[];
  initialType: NoteType;
  initialTitle: string;
  onConfirm: (type: NoteType, title: string) => void;
  onClose: () => void;
}

/** Titel und Typ in einem Schritt, damit ein offener [[Link]] direkt zur Notiz wird. */
function NewNoteDialog({ types, initialType, initialTitle, onConfirm, onClose }: NewNoteDialogProps) {
  const t = useT();
  const [type, setType] = useState<NoteType>(initialType);

  return (
    <PromptDialog
      title={t('dialog.newNote')}
      label={t('editor.title')}
      confirmLabel={t('dialog.create')}
      initialValue={initialTitle}
      onClose={onClose}
      onConfirm={(value) => onConfirm(type, value)}
    >
      <label className="field">
        <span className="field__label">{t('dialog.type')}</span>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {types.map((def) => (
            <option value={def.id} key={def.id}>
              {def.label}
            </option>
          ))}
        </select>
      </label>
    </PromptDialog>
  );
}
