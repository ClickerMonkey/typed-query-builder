const path = require('path');
const rootWebpackConfig = require('../../webpack.config');
const DESTINATION = path.resolve( __dirname, 'dist' );

module.exports = {
    ...rootWebpackConfig,
    entry: {
        main: require.resolve('./src/index.ts'),
    },
    output: {
        filename: '[name].js',
        path: DESTINATION,
        libraryTarget: 'umd',
        library: '[name]',
    }
};