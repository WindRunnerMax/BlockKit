import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { glob } from "glob";
import path from "path";
import importPlugin from "rollup-plugin-import";
import ts from "rollup-plugin-typescript2";

import { postcssPreserve } from "./script/postcss-preserve";

const IGNORES = ["src/**/*.d.ts"];
const ENTRIES = ["src/**/*.{ts,tsx}"];

/**
 * https://rollupjs.org/configuration-options/
 * @typedef { import("rollup").RollupOptions } RollupConfig
 * @return { Promise<RollupConfig[]> }
 */
export default async () => {
  const inputs = await Promise.all(ENTRIES.map(item => glob(item, { ignore: IGNORES })))
    .then(res => res.reduce((pre, cur) => [...pre, ...cur]))
    .then(entries => {
      return entries.map(fullPath => [
        fullPath,
        fullPath.replace(/^src\//, "").replace(/\.tsx?$/, ""),
      ]);
    })
    .then(arr => {
      return arr.reduce((res, [pre, cur]) => ({ ...res, [cur]: pre }), {});
    });

  const packages = require("./package.json");
  const deps = { ...packages.dependencies, ...packages.peerDependencies };
  const external = Object.keys(deps).map(key => new RegExp(`(^${key}$)|(^${key}/.*)`));

  const definedValues = {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.VERSION": JSON.stringify(process.env.BUILD_VERSION || packages.version),
  };

  const ES_CONFIG = {
    input: inputs,
    output: {
      dir: "./dist/es",
      format: "es",
      // https://rollupjs.org/faqs/#why-do-additional-imports-turn-up-in-my-entry-chunks-when-code-splitting
      hoistTransitiveImports: false,
    },
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs({ include: /node_modules/ }),
      ts({
        tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
        extensions: [".ts", ".tsx"],
      }),
      replace({
        values: definedValues,
        preventAssignment: true,
      }),
      postcssPreserve({
        preserveRoot: "./src",
        extract: "_.css",
        minimize: true,
        extensions: [".css", ".scss"],
      }),
      importPlugin({
        libraryName: "@arco-design/web-react",
        libraryDirectory: "es",
        exportName: "default",
        style: true,
      }),
      importPlugin({
        libraryName: "@arco-design/web-react/icon",
        libraryDirectory: "react-icon",
        exportName: "default",
        style: false,
      }),
    ],
    external: external,
  };

  const LIB_CONFIG = {
    input: inputs,
    output: {
      dir: "./dist/lib",
      format: "commonjs",
      // https://rollupjs.org/configuration-options/#output-preservemodules
      // 类似 BundleLess 模式保留模块独立性, 可能会造成依赖问题, 例如 tslib 会被处理为从 .pnpm 中引入
      // preserveModules: true,
      // preserveModulesRoot: "src",
      // https://rollupjs.org/configuration-options/#output-hoisttransitiveimports
      hoistTransitiveImports: false,
    },
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs({ include: /node_modules/ }),
      ts({
        tsconfig: path.resolve(__dirname, "./tsconfig.lib.json"),
        extensions: [".ts", ".tsx"],
      }),
      replace({
        values: definedValues,
        preventAssignment: true,
      }),
      postcssPreserve({
        preserveRoot: "./src",
        extract: "_.css",
        minimize: true,
        extensions: [".css", ".scss"],
      }),
      importPlugin({
        libraryName: "@arco-design/web-react",
        libraryDirectory: "lib",
        exportName: "default",
        style: true,
      }),
      importPlugin({
        libraryName: "@arco-design/web-react/icon",
        libraryDirectory: "react-icon-cjs",
        exportName: "default",
        style: false,
      }),
    ],
    external: external,
  };

  return [ES_CONFIG, LIB_CONFIG];
};
