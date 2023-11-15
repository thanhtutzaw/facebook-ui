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
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.cvent-assets.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cvent-assets.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.femalefirst.co.uk',
        port: '',
      },
    ],
  },
  // @ts-ignore
  webpack(config, options) {
    const { isServer } = options;
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    return config;
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