/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for all pages — this is a fully dynamic auth app
  // that requires Supabase env vars at runtime
  experimental: {},
}

export default nextConfig
