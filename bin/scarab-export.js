'use strict';

const fs             = require('fs');
const path           = require('path');
const sass           = require('node-sass');
const sassUtils      = require('node-sass-utils')(sass);
const sassExtensions = require('./sass-extensions');
const globImporter   = require('sass-glob-importer');
const chalk          = require('chalk');
const cliSpinners    = require('cli-spinners');
const ora            = require('ora');

module.exports = function ( input, outputDir ) {
	// Set default variables
	if( typeof outputDir === 'undefined' ) {
		outputDir = './'
	}

	// Initialize spinner
	const spinner = ora({
		text:    'Generating ' + chalk.blue('scarab.config.json') + ' from ' + chalk.yellow(input),
		spinner: cliSpinners.dots3,
		color:   'yellow'
	}).start();

	// Validate input path
	if( !fs.existsSync(input) ) {
		spinner.fail(chalk.red('Error: ') + chalk.blue(input) + ' does not exist');
		process.exit(1);
	}

	if( fs.lstatSync(input).isDirectory() ) {
		spinner.fail(chalk.red('Error: ') + chalk.blue(input) + ' is not a valid path to an .scss file');
		process.exit(1);
	}

	// Validate output path
	if( !fs.existsSync(outputDir) ) {
		spinner.fail(chalk.red('Error: ') + chalk.blue(outputDir) + ' does not exist');
		process.exit(1);
	}

	// Generate JSON file
	const cwd      = process.cwd();
	const file     = fs.readFileSync(input);
	const fileData = file.toString() + '$SCARAB-EXPORT: #{ scarabExport( $SCARAB ) };';
	const fileName = path.basename(input);
	const dirName  = path.dirname(input);

	process.chdir(dirName);

	sass.render({
		data: fileData,
		includePaths: [ path.join(__dirname, '../../') ],
		importer: globImporter(),
		functions: {
			'scarabExport($scarab)': function ( scarab ) {
				// Convert $SCARAB Sass variable to JSON
				const scarabObj = sassExtensions.sassMapToObject(scarab);
				const scarabJson = JSON.stringify({
					"createdFrom": dirName + '/' + fileName,
					"createdAt": new Date(),
					"SCARAB": scarabObj
				});

				process.chdir(cwd);

				// Write output file
				const outPath = path.join(outputDir, 'scarab.config.json');
				fs.writeFile(outPath, scarabJson, function(err) {
					if(err) {
						spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
						return process.exit(1);
					} else {
						spinner.succeed(chalk.blue(input) + ' → ' + chalk.green(outPath));
					}
				});

				return sass.types.Null.NULL;
			}
		}
	}, function(err, result) {
		if(err) {
			spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
		}
	});
};
