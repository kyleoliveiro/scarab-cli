#!/usr/bin/env node

'use strict';

const program          = require('commander');
const scarabView       = require('./bin/scarab-view');
const scarabExport     = require('./bin/scarab-export');
const scarabInit       = require('./bin/scarab-init');
const scarabStyleguide = require('./bin/scarab-styleguide');
const pkg              = require('./package.json');

program
	.version(pkg.version)

program
	.command('view [keys...]')
		.description('View Scarab configuration in the terminal')
		.option('-i, --input [input]',  'Specify input file or directory')
		.option('-d, --depth [depth]',  'Maximum depth of nested levels to display')
		.option('-B, --no-breadcrumbs', 'Do not display breadcrumbs')
		.option('-C, --no-color',       'Print to stdout without colors')
		.option('-F, --no-formatting',  'Print to stdout without formatting')
		.action(function(keys, options) {
			scarabView(keys, options);
		})

program
	.command('export <file> [outputDir]')
		.description('Export Scarab configuration from .scss to .json')
		.action(function(file, outputDir) {
			scarabExport(file, outputDir);
		})

program
	.command('init [outputDir]')
		.description('Scaffold Scarab config folders and files')
		.action(function(outputDir, options) {
			scarabInit(outputDir, options)
		})

program
	.command('styleguide [outputDir]')
		.description('Scaffold a scarab-styleguide project')
		.option('-i, --input [input]', 'Specify path to scarab.config.json')
		.action(function(outputDirs, options) {
			scarabStyleguide(outputDirs, options)
		})

program.parse(process.argv);
