const TerserPlugin = require( "terser-webpack-plugin" );
const path = require( "path" );
module.exports = {
	mode: "production",
	target: [ "es2020" ],
	entry: "./src/index.ts",
	output: {
		path: path.resolve( __dirname, "./build/packs/Behavior Pack/scripts" ),
		filename: "index.js",
		chunkFormat: "commonjs",
	},
	resolve: { extensions: [ ".ts", ".tsx", ".js" ] },
	experiments: { outputModule: true },
	externalsType: "module",
	externals: {
		"@minecraft/server": "@minecraft/server",
		"@minecraft/server-ui": "@minecraft/server-ui",
		"@minecraft/server-net": "@minecraft/server-net",
		"@minecraft/server-admin": "@minecraft/server-admin",
		"@minecraft/server-editor": "@minecraft/server-editor",
		"@minecraft/server-gametest": "@minecraft/server-gametest",
		"@minecraft/server-editor-bindings": "@minecraft/server-editor-bindings",
	},
	module: { rules: [{ test: /\.tsx?$/, loader: "ts-loader" }] },
	plugins: [
		new TerserPlugin({
			terserOptions: {
			  	output: { comments: false },
			},
		}),
	],
};