const path = require('path');

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;

    return {
        devtool: "cheap-module-source-map",
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
        }
    };
};
