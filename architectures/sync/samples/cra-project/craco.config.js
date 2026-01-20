module.exports = {
  webpack: {
    configure: (config) => {
      // Enable WASM and Worker Support
      config.experiments = { 
        ...config.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true 
      };
      
      // Handle .wasm files via Webpack's wasm-loader
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      return config;
    }
  }
};
