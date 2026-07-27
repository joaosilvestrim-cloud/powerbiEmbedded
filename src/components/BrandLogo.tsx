"use client";

import { useState } from "react";

// Usa o logo oficial em /logo.png (é só colocar o arquivo em public/logo.png).
// Enquanto não houver o arquivo, mostra um SVG no espírito da marca.
export default function BrandLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [semImg, setSemImg] = useState(false);

  if (!semImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="DriveData"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: "contain" }}
        onError={() => setSemImg(true)}
      />
    );
  }

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
        <linearGradient id="ddGrad" x1="10" y1="8" x2="90" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ddc84" />
          <stop offset="0.5" stopColor="#14c1c9" />
          <stop offset="1" stopColor="#1a86e6" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#ddGrad)" />
      <path d="M35 30 L55 50 L35 70" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M53 30 L73 50 L53 70" stroke="#fff" strokeOpacity="0.55" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
