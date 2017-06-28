'use strict';

const fs             = require('fs');
const path           = require('path');
const sass           = require('node-sass');
const sassUtils      = require('node-sass-utils')(sass);
const sassExtensions = require('./sass-extensions');
const chalk          = require('chalk');
const cliSpinners    = require('cli-spinners');
const ora            = require('ora');
const pjson          = require('prettyjson-256');

module.exports = function ( keys, options ) {
	var input;

	// Set default variables
	if( typeof options.input === 'undefined' ) {
		input = './scarab.config.json'
	} else {
		input = options.input;
	}

	// Initialize spinner
	const spinner = ora({
		text:    'Parsing ' + chalk.blue(path.relative(process.cwd(), input)),
		spinner: cliSpinners.dots3,
		color:   'yellow'
	}).start();

	// If input path is an existing directory, build path to scarab.config.json
	if( fs.existsSync(input) && fs.lstatSync(input).isDirectory() ) {
		input = path.resolve(input, 'scarab.config.json');
	}

	// Validate input path
	if( !fs.existsSync(input) ) {
		spinner.fail(chalk.red('Error:') + ' ' + chalk.blue(input) + ' does not exist');
		process.exit(1);
	}

	// Parse input file
	const file         = fs.readFileSync(input);
	const fileData     = file.toString();
	const fileName     = path.basename(input);
	const dirName      = path.dirname(input);	
	const scarabConfig = JSON.parse(fileData);
	const SCARAB       = scarabConfig.SCARAB;

	spinner.stop();

	// Get value from SCARAB based on keys
	const scarabTree = [ '$SCARAB' ];
	var content = SCARAB;

	keys.forEach(function(key) {
		content = content[key];
		scarabTree.push(key);
	});

	const pjsonOptions = { };

	if( options.depth ) {
		pjsonOptions.depth = options.depth;
	}
	if( !options.color ) {
		pjsonOptions.noColor = true;
	}

	pjson.init(pjsonOptions);

	if( options.breadcrumbs ) {
		console.log( '\n' + chalk.dim.underline(scarabTree.join(' > ')) );
	}

	// Render content to screen based on type of content
	switch( typeof content ) {
		case 'object':
			if( options.formatting ) {
				console.log(pjson.render(content));
			} else {				
				console.log(content);
			}

			break;

		case 'boolean':
			if( options.formatting || options.color ) {
				if( content == true ) {
					console.log(chalk.bgGreen.bold(content));
				} else {
					console.log(chalk.bgRed.bold(content));
				}
			} else {
				console.log(content);
			}
			
			break;

		case 'string':
			console.log(content);
			break;

		default:
			console.log(typeof content);
			break;
	}
};
