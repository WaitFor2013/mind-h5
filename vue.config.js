module.exports = {
    devServer: {
      port: 3031,
      proxy: {
        '/mind': {
          //127
          target: 'http://121.4.123.204/',
          changeOrigin: true,
        }
      },
    }
}