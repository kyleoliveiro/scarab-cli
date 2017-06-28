'use strict';

const fs             = require('fs');
const mkdirp         = require('mkdirp');
const path           = require('path');
const exec           = require('child_process').exec;
const execSync       = require('child_process').execSync;
const sass           = require('node-sass');
const sassUtils      = require('node-sass-utils')(sass);
const sassExtensions = require('./sass-extensions');
const globImporter   = require('sass-glob-importer');
const chalk          = require('chalk');
const cliSpinners    = require('cli-spinners');
const ora            = require('ora');

module.exports = function ( outputDir, options ) {
	// Set default variables
	if( typeof outputDir === 'undefined' ) {
		outputDir = './styleguide'
	}

	// Initialize spinner
	const spinner = ora({
		text:    'Cloning scarab-styleguide into ' + chalk.blue(outputDir),
		spinner: cliSpinners.dots3,
		color:   'yellow'
	}).start();

	// Validate input path
	if(options.input) {
		if( !fs.existsSync(options.input) ) {
			spinner.fail(chalk.red('Error: Input file ') + chalk.blue(options.input) + ' does not exist');
			process.exit(1);
		}

		if( fs.lstatSync(options.input).isDirectory() ) {
			spinner.fail(chalk.red('Error: Input path ') + chalk.blue(options.input) + ' is not a valid path to a scarab.config.json file');
			process.exit(1);
		}
	}
	
	// Clone scarab-styleguide
	exec('git clone git@github.com:watchtowerdigital/scarab-styleguide.git ' + outputDir, (err) => {
		if(err) {
			spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
			process.exit(1);
		}

		// Copy scarab.config.json file
		if( options.input ) {
			spinner.text = 'Copying scarab.config.json';
			execSync('cp ' + options.input + ' ' + path.resolve(outputDir, options.input));
		}

		// Install dependencies
		spinner.text = 'Installing dependencies';
		exec('cd ' + outputDir + ' && npm install', (err) => {
			if(err) {
				spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
			}

			spinner.succeed('Styleguide generated → ' + chalk.green(outputDir) + '\n\nTo get started, run:\n' + chalk.blue('cd ' + outputDir + ' && npm run dev\n'));
		});
	});
};
