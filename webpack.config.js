const path = require('path');

module.exports = {
	mode: 'development',
	entry: [
		__dirname + '/js/app.js',
        __dirname + '/css/style.scss'
	],
	output: {
        path: path.resolve(__dirname, 'dist'), 
        filename: 'js/app.min.js',
    },
	module: {
		rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [],
            }, {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: { outputPath: 'css/', name: '[name].min.css'}
                    },
                    'sass-loader'
                ]
            }
        ]
	},
};