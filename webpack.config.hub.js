const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');

module.exports = function(ctx) {
	return {
		entry: {
			app: path.resolve(ctx.srcPath, 'app.js'),
			login: path.resolve(ctx.srcPath, 'login/app-login.js'),
			verify: path.resolve(ctx.srcPath, 'verify/app-verify.js'),
			reset: path.resolve(ctx.srcPath, 'reset/app-reset.js'),
		},
		devServer: {
			port: 6460,
			allowedHosts: [
				'localhost',
				'mucklet.localhost',
			],
			proxy: {
				'/identity': {
					target: 'http://localhost:6451',
					pathRewrite: { '^/identity': '' },
					// logLevel: 'debug'
				},
				'/api': {
					target: 'http://localhost:8080',
					// logLevel: 'debug'
				},
			}
		},
		plugins: [
			new CleanWebpackPlugin(),
			new ESLintPlugin({
				exclude: [
					'/node_modules/',
				],
				emitWarning: true
			}),
			new CopyWebpackPlugin({
				patterns: [
					{ from: path.resolve(ctx.commonPath, 'static') },
					{ from: path.resolve(ctx.srcPath, 'static') }
				]
			}),
			new HtmlWebpackPlugin({
				template: path.resolve(ctx.srcPath, 'index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'app' ],
			}),
			new HtmlWebpackPlugin({
				filename: 'login/index.html',
				template: path.resolve(ctx.srcPath, 'login/index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'login' ],
			}),
			new HtmlWebpackPlugin({
				filename: 'verify/index.html',
				template: path.resolve(ctx.srcPath, 'verify/index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'verify' ],
			}),
			new HtmlWebpackPlugin({
				filename: 'reset/index.html',
				template: path.resolve(ctx.srcPath, 'reset/index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'reset' ],
			}),
			new MiniCssExtractPlugin({
				filename: ctx.devMode ? '[name].css' : '[name].[contenthash:8].css',
				chunkFilename: ctx.devMode ? '[name].css' : '[name].[contenthash:8].css'
			}),
			new Webpack.DefinePlugin(Object.assign(ctx.jsonEncodeObject(ctx.siteConfig), {
				APP_VERSION: JSON.stringify(ctx.pkg.version)
			})),
			new GenerateJsonPlugin('info.json', {
				version: ctx.pkg.version,
			}),
		],
	};
};
