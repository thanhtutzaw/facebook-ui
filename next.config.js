/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['upload.wikimedia.org', 'images.unsplash.com', 'encrypted-tbn0.gstatic.com', 'www.femalefirst.co.uk'],
  },

}

module.exports = nextConfig

