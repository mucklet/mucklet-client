const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');

module.exports = function(ctx) {
	return {
		entry: {
			app: path.resolve(ctx.srcPath, 'app.js'),
			welcome: path.resolve(ctx.srcPath, 'welcome/app-welcome.js'),
		},
		devServer: {
			port: 6450,
			allowedHosts: [
				'localhost',
				'mucklet.localhost',
			],
			proxy: {
				'/dockerauth': {
					target: 'http://auth.mucklet.localhost',
					pathRewrite: { '^/dockerauth': '' },
					changeOrigin: true,
					// logLevel: 'debug'
				},
				'/auth': {
					target: 'http://localhost:6453',
					pathRewrite: { '^/auth': '' },
					// logLevel: 'debug'
				},
				'/identity': {
					target: 'http://localhost:6451',
					pathRewrite: { '^/identity': '' },
					// logLevel: 'debug'
				},
				'/api': {
					target: 'http://localhost:8080',
					// logLevel: 'debug'
				},
			},
		},
		plugins: [
			new CleanWebpackPlugin(),
			new ESLintPlugin({
				exclude: [
					'node_modules/',
				],
				emitWarning: true,
			}),
			new CopyWebpackPlugin({
				patterns: [
					{ from: path.resolve(ctx.commonPath, 'static') },
					{ from: path.resolve(ctx.srcPath, 'static') },
				],
			}),
			new HtmlWebpackPlugin({
				template: path.resolve(ctx.srcPath, 'index.html'),
				filename: ctx.siteConfig.APP_ISTEMPLATE ? 'index.gohtml' : 'index.html',
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'app' ],
			}),
			new HtmlWebpackPlugin({
				filename: 'welcome/' + (ctx.siteConfig.APP_ISTEMPLATE ? 'index.gohtml' : 'index.html'),
				template: path.resolve(ctx.srcPath, 'welcome/index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'welcome' ],
			}),
			new MiniCssExtractPlugin({
				filename: ctx.devMode ? '[name].css' : '[name].[contenthash:8].css',
				chunkFilename: ctx.devMode ? '[name].css' : '[name].[contenthash:8].css',
			}),
			new Webpack.DefinePlugin(Object.assign(ctx.jsonEncodeObject(ctx.siteConfig), {
				APP_VERSION: JSON.stringify(ctx.pkg.version),
			})),
			new GenerateJsonPlugin('info.json', {
				version: ctx.pkg.version,
			}),
			...ctx.devMode ? [] : [
				new WorkboxPlugin.InjectManifest({
					swSrc: path.resolve(ctx.commonPath, 'workers/service-worker.js'),
					swDest: 'service-worker.js',
					maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
				}),
			],
		],
	};
};
