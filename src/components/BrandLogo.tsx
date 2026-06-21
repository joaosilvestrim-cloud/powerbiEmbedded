// Marca do portal. Aproximação do logo DriveData (gradiente verde→azul,
// "D" com setas de avanço). Para usar o logo oficial, coloque o arquivo em
// public/logo.png e troque este SVG por <img src="/logo.png" .../>.
export default function BrandLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DriveData"
    >
      <defs>
        <linearGradient id="ddGrad" x1="15" y1="6" x2="85" y2="94"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ddc84" />
          <stop offset="0.5" stopColor="#14b8d4" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Corpo do "D" */}
      <path
        d="M34 8 H50 A42 42 0 1 1 50 92 H34 Z"
        fill="url(#ddGrad)"
      />
      {/* Setas de avanço (espaço negativo) */}
      <path
        d="M14 26 L40 50 L14 74 V58 L23 50 L14 42 Z"
        fill="url(#ddGrad)"
      />
    </svg>
  );
}
