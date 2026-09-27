import { Icon } from './Icon';

type DisplayHelpersProps = {
  showSafeArea: boolean;
  showGuides: boolean;
  onSafeAreaChange: (value: boolean) => void;
  onGuidesChange: (value: boolean) => void;
};

const HelperSwitch = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="switch-row helper-switch-row">
    <button className={`toggle${value ? ' is-on' : ''}`} type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}>
      <span />
    </button>
    <span>{label}</span>
    <button className="quiet-icon-button" type="button" aria-label={`${label}说明`} title={`${label}说明`}><Icon name="help" size={17} /></button>
  </div>
);

export const DisplayHelpers = ({
  showSafeArea,
  showGuides,
  onSafeAreaChange,
  onGuidesChange,
}: DisplayHelpersProps) => (
  <section className="settings-section helpers-section">
    <h2 className="section-title"><span>5.</span> 显示辅助</h2>
    <HelperSwitch label="显示安全区" value={showSafeArea} onChange={onSafeAreaChange} />
    <HelperSwitch label="显示参考线" value={showGuides} onChange={onGuidesChange} />
  </section>
);
