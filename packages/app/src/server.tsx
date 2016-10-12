import { RequestHandler, Request, Response, NextFunction } from 'express'
import { fromPairs } from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import * as React from 'react'
import { renderToString } from 'react-dom/server'

const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const flexbugs = require('postcss-flexbugs-fixes')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { compose } = require('compose-middleware')

import { App } from './active-route'
import { RouteMapper } from './matcher'
import { mountRoutes } from './mount'

const serverFile = 'server.js'

export interface RenderOpts {
  entryPoints: {
    client: string,
    server: string
  },
  enableServerSideRendering: boolean,
  enableMinification: boolean,
  enableHotReload: boolean,
  assetsPrefix: string,
  snippets: Snippet[],
  verbose?: boolean
}

export interface Snippet {
  headContent?: string
  bodyContent?: string
}

/**
 * Build any required assets and return a promise that resolves to the middleware
 * when the assets are build.
 */
export function create(opts: RenderOpts): Promise<RequestHandler> {
  const clientCompiler = webpackInstance(opts, 'client')
  const serverCompiler = webpackInstance(opts, 'server')

  try {
    fs.rmdirSync(opts.assetsPrefix)
  } catch (error) {}

  try {
    fs.mkdirSync(opts.assetsPrefix)
  } catch (error) {}

  try {
    fs.unlinkSync(serverFile)
  } catch (error) {}

  return Promise.all(opts.enableHotReload ? [] : [build(!opts.enableHotReload && clientCompiler),  build(serverCompiler)]).then(() =>
    compose([
      opts.enableHotReload && require('webpack-dev-middleware')(clientCompiler, {
        publicPath: '/',
        stats: { colors: true },
        historyApiFallback: true
      }),
      opts.enableHotReload && require('webpack-hot-middleware')(clientCompiler),
      pageRenderer(opts)
    ].filter(x => x))
  )
}

function build(compiler?: any): Promise<void> {
  if (!compiler) return Promise.resolve()

  return new Promise((resolve, reject) => {
    compiler.run((err: Error) => {
      if (err) {
        reject(err)

      } else {
        resolve()
      }
    })
  })
}

function pageRenderer(opts: RenderOpts): RequestHandler {
  const headerContents = opts.snippets
    .map(x => x.headContent)
    .filter(x => x)
    .join('\n')

  const bodyContents = opts.snippets
    .map(x => x.bodyContent)
    .filter(x => x)
    .join('\n')

  if (opts.enableServerSideRendering) {
    const routeModules = require(path.resolve(serverFile)).default
    const mapper = new RouteMapper(routeModules)

    return (req: Request, res: Response, next: NextFunction) => {
      return renderPage(req, opts, mapper).then((content: string) => {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        })

        res.write(
`<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf8">
  ${headerContents}
  <script src="/bundle.js"></script>
  <title></title>
</head>
<body>
  <div id="app">
    ${content}
  </div>
  <script>
    var __initialAppState = ${JSON.stringify({})}
  </script>
  ${bodyContents}
</body>
</html>`
        )
        res.end()
      })
    }
  } else {
    return (req: Request, res: Response, next: NextFunction) => {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.write(
`<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf8">
  ${headerContents}
  <script src="/bundle.js"></script>
  <title></title>
</head>
<body>
  <div id="app"></div>
  ${bodyContents}
</body>
</html>`
      )
      res.end()
    }
  }
}

function renderPage(request: Request, opts: RenderOpts, mapper: RouteMapper): Promise<string> {
  const store = createStore(
    combineReducers({}),
    applyMiddleware(
      thunk
    )
  )

  const match = mapper.match(request.path)
  if (!match) {
    return Promise.reject(new Error('Unhandled 404'))
  }

  return mountRoutes({
    store,
    mapper,
    addedRoutes: match.ids,
    params: match.params,
    removedRoutes: [],
    routeState: {}
  })
  .then(() => renderToString(<App store={store} mapper={mapper} initialMatch={match} />))
}

