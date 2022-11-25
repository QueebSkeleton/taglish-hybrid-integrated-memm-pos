const path = require('path');

const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.js",
    output: {
        path: path.resolve("../../static/tagger/js/spa"),
        filename: "annotator.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    plugins: [
        new CleanTerminalPlugin(),
    ]
};
