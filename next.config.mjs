/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://widgetembed.tradingview.com https://s.tradingview.com https://www.tradingview-widget.com https://www.tradingview.com https://*.tradingview.com https://*.tradingview-widget.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://*;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'self' https://s.tradingview.com https://widgetembed.tradingview.com https://www.tradingview-widget.com https://www.tradingview.com https://*.tradingview.com https://*.tradingview-widget.com;
  connect-src 'self' https://api.binance.com wss://stream.binance.com:9443 https://*.tradingview.com https://*.tradingview-widget.com https://s.tradingview.com https://www.tradingview-widget.com https://www.tradingview.com https://va.vercel-scripts.com;
`;

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Avoid bundling optional pino pretty/transport packages into the client build
    // and silence resolution attempts that can cause "Can't resolve 'pino-pretty'".
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'pino-pretty': false,
        'pino-std-serializers': false,
        'pino-abstract-transport': false,
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
}

export default nextConfig
