import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp ist ein natives Modul → nicht bundeln, zur Laufzeit aus node_modules laden.
  serverExternalPackages: ["sharp"],
  experimental: {
    // Server Action darf Bild-Uploads entgegennehmen (Default 1 MB ist zu wenig).
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
