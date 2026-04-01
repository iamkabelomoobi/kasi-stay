const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

const resolveSingletonPackage = (packageName) => {
  for (const searchRoot of [projectRoot, workspaceRoot]) {
    try {
      return path.dirname(
        require.resolve(`${packageName}/package.json`, { paths: [searchRoot] }),
      );
    } catch {}
  }

  throw new Error(`Unable to resolve ${packageName}`);
};

config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  // Keep app code and Expo packages on the Expo SDK-compatible React instance.
  react: resolveSingletonPackage("react"),
  "react-dom": resolveSingletonPackage("react-dom"),
};

module.exports = config;
