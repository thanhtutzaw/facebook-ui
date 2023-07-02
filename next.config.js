/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

module.exports = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['www.cvent-assets.com', 'upload.wikimedia.org', 'firebasestorage.googleapis.com', 'images.unsplash.com', 'cvent-assets.com', 'encrypted-tbn0.gstatic.com', 'www.femalefirst.co.uk'],
  },

}