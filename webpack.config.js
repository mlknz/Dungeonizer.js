const webpack = require('webpack');
const path = require('path');

module.exports = (opts) => {

    const plugins = opts.prod ? [
        new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        })
    ] : [
        new webpack.ProvidePlugin({
            THREE: 'three'
        }),
        new webpack.HotModuleReplacementPlugin()
    ];

    return {
        entry: {
            dungeonVisualizer: ['./src/scripts/index.js'],
            dungeonizer: ['./src/scripts/dungeonGenerator/index.js']
        },
        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: '',
            filename: 'scripts/[name].js',
            libraryTarget: 'umd'
        },
        externals: {
            THREE: 'THREE'
        },
        plugins,
        module: {
            noParse: [
                path.join(__dirname, 'node_modules', 'three')
            ],
            preLoaders: [{
                test: /\.jsx?$/,
                loader: 'eslint',
                exclude: /(node_modules)/,
                include: path.join(__dirname, 'src/scripts')
            }],
            loaders: [{
                test: /\.jsx?$/,
                loader: 'babel',
                include: path.join(__dirname, 'src/scripts')
            }, {
                test: /\.(glsl|vert|frag)$/,
                loader: 'webpack-glsl'
            }, {
                test: /\.json$/,
                loader: 'json'
            }]
        },
        eslint: {emitWarning: true},
        debug: !opts.prod,

        devtool: opts.prod ? undefined : 'cheap-source-map'
    };
};
