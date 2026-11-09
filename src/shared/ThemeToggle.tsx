import { MonitorIcon, MoonIcon, SunIcon } from './icons';
import { setThemePref, useThemePref, type ThemePref } from './theme';

const options: { value: ThemePref; label: string; Icon: typeof SunIcon }[] = [
  { value: 'light', label: '라이트 모드', Icon: SunIcon },
  { value: 'dark', label: '다크 모드', Icon: MoonIcon },
  { value: 'system', label: '시스템 설정 따르기', Icon: MonitorIcon },
];

export default function ThemeToggle() {
  const pref = useThemePref();
  return (
    <div className="segmented" role="group" aria-label="테마">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={pref === value}
          onClick={() => setThemePref(value)}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
