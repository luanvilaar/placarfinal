/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Garante que use o SWC
  output: "export", // ESSENCIAL PARA HOSTINGER: Gera arquivos HTML/CSS puros que o Apache/LiteSpeed entende!
  trailingSlash: true, // Garante que rotas como /public virem /public/index.html na Hostinger
  images: {
    unoptimized: true, // Necessário para imagens funcionarem apenas com o SSG puro e sem servidor Node
  },
};

export default nextConfig;
