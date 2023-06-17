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
    domains: ['upload.wikimedia.org', 'images.unsplash.com', 'cvent-assets.com', 'encrypted-tbn0.gstatic.com', 'www.femalefirst.co.uk'],
  },

}