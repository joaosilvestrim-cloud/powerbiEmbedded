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
        <linearGradient id="ddGrad" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ddc84" />
          <stop offset="0.5" stopColor="#14c1c9" />
          <stop offset="1" stopColor="#1a86e6" />
        </linearGradient>
      </defs>
      {/* Corpo "D" */}
      <path d="M40 10 H52 A40 40 0 1 1 52 90 H40 Z" fill="url(#ddGrad)" />
      {/* Lâmina de avanço (superior) */}
      <path d="M14 20 L44 50 L26 68 L2 44 V26 Z" fill="url(#ddGrad)" opacity="0.9" />
      {/* Lâmina de avanço (inferior) */}
      <path d="M12 54 L34 76 L20 90 L4 74 V60 Z" fill="url(#ddGrad)" opacity="0.75" />
    </svg>
  );
}
