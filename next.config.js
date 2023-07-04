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
  // webpack(config) {
  // config.module.rules.push({
  //   test: /\.svg$/,
  //   use: ["@svgr/webpack"]
  // });
  // config.module.rules.push({
  //   test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
  //   use: {
  //     loader: 'url-loader',
  //     options: {
  //       limit: 100000
  //     }
  //   }
  // });
  // return config;
  // }

}