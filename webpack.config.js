const path = require('path');

const buildMode = process.env.NODE_ENV;
const isProductionMode = buildMode === 'production';

/**
 * Targeting `>0.1%, not dead`.
 *
 * {@link https://browserslist.dev/?q=PjAuMSUsIG5vdCBkZWFk}
 */
const targetBrowsers = isProductionMode
  ? ['chrome79', 'firefox95', 'safari13.1', 'edge96']
  : ['es2020'];

module.exports = () => {
  return {
    mode: buildMode,
    entry: './src/index.js',
    devtool: isProductionMode ? false : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'esbuild-loader',
              options: {
                loader: 'jsx',
                target: targetBrowsers,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'esbuild-loader',
              options: {
                loader: 'css',
                minify: isProductionMode,
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(svg|png)/,
          use: ['file-loader'],
        },
      ],
    },
    output: {
      path: path.join(__dirname, './dist'),
      filename: 'freemius-pricing.js',
      library: ['Freemius'],
      libraryTarget: 'umd',
    },
    // We cannot use ESBuild mimizer because our code-base isn't strictly ES Module.
    // We still have some side-effecty imports.
    // optimization: isProductionMode ?
    // {
    //     minimize: isProductionMode,
    //     nodeEnv: buildMode,
    //     minimizer: [new ESBuildMinifyPlugin({
    //         target: targetBrowsers
    //     })]
    // } :
    // undefined,
    optimization: {
      nodeEnv: buildMode,
      minimize: buildMode === 'production',
    },
  };
};
