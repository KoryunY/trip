// Stylised Prague skyline: Týn church spires, St. Vitus, Charles Bridge tower, Žižkov TV tower.
export function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="currentColor">
        <rect x="0" y="104" width="400" height="16" />
        <rect x="0" y="92" width="26" height="20" />
        <rect x="22" y="84" width="20" height="28" />
        <path d="M46 112V80l8-18 8 18v32z" />
        <rect x="64" y="94" width="18" height="18" />
        <path d="M86 112V62l7-28 7 28v50z" />
        <path d="M104 112V62l7-28 7 28v50z" />
        <rect x="84" y="78" width="36" height="34" />
        <path d="M124 112V90l6-8 6 8v22z" />
        <rect x="140" y="96" width="30" height="16" />
        <path d="M150 96l6-10 6 10z" />
        <path d="M174 112V84h12V66l7-34 7 34v18h30v28z" />
        <path d="M206 84l6-14 6 14z" />
        <path d="M234 112V88l5-6 5 6v24z" />
        <rect x="248" y="94" width="40" height="18" />
        <path d="M262 94l6-12 6 12z" />
        <rect x="292" y="86" width="22" height="26" />
        <rect x="324" y="26" width="7" height="86" />
        <rect x="320" y="44" width="15" height="10" rx="3" />
        <rect x="321" y="62" width="13" height="8" rx="3" />
        <rect x="340" y="90" width="26" height="22" />
        <rect x="366" y="98" width="34" height="14" />
      </g>
    </svg>
  );
}
