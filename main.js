"use strict";

//Stuff that is required for things to work or it wont work.
const battlegrounds = require('battlegrounds');
const math = require('mathjs');
const fs = require('fs');

var config, api, argv = false;
if (fs.existsSync("config.json")) {
	config = require('./config.json');
	api = new battlegrounds(config.api_key);
	argv = process.argv;
	require('./modules/misc.js').startPUBGNode(config, argv);
} else { console.error("config.json does not exist, please create it or redownload from github <3"); process.exit() }
