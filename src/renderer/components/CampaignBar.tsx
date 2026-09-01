import type { AppSettings, Campaign } from '../../shared/types';

interface Props {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  settings: AppSettings;
  onSelect: (campaignId: string) => void;
  onCreate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
}

export function CampaignBar(props: Props) {
  const { campaigns, activeCampaignId, settings } = props;

  return (
    <header className="campaign-bar">
      <span className="campaign-bar__brand">Backstory Creator</span>

      <select value={activeCampaignId ?? ''} onChange={(event) => props.onSelect(event.target.value)}>
        <option value="" disabled>
          Kampagne wählen …
        </option>
        {campaigns.map((campaign) => (
          <option value={campaign.id} key={campaign.id}>
            {campaign.name}
          </option>
        ))}
      </select>

      <button type="button" onClick={props.onCreate}>
        Neue Kampagne
      </button>
      <button type="button" onClick={props.onRename} disabled={!activeCampaignId}>
        Umbenennen
      </button>
      <button type="button" onClick={props.onExport} disabled={!activeCampaignId}>
        Als ZIP sichern
      </button>
      <button type="button" className="danger" onClick={props.onDelete} disabled={!activeCampaignId}>
        Kampagne löschen
      </button>

      <span className="campaign-bar__spacer" />

      <span className="campaign-bar__autosave">Autosave {settings.autosaveEnabled ? 'an' : 'aus'}</span>
      <button type="button" onClick={props.onOpenSettings}>
        Einstellungen
      </button>
    </header>
  );
}
