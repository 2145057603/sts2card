import { useState } from 'react';
import type { CropPreset } from '../config/presets';
import { Icon } from './Icon';

type CornerSettingsProps = {
  enabled: boolean;
  radius: number;
  preset: CropPreset;
  onEnabledChange: (enabled: boolean) => void;
  onRadiusChange: (radius: number) => void;
};

export const CornerSettings = ({
  enabled,
  radius,
  preset,
  onEnabledChange,
  onRadiusChange,
}: CornerSettingsProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const maximum = Math.floor(Math.min(preset.width, preset.height) / 2);

  return (
    <section className="settings-section">
      <h2 className="section-title"><span>2.</span> 圆角设置</h2>
      <div className="switch-row">
        <button
          className={`toggle${enabled ? ' is-on' : ''}`}
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
        ><span /></button>
        <span>启用圆角 <small>（推荐）</small></span>
        <button className="quiet-icon-button" type="button" title="圆角说明" aria-label="圆角说明">
          <Icon name="help" size={17} />
        </button>
      </div>
      <div className={`radius-summary${enabled ? '' : ' is-disabled'}`}>当前圆角半径： <strong>{enabled ? radius : 0} px</strong></div>
      <button
        className={`advanced-toggle${advancedOpen ? ' is-open' : ''}`}
        type="button"
        onClick={() => setAdvancedOpen((open) => !open)}
      >
        <Icon name="expand" size={15} />
        <span>高级调整</span>
        <Icon name={advancedOpen ? 'chevronUp' : 'chevronDown'} size={16} />
      </button>
      {advancedOpen && (
        <div className="advanced-panel">
          <label htmlFor="radius-range">圆角半径</label>
          <div className="range-with-value">
            <input
              id="radius-range"
              type="range"
              min="0"
              max={maximum}
              value={radius}
              disabled={!enabled}
              onChange={(event) => onRadiusChange(Number(event.target.value))}
            />
            <input
              className="number-input"
              type="number"
              min="0"
              max={maximum}
              value={radius}
              disabled={!enabled}
              onChange={(event) => onRadiusChange(Math.min(maximum, Math.max(0, Number(event.target.value) || 0)))}
            />
          </div>
        </div>
      )}
    </section>
  );
};
