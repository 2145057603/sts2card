import type { ReactNode } from 'react';

export type IconName =
  | 'upload'
  | 'clipboard'
  | 'download'
  | 'reset'
  | 'move'
  | 'crop'
  | 'moon'
  | 'sun'
  | 'settings'
  | 'help'
  | 'image'
  | 'spire'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'trash'
  | 'copy'
  | 'minus'
  | 'plus'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowUp'
  | 'arrowDown'
  | 'center'
  | 'undo'
  | 'redo'
  | 'expand';

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const iconPaths: Record<IconName, ReactNode> = {
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 20h16" /></>,
  clipboard: <><rect x="6" y="4" width="13" height="16" rx="2" /><path d="M9 4.5V3h6v1.5" /><path d="M9 9h6M9 13h4" /></>,
  download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></>,
  reset: <><path d="M4 12a8 8 0 1 0 2.3-5.7" /><path d="M4 4v5h5" /></>,
  move: <><path d="M12 3v18M3 12h18" /><path d="m9 6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" /></>,
  crop: <><path d="M6 3v12a3 3 0 0 0 3 3h12" /><path d="M3 6h12a3 3 0 0 1 3 3v12" /></>,
  moon: <path d="M20.8 15.3A8.7 8.7 0 0 1 8.7 3.2 8.7 8.7 0 1 0 20.8 15.3Z" />,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.5 1.3Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 4.1 1.7c-1 .9-1.9 1.2-1.9 2.6" /><path d="M12 16.7h.01" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 4.5-4.5 3.3 3.2 2.4-2.4L20 18" /></>,
  spire: <><path d="m12 3 3.2 7.1L20 17l-8 4-8-4 4.8-6.9L12 3Z" /><path d="m12 3-1.4 10.2L4 17M12 3l1.4 10.2L20 17M7.1 11.1h9.8" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m14.5 5-7 7 7 7" />,
  chevronRight: <path d="m9.5 5 7 7-7 7" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  trash: <><path d="M4 7h16M10 11v5M14 11v5" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
  copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></>,
  minus: <path d="M5 12h14" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrowLeft: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
  center: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><rect x="8" y="8" width="8" height="8" rx="1.5" /></>,
  undo: <><path d="M9 7 4 12l5 5" /><path d="M4 12h9a6 6 0 0 1 6 6" /></>,
  redo: <><path d="m15 7 5 5-5 5" /><path d="M20 12h-9a6 6 0 0 0-6 6" /></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" /><path d="m3 8 5-5M16 3l5 5M3 16l5 5M16 21l5-5" /></>,
};

export const Icon = ({ name, size = 18, strokeWidth = 1.7, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {iconPaths[name]}
  </svg>
);
