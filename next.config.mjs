/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite portadas de campañas desde cualquier host (URLs de imagen libres).
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
