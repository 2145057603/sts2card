import { Icon, type IconName } from './Icon';

type ShortcutCardProps = {
  icon: IconName;
  shortcut: string;
  label: string;
  onClick: () => void;
};

const ShortcutCard = ({ icon, shortcut, label, onClick }: ShortcutCardProps) => (
  <button className="shortcut-card" type="button" onClick={onClick} title={`${shortcut} ${label}`}>
    <Icon name={icon} size={21} />
    <span className="shortcut-copy">
      <span className="shortcut-key">{shortcut}</span>
      <span className="shortcut-label">{label}</span>
    </span>
  </button>
);

type TopToolbarProps = {
  onOpen: () => void;
  onPaste: () => void;
  onDownload: () => void;
  onReset: () => void;
  onNudge: (direction: 'left' | 'right' | 'up' | 'down', large: boolean) => void;
  onTheme: () => void;
  onSettings: () => void;
  themeIsDim: boolean;
};

export const TopToolbar = ({
  onOpen,
  onPaste,
  onDownload,
  onReset,
  onNudge,
  onTheme,
  onSettings,
  themeIsDim,
}: TopToolbarProps) => (
  <header className="top-toolbar">
    <div className="brand-lockup">
      <div className="brand-mark" aria-hidden="true">
        <Icon name="spire" size={45} strokeWidth={1.15} />
      </div>
      <div>
        <h1>STS2 卡面裁剪工具</h1>
        <p>Slay the Spire 2 Card Cropper</p>
      </div>
    </div>

    <nav className="shortcut-strip" aria-label="快捷操作">
      <ShortcutCard icon="upload" shortcut="Ctrl+O" label="打开图片" onClick={onOpen} />
      <ShortcutCard icon="clipboard" shortcut="Ctrl+V" label="粘贴图片" onClick={onPaste} />
      <ShortcutCard icon="download" shortcut="Ctrl+S" label="下载图片" onClick={onDownload} />
      <ShortcutCard icon="reset" shortcut="R" label="重置" onClick={onReset} />
      <ShortcutCard icon="move" shortcut="方向键" label="微调" onClick={() => onNudge('right', false)} />
      <ShortcutCard icon="move" shortcut="Shift+方向键" label="大幅移动" onClick={() => onNudge('right', true)} />
    </nav>

    <div className="toolbar-actions">
      <button className="circle-button" type="button" onClick={onTheme} aria-label="切换主题" title="切换主题">
        <Icon name={themeIsDim ? 'sun' : 'moon'} size={20} />
      </button>
      <button className="circle-button" type="button" onClick={onSettings} aria-label="设置" title="设置">
        <Icon name="settings" size={20} />
      </button>
    </div>
  </header>
);
