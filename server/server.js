import express from 'express';
import {createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
	'^/api': '',
  },
});

app.use('/api', apiProxy);

app.listen(PORT, () => {
  console.log(`Proxy server is running on ${PORT}`);
});
