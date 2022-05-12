const path = require('path');

module.exports = {
    entry: './src/app.ts',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'converter.js',
        path: path.resolve(__dirname, 'dist'),
    },
};