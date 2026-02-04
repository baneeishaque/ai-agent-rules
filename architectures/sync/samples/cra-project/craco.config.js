const path = require("path");

module.exports = {
  webpack: {
    configure: (config) => {
      // 1. Remove ModuleScopePlugin to allow imports outside of src/
      const scopePluginIndex = config.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );
      if (scopePluginIndex !== -1) {
        config.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // 2. Allow transpilation of shared monorepo components
      const { isFound, match } = require("@craco/craco").getLoader(
        config,
        require("@craco/craco").loaderByName("babel-loader")
      );

      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];

        match.loader.include = include.concat([
          path.resolve(__dirname, "../shared/src"),
          path.resolve(__dirname, "../../packages/core/src"),
        ]);
      }

      // 3. Enable WASM support
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true
      };

      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      return config;
    }
  }
};
