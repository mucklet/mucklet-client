const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

const env = process.env.NODE_ENV || 'development';
const appName = process.env.APP_NAME || null;
const cfgName = process.env.CFG_NAME || env;
const devMode = env != 'production';
const commonPath = path.resolve(__dirname, 'src/common/');

function jsonEncodeObject(o) {
	let jo = {};
	for (let k in o) {
		if (o.hasOwnProperty(k)) {
			jo[k] = JSON.stringify(o[k]);
		}
	}
	return jo;
}

function resolveFirstExistingFile(filePath, files) {
	let p;
	for (let file of files) {
		p = path.resolve(filePath, file);
		if (fs.existsSync(p)) {
			break;
		}
	}
	return p;
}

const apps = [ 'client', 'hub' ];
let appExports = [];
for (let app of apps) {
	// If an appName is given, skip all the others.
	if (appName && app != appName) {
		continue;
	}
	let ctx = { app, env, devMode, commonPath, pkg, jsonEncodeObject };
	ctx.srcPath = path.resolve(__dirname, 'src/', app);
	ctx.buildPath = path.resolve(__dirname, 'build/', app);
	ctx.cfgPath = path.resolve(__dirname, 'cfg/', app);

	// Resolve site config file path
	let siteConfigPath = resolveFirstExistingFile(ctx.cfgPath, [
		'site.config.' + cfgName + '.js',
		'site.config.' + env + '.js',
		'site.config.js',
	]);
	ctx.siteConfig = require(siteConfigPath);

	// Resolve module config file path
	let moduleConfigPath = resolveFirstExistingFile(ctx.cfgPath, [
		'module.config.' + cfgName + '.js',
		'module.config.' + env + '.js',
		'module.config.js',
	]);
	ctx.alias = {
		'moduleConfig$': moduleConfigPath,
	};

	let aliasPath = path.resolve(__dirname, 'webpack.alias.js');
	if (fs.existsSync(aliasPath)) {
		let aliasFile = require(aliasPath);
		for (let mod in aliasFile) {
			ctx.alias[mod] = path.resolve(__dirname, aliasFile[mod]);
		}
	}

	let appExport = {
		mode: ctx.devMode ? 'development' : 'production',
		devtool: ctx.devMode ? 'eval-source-map' : 'source-map',
		output: {
			path: ctx.buildPath,
			filename: ctx.devMode ? '[name].js' : '[name].[chunkhash:8].js',
			chunkFilename: ctx.devMode ? '[name].js' : '[name].[chunkhash:8].js',
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
			},
			concatenateModules: !ctx.devMode,
		},
		resolve: {
			alias: ctx.alias,
			modules: [
				'node_modules',
				ctx.srcPath,
				commonPath,
			],
		},
		module: {
			rules: [
				{
					test: /\.mjs$/,
					include: /node_modules/,
					type: 'javascript/auto',
				},
				{
					test: /\.(js)$/,
					exclude: /node_modules/,
					use: 'babel-loader',
				},
				{
					test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/i,
					type: 'asset/resource',
				},
				{
					test: /\.(sa|sc|c)ss$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						'sass-loader',
					],
				},
			],
		},
	};

	let appConfigPath = path.resolve(__dirname, 'webpack.config.' + app + '.js');
	if (fs.existsSync(appConfigPath)) {
		let appConfig = require(appConfigPath);
		appConfig = typeof appConfig == 'function' ? appConfig(ctx) : appConfig;
		Object.assign(appExport, appConfig);
	}

	appExports.push(appExport);
}

module.exports = appExports;
