const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        // FIXME need to have a usable build artifact
        app: './example/basic.ts',
        vendor: ['virtual-dom', 'jquery'],
    },
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/assets/",
        filename: "bundle.js"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
	plugins: [
        require('webpack-fail-plugin'),
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),
	],
    //externals: {
    //    'jquery': 'jQuery',
    //    //'virtual-dom': false,
    //    //'virtual-dom/create-element': false,
    //    //'virtual-dom/diff': false,
    //    //'virtual-dom/patch': false,

    //}
};
