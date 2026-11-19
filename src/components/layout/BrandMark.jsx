import { palette } from "../../theme/tokens";

/** PowerPulse logo mark: a pulse line in a rounded tile. */
export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill={palette.inkSoft} />
      <path
        d="M5 17h5l2.5-6 4 12 3-9 2 3H27"
        fill="none"
        stroke={palette.accent}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
