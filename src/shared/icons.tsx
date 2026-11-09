// 작은 인라인 SVG 아이콘 (currentColor 를 따라가므로 테마에 맞게 색이 바뀝니다)
type P = { size?: number };
const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const SunIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const MonitorIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
export const SidebarIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
);
export const ExternalIcon = ({ size = 12 }: P) => (
  <svg {...base(size)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const ResetIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
export const ChevronsLeftIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
);
export const ChevronsRightIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
  </svg>
);
export const ChevronDownIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ChevronUpIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);
export const MaximizeIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);
export const MinimizeIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);
export const BookIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5 2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);
