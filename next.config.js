/** @type {import('next').NextConfig} */
export const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.experiments = { topLevelAwait: true, layers: true };
    return config;
  }
}


