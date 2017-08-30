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
		outputDir = 'scss'
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
	exec('svn export --trust-server-cert https://github.com/watchtowerdigital/scarab-carapace/trunk/src/config ' + outputDir + '/scarab-config', (err) => {
		if(err) {
			spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
			process.exit(1);
		};

		const scarabImport = `@import 'scarab-carapace/core';    // Imports scarab-scss, core utils & config
@import 'scarab-config/_';         // Your custom Carapace config
@import 'scarab-carapace/config';  // Imports default module config
@import 'scarab-config/modules';   // Your custom Carapace module config`;

		// Scaffold scarab import file
		exec('echo "' + scarabImport + '" >> ' + outputDir + '/scarab-index.scss', (err) => {
			if(err) {
				spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
				process.exit(1);
			};
		});

		// Scaffold module config file
		exec('echo "// Custom module config" >> ' + outputDir + '/scarab-config/modules.scss', (err) => {
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
				// Create carapace-modules.scss
				const carapaceModules = `@import 'scarab-index';
				@import 'scarab-carapace/modules';    // Generates CSS classes`;

				exec('echo "' + carapaceModules + '" >> ' + outputDir + '/carapace-modules.scss', (err) => {
					if(err) {
						spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
						process.exit(1);
					};

					spinner.succeed('Config files and folders generated → ' + chalk.green(outputDir));
				})
			})
			.catch(err => {
				spinner.fail(chalk.red('Error: ') + chalk.yellow(err.message));
				process.exit(1);
			});
		});
	});
};
