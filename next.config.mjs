/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "pub-c0844d8534c94020b91073881d016491.r2.dev" }],
  },
};

export default nextConfig;
