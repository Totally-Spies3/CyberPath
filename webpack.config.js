const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const appDirectory = fs.realpathSync(process.cwd());


module.exports = {
    entry: path.resolve(appDirectory, "src/App.ts"), //path to the main .ts file

     // Configuration de la sortie
    output: {
        filename: "js/bundle.js", //name for the javascript file that is created/compiled in memory
        path: path.resolve(__dirname, 'dist'),
        clean: true // Nettoie le dossier dist à chaque build
    },

    // Résolution des extensions
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },

    // Modules et règles de transformation
    module: {
        rules: [
            // Règle pour TypeScript
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            // Règle pour les images
            {
                test: /\.(png|jpg|jpeg|gif|glb|gltf)$/i,
                type: 'asset/resource'
            }

        ],
    },
    mode: "development",

     // Plugins
  plugins: [
    // Génère automatiquement index.html dans dist
        new HtmlWebpackPlugin({
            inject: true,
            template: './public/index.html'
    })
  ],
  
  // Serveur de développement
  devServer: {
    static: './dist',
    open: true // Ouvre le navigateur automatiquement
  }
};