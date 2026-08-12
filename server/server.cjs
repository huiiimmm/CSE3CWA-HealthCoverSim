const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

const apiProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  pathRewrite: {
	'^/api': '',
  },
});

app.use('/api', apiProxy);

app.listen(PORT, () => {
  console.log(`Proxy server is running on ${PORT}`);
});

