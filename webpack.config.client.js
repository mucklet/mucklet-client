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
	// transformSitemap looks for ${ NAME | MOD } patterns in a text, and replaces
	// them with the preset content.
	function transformSitemap(content, path) {
		let cfg = ctx.siteConfig;
		let fields = cfg.APP_ISTEMPLATE
			? {
				APP_NAME: () => `"{{ with .Realm }}{{ .Name | js }}{{ else }}Mucklet realm{{ end }}"`,
				APP_DESC: () => `"{{ with .Realm }}{{ .Desc | js }}{{ else }}A textual world of roleplay.{{ end }}"`,
				ICON_192x192_PNG_PATH: () => `"{{ .RootURL | js}}android-chrome-192x192.png"`,
				ICON_512x512_PNG_PATH: () => `"{{ .RootURL | js }}android-chrome-512x512.png"`,
				ICON_SITEICON_SVG_PATH: () => `"{{ .RootURL | js }}siteicon.svg"`,
			}
			: {
				APP_NAME: () => JSON.stringify(cfg.APP_TITLE),
				APP_DESC: () => JSON.stringify(cfg.APP_DESCRIPTION),
				ICON_192x192_PNG_PATH: () => JSON.stringify((cfg.APP_ROOT || "/") + "android-chrome-192x192.png"),
				ICON_512x512_PNG_PATH: () => JSON.stringify((cfg.APP_ROOT || "/") + "android-chrome-512x512.png"),
				ICON_SITEICON_SVG_PATH: () => JSON.stringify((cfg.APP_ROOT || "/") + "siteicon.svg"),
			};
		return content.toString().replace(/\$\{\s*([^}| ]*)\s*(?:|\|\s*([^} ]*)\s*)\}/g, (m, name, mod) => {
			let f = fields[name] || ((v, mod) => JSON.stringify("Unknown:" + v));
			return f(name, mod);
		});
	}

	return {
		entry: {
			app: path.resolve(ctx.srcPath, 'app.js'),
			welcome: path.resolve(ctx.srcPath, 'welcome/app-welcome.js'),
		},
		performance: {
			hints: ctx.devMode ? false : 'warning',
			maxEntrypointSize: 512000,
			maxAssetSize: 2048000,
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
					target: 'http://127.0.0.1:6453',
					pathRewrite: { '^/auth': '' },
					// logLevel: 'debug'
				},
				'/identity': {
					target: 'http://127.0.0.1:6451',
					pathRewrite: { '^/identity': '' },
					// logLevel: 'debug'
				},
				'/api': {
					target: 'http://127.0.0.1:8080',
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
					{ from: path.resolve(ctx.srcPath, 'dynamic'), transform: transformSitemap },
				],
			}),
			new HtmlWebpackPlugin({
				template: path.resolve(ctx.srcPath, 'index.html'),
				filename: 'index.html',
				title: ctx.siteConfig.APP_TITLE,
				chunks: [ 'app' ],
			}),
			new HtmlWebpackPlugin({
				filename: 'welcome/index.html',
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
			...ctx.disableServiceWorker ? [] : [
				new WorkboxPlugin.InjectManifest({
					swSrc: path.resolve(ctx.commonPath, 'workers/service-worker.js'),
					swDest: 'service-worker.js',
					maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
				}),
			],
		],
	};
};
