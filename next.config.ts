import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Permite enviar o logo do cliente (arquivo) via Server Action.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
