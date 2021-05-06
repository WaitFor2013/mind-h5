module.exports = {
    devServer: {
      port: 3031,
      proxy: {
        '/mind': {
          target: 'http://127.0.0.1:3002/',
          changeOrigin: true,
        }
      },
    }
}