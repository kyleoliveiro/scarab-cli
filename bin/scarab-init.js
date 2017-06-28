'use strict';

const fs             = require('fs');
const mkdirp         = require('mkdirp');
const path           = require('path');
const exec           = require('child_process').exec;
const execSync       = require('child_process').execSync;
const replace        = require('replace-in-file');
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
		outputDir = 'scarab-config'
	}

	// Initialize spinner
	const spinner = ora({
		text:    'Scaffolding Scarab configuration files and folders in ' + chalk.blue(outputDir),
		spinner: cliSpinners.dots3,
		color:   'yellow'
	}).start();

	// Validate input path
	if(options.input) {
		if( !fs.existsSync(options.input) ) {
			spinner.fail(chalk.red('Error: Input file ') + chalk.blue(options.input) + ' does not exist');
			process.exit(1);
		}

		if( fs.lstatSync(input).isDirectory() ) {
			spinner.fail(chalk.red('Error: Input path ') + chalk.blue(input) + ' is not a valid path to a scarab.config.json file');
			process.exit(1);
		}
	}
	
	// Clone scarab-carapace config folder
	exec('svn export --trust-server-cert https://github.com/watchtowerdigital/scarab-carapace/trunk/src/config ' + outputDir, (err) => {
		if(err) {
			spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
			process.exit(1);
		};

		// Scaffold modules folder
		exec('echo "// Custom module config" >> ' + outputDir + '/modules.config.scss', (err) => {
			if(err) {
				spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
				process.exit(1);
			};

			// Perform text replacement
			replace({
				files: [
					path.join(outputDir + '/**/*.scss')
				],
				from: /set-default/g,
				to: 'set'
			})
			.then(changedFiles => {
				console.log(changedFiles);
				spinner.succeed('Config files and folders generated → ' + chalk.green(outputDir));
			})
			.catch(err => {
				spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
				process.exit(1);
			});
		});
	});
};
