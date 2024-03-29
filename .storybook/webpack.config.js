module.exports = {
  resolve: {
    extensions: ['', '.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loaders: ['ts-loader'],
        exclude: [/node_modules/]
      },
      {
        test: /\.json$/,
        loaders: ['json-loader'],
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css?modules&localIdentName=[name]__[local]!postcss!sass']
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
      {
        test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: 'url-loader?limit=100000',
      },
    ]
  },
  ts: {
    transpileOnly: true,
    compilerOptions: {
      isolatedModules: true,
      noEmitOnError: false,
      declaration: false,
      target: 'es5'
    }
  }
}
