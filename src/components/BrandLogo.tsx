// Marca do portal — tile com gradiente verde→azul (identidade DriveData)
// e um duplo chevron de avanço ("drive"/forward). Limpo e escalável.
// Para usar o logo OFICIAL: coloque o PNG em public/logo.png e troque o
// retorno por <img src="/logo.png" width={size} height={size} alt="DriveData" />.
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
      role="img"
      aria-label="DriveData"
    >
      <defs>
        <linearGradient
          id="ddGrad"
          x1="10"
          y1="6"
          x2="90"
          y2="94"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3ddc84" />
          <stop offset="0.5" stopColor="#15b8c9" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#ddGrad)" />
      <path
        d="M34 30 L54 50 L34 70"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 30 L72 50 L52 70"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