function webpackInstance(opts: RenderOpts, mode: 'client'|'server') {
  const browsers = ['> 2%', 'ie >= 10']

  const processEnv = fromPairs(
    Object.keys(process.env).map(key => ['process.env.' + key, JSON.stringify(process.env[key])])
  )

  const scssLoader = [
    'css-loader?' + ['localIdentName=[local]__[hash:base64:4]', 'modules', 'importLoaders=1', 'sourceMap'].join('&'),
    'postcss-loader',
    'sass-loader'
  ].join('!');

  const nodeModules: any = {}
  fs.readdirSync('node_modules')
    .filter(function(x) {
      return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
      nodeModules[mod] = 'commonjs ' + mod;
    })

  const config = {
    devtool: opts.enableHotReload ? 'module-source-map' : undefined,
    target: (mode === 'server') ? 'node' : 'web',
    externals: (mode === 'server') ? nodeModules : undefined,
    output: {
      filename: (mode === 'client') ? 'bundle.js' : serverFile,
      // chunkFilename: '[name].js',
      path: (mode === 'client') ? path.resolve(opts.assetsPrefix) : path.dirname(path.resolve(serverFile)),
      publicPath: '/'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      modules: [
        'node_modules'
      ]
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          loader: 'ts',
        },
        {
          test: /\.scss$/,
          loader: !opts.enableHotReload ? ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: scssLoader,
            allChunks: true,
          }) : 'style-loader!' + scssLoader
        },
        {
          test: /\.css$/,
          loader: !opts.enableHotReload ? ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader!postcss-loader',
            allChunks: true,
          }) : 'style-loader!css-loader!postcss-loader'
        },
        {
          test: /\.(jpg|png|svg)$/,
          loader: 'file',
          query: {
            name: '[name].[hash].[ext]'
          }
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/,
          loader: 'url',
          query: {
            name: '[name].[hash].[ext]',
            limit: 25000,
          }
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        }
      ],
    },
    entry: [
      'normalize.css/normalize.css',
    ].concat(
      (mode === 'client') ? [
        'es6-promise',
        'whatwg-fetch',
        opts.entryPoints.client,
      ] : [
        'node-fetch',
        opts.entryPoints.server,
      ]
    ).concat(
      (mode === 'client' && opts.enableHotReload) ? [
        'webpack-hot-middleware/client?reload=true',
      ] : []
    ),
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: opts.enableMinification,
        debug: (process.env.NODE_ENV !== 'production'),
        options: {
        ts: {
          transpileOnly: true,
          compilerOptions: {
            isolatedModules: true,
            noEmitOnError: false
          }
        },
        postcss: () => [ flexbugs, autoprefixer({ browsers }) ],
        }
      }),
      new webpack.DefinePlugin(processEnv),
    ].concat(
      (mode === 'client') ? (
        opts.enableHotReload ? [
          new webpack.optimize.OccurrenceOrderPlugin(false),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoErrorsPlugin(),
        ] : [
          new ExtractTextPlugin({ filename: "style.css", allChunks: true }),
          new webpack.optimize.OccurrenceOrderPlugin(false),
        ]
      ) : []
    ).concat(
      opts.enableMinification ? [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            properties: true,
            sequences: true,
            dead_code: true,
            conditionals: true,
            comparisons: true,
            evaluate: true,
            booleans: true,
            unused: true,
            loops: true,
            hoist_funs: true,
            cascade: true,
            if_return: true,
            join_vars: true,
            negate_iife: true,
            unsafe: true,
            hoist_vars: true,
          },
          output: {
            comments: false,
          },
        })
      ] : []
    )
  }

  if (opts.verbose) {
    const { inspect } = require('util')
    process.stderr.write(
      `*** ${mode} webpack config ***\n${inspect(config, { depth: null, colors: true })}\n\n`
    )
  }

  return webpack(config)
}
