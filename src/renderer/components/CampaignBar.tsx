import type { AppSettings, Campaign } from '../../shared/types';
import { useT } from '../i18n';

interface Props {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  settings: AppSettings;
  onSelect: (campaignId: string) => void;
  onCreate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  onEditNoteTypes: () => void;
  onOpenSettings: () => void;
}

export function CampaignBar(props: Props) {
  const t = useT();
  const { campaigns, activeCampaignId, settings } = props;

  return (
    <header className="campaign-bar">
      <span className="campaign-bar__brand">Backstory Creator</span>

      <select value={activeCampaignId ?? ''} onChange={(event) => props.onSelect(event.target.value)}>
        <option value="" disabled>
          {t('bar.chooseCampaign')}
        </option>
        {campaigns.map((campaign) => (
          <option value={campaign.id} key={campaign.id}>
            {campaign.name}
          </option>
        ))}
      </select>

      <button type="button" onClick={props.onCreate}>
        {t('bar.newCampaign')}
      </button>
      <button type="button" onClick={props.onRename} disabled={!activeCampaignId}>
        {t('bar.rename')}
      </button>
      <button type="button" onClick={props.onEditNoteTypes} disabled={!activeCampaignId}>
        {t('bar.noteTypes')}
      </button>
      <button type="button" onClick={props.onExport} disabled={!activeCampaignId}>
        {t('bar.exportZip')}
      </button>
      <button type="button" className="danger" onClick={props.onDelete} disabled={!activeCampaignId}>
        {t('bar.deleteCampaign')}
      </button>

      <span className="campaign-bar__spacer" />

      <span className="campaign-bar__autosave">{t(settings.autosaveEnabled ? 'bar.autosaveOn' : 'bar.autosaveOff')}</span>
      <button type="button" onClick={props.onOpenSettings}>
        {t('bar.settings')}
      </button>
    </header>
  );
}
