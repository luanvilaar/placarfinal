/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: "export", // Desabilitado para permitir API routes (Gemini AI)
  // trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
