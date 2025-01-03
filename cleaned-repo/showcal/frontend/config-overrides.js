const webpack = require('webpack');

module.exports = function override(config, env) {
  // Polyfill fallbacks for common Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process": require.resolve("process/browser"), // Fix for process module
    "http": require.resolve("stream-http"), // Polyfill for http module
    "https": require.resolve("https-browserify"), // Polyfill for https module
    "stream": require.resolve("stream-browserify"), // Polyfill for stream module
    "assert": require.resolve("assert"), // Polyfill for assert module
    "url": require.resolve("url/"), // Polyfill for url module
    "fs": false, // Ignore fs module if it's not used
  };

  // Add ProvidePlugin for process and buffer
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser', // Ensure process is available globally
      Buffer: ['buffer', 'Buffer'], // Provide Buffer globally
    }),
  ]);

  return config;
};