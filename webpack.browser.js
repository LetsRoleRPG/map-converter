const path = require('path');

module.exports = env => {
    const webpackConfig = {
        entry: './src/browser.ts',
        mode: env.mode,
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.browser.json"
                        }
                    }],
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: 'converter.browser.js',
            path: path.resolve(__dirname, 'dist'),
        },
        watch: env.mode === 'development'
    };

    if (env.mode === 'production') {
        const TerserPlugin = require("terser-webpack-plugin");

        webpackConfig.optimization = {
            minimize: true,
            minimizer: [new TerserPlugin()],
        };

        webpackConfig.output.filename = 'converter.browser.min.js';
    }

    return webpackConfig;
};