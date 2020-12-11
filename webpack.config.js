module.exports = {
    
    optimization: {
      usedExports: true,
      mangleExports: false,
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },
            {
                test: /\.ts$/,
                exclude: [ /node_modules/ ],
                use: 'ts-loader'
            }
        ]
    },
};