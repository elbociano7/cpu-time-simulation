const path = require('path');

module.exports = [
  {
    entry: './src/index.ts',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'CpuTimeSimulation',
        type: 'umd',
      },
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    mode: 'production',
    devtool: 'source-map',
  },
];