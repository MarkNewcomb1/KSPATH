// from https://stackoverflow.com/questions/50394789/webpack-4-compile-scss-to-separate-css-file

const path = require('path');

module.exports = {
	mode: 'development',
	entry: [
        __dirname + '/css/style.scss'
	],
	module: {
		rules: [
				{
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