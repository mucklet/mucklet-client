const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const fs = require('fs');

module.exports = function(ctx) {

	// Get policies
	let policiesHtmlPlugins = [];
	let policiesPath = path.resolve(ctx.commonPath, 'static/policies');
	let pages = [ 'login', 'verify', 'reset', 'account', 'styleguide', 'start' ];
	fs.readdirSync(policiesPath).forEach(file => {
		let policy = JSON.parse(fs.readFileSync(path.resolve(policiesPath, file), 'utf8'));

		policiesHtmlPlugins.push(new HtmlWebpackPlugin({
			filename: 'policy/' + policy.slug + '.html',
			template: path.resolve(ctx.srcPath, ctx.devMode
				? 'policy/' + policy.slug + '.ejs'
				: 'policy/index.ejs',
			),
			templateParameters: {
				title: ctx.siteConfig.APP_TITLE,
				policyTitle: policy.title,
				policyCreated: policy.created,
				policyBody: policy.body,
			},
			chunks: [ 'policy' ],
		}));
	});

	return {
		entry: {
			app: path.resolve(ctx.srcPath, 'app.js'),
			policy: path.resolve(ctx.srcPath, 'policy/app-policy.js'),
			...pages.reduce((o, page) => Object.assign(o, { [page]: path.resolve(ctx.srcPath, page + '/app-' + page + '.js') }), {}),
		},
		performance: {
			hints: ctx.devMode ? false : 'warning',
			maxEntrypointSize: 512000,
			maxAssetSize: 2048000,
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
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'app' ],
			}),
			...pages.map(page => new HtmlWebpackPlugin({
				filename: page + '/index.html',
				template: path.resolve(ctx.srcPath, page + '/index.html'),
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ page ],
			})),
			...policiesHtmlPlugins,
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
		],
	};
};
