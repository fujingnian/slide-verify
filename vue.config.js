const path = require("path");

module.exports = {
  // publicPath: process.env.BASE_URL,
  // outputDir: process.env.outputDir,
  // lintOnSave: process.env.NODE_ENV === "development",
  // productionSourceMap: false,
  devServer: {
    port: 9527,
    open: true,
  },
  configureWebpack: (config) => {
    config.resolve = {
      alias: {
        "@": path.join(__dirname, "src"),
        "@a": path.join(__dirname, "src/assets"),
      },
    };
  },
};