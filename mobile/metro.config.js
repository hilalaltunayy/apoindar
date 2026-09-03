// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the shared /lib so edits to the pure domain/config hot-reload here too.
config.watchFolders = [path.resolve(repoRoot, "lib")];

// Resolve deps from the mobile node_modules only (the web repo is not a workspace).
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
