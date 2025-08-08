/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { esmExternals: "loose" }, // ayuda a resolver exports ESM
  webpack: (config) => {
    // Evita que undici (solo Node) se meta en el bundle del cliente
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
    };
    return config;
  },
};

module.exports = nextConfig;
