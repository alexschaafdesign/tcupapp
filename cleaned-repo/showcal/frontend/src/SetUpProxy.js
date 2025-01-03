const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('THIS FILE IS BEING LOADED');
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
});

// Proxy middleware setup for development
module.exports = function(app) {
    console.log('💡 PROXY SETUP STARTING');
    
    app.use('/test', (req, res) => {
      console.log('Test route hit!');
      res.send('Test route works');
    });

    const xfProxy = createProxyMiddleware({
        target: 'https://tcupboard.org',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/api/xenforo/recent-threads': '/api/threads/recent'
        },
        headers: {
          'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f',
          'XF-Api-User': '1'
        }
    });

    // Xenforo proxy first
    app.use('/api/xenforo', (req, res, next) => {
        console.log('Incoming request:', req.method, req.url);
        xfProxy(req, res, next);
      });

      
  
    // Express backend proxy
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: undefined,
        logLevel: 'debug',
      })
    );
  };