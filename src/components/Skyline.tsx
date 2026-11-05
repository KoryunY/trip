// Stylised Prague skyline (castle + St. Vitus, Charles Bridge tower, Týn spires, Žižkov TV tower).
export function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path
        fill="currentColor"
        d="M0 120V96h14v-6h10v6h8V84h6v-8l4-6 4 6v8h6v12h10V88h18v-6h4v-6h3v-9l3-8 3 8v9h3v6h4v6h6V70l5-12 5 12v8h4V62l4-14 4 14v16h8V74l3-6 3 6v14h12v-8h10v-6h5l3-14 3 14h5v6h6v16h8V90h10V78l2-4 2 4v12h6V60l3-10h1l2-14 2 14h1l3 10v36h6V64l4-12 4 12v32h4V84h12v12h8V70h4V56h2V44h3V30l3-6 3 6v14h3v12h2v14h4v26h10v-8h14v8h10V80h4l4-8 4 8h4v16h10V92h22v28z"
      />
      <path fill="currentColor" d="M290 120V44h-3v-6h3V22h5v16h4v6h-4v76z M305 120V40h4V18h4v22h4v80z" opacity=".9" />
    </svg>
  );
}
