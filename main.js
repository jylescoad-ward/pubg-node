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
} else { console.error("config.json does not exist, please create it or redownload from github <3"); process.exit() }
if (config.api_key === "not_set") {
	setup();
} else {
	switch (argv[2]) {
		case '-m':
		case '--export-match-data':
			getmatchdata();
			break;
		case '-mu':
		case '--latest-match-from-username':
			getlatestmatchfromusername();
			break;
		case '-mhtml':
		case '--match-export-to-html':
			exportashtml();
			break;
		case '-muhtml':
		case '--match-export-to-html-from-username':
			exportashtmlfromuname();
			break;
		case '-p':
		case '--get-player-info':
			getplayerinfo();
			break;
		case '-lm':
		case '--get-latest-matchid-from-username':
			latestmatchidfromusername();
			break;
		case '-c':
		case '--cleanup':
			cleanup();
			break;
		case '-s':
		case '--setup':
			setup();
			break;
		case '-h':
		case '--help':
			help();
			break;
		default:
			console.log("No Valid Arguments Recognised, Try './tool --help' or 'node main.js --help'");
			break;
	}
}



//Time for the ACTual FUCKING FUNCTIONS!!!!!!!!!

//Exports Match Data from PUBG MatchID Given in process.argv[3] (./tool -m        ./tool --export-match-data)
//Get Latest Match Data and Export to a Comma Seperated Value File for Easier Reading!
async function getmatchdata() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -m [PUBG MatchID]");
		})
	} else {
		require('./modules/export.js').csv(argv[3]);
	}
}


//Exports Latest Match from Username Given in process.argv[3]
async function getlatestmatchfromusername() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -mu [PUBG Username]");
		})
	} else {
		require('./modules/user.js').raw(argv[3]).then(async function (result_) {
			require('./modules/export.js').csv(result_.latest_matchID);
		})
	}
}

//Exports MatchID Given as HTML
async function exportashtml() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -mhtl [PUBG MatchID]");
		})
	} else {
		require('./modules/export.js').html(argv[3]);
	}
}

//Exports Latest Match from Username Given in process.argv[3] to a .HTML Table
async function exportashtmlfromuname() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -muhtml [PUBG Username]");
		});
	} else {
		require('./modules/user.js').raw(argv[3]).then(async function (result_) {
			require('./modules/export.js').html(result_.latest_matchID);
		})
	}

}

//Get All Player Info
//Gives end user a bit of info about the player that they have mentioned, this includes; their ID, IGN, LatestMatchID, and an array of their recent Matches
function getplayerinfo() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No MatchID Given or Too many arguments.\n\nTry;\n./tool -p [matchID]");
		});
	} else {
		require('./modules/user.js').raw(argv[3]).then(function (result) { console.log(result) });
	}

}


//Get Latest PUBG MatchID from PUBG Username
function latestmatchidfromusername() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No MatchID Given or Too many arguments.\n\nTry;\n./tool -lm [matchID]");
		});
	} else {
		require('./modules/user.js').raw(argv[3]).then(function (result) { console.log(result.latest_matchID) })
	}
}


//.csv Cleanup, deletes all csv files in the current directory (./tool -c        ./tool --cleanup)
function cleanup() {
	const readline = require("readline");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	console.log("## WARNING ##")
	console.log("This function will delete ALL match data in this directory")
	rl.question("Are You sure? [y/N] ", async function (option) {
		switch (option) {
			case 'y':
			case 'Y':
				console.log("Deleting ALL match data...");

				let script = 'rm -v pubg_match_*';

				const util = require('util');
				const exec = util.promisify(require('child_process').exec);
				const { stdout, stderr } = await exec(script);

				rl.close();
				break;
			default:
			case 'n':
			case 'N':
				rl.on("close", function () {
					console.log("Aborting Process...");
					process.exit(0);
				})

				rl.close();
				break;
		}
	})
}


//Setup (./tool -s        ./tool --setup       ./tool [if  api key is not set])
function setup() {

	const readline = require("readline");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	console.log("Welcome to the PUBG-Node Setup, All i'll be asking for is the PUBG API Key,")
	console.log("A link to where you can find it is here; https://developer.pubg.com/")
	console.log("Click on 'Get Your own API Key' and follow the instructions.")
	console.log("\nOnce that is done please paste your key in here and press enter so\nI can validate it!")

	rl.question("API Key: ", async function (key_given) {
		const testapi = new battlegrounds(key_given);
		try {
			const res = await testapi.getPlayers({ names: ["xSuperSeed"] });
		} catch (err) {
			if (err.errors[0].title === "Unauthorized") {
				console.log("Incorrect API Key, Aborting...")
				rl.close();
			}
		}
		console.log("\n\nCongratulations!\nYour API Key is valid so its going to be saved and \nit will *overwrite* the current API Key in config.json");

		let outcontent = JSON.stringify({ "api_key": key_given });

		fs.writeFile("config.json", outcontent, function (err) {
			if (err) throw err;
			console.log('saved api key');
			rl.close();
		});
	});
}


//Help Command (./tool -h     ./tool --help)
function help() {
	console.log("  _    _   ______   _        _____ ")
	console.log(" | |  | | |  ____| | |      |  __ \\ ")
	console.log(" | |__| | | |__    | |      | |__) |")
	console.log(" |  __  | |  __|   | |      |  ___/ ")
	console.log(" | |  | | | |____  | |____  | |     ")
	console.log(" |_|  |_| |______| |______| |_|    ")
	console.log("\n")
	console.log("### Export Match Data to .csv File")
	console.log("./tool -m [matchID]")
	console.log("       --export-match-data [matchID]")
	console.log("(replace [matchID] with a valid PUBG MatchID)")
	console.log()
	console.log("### Export Match Data from Username to .csv File")
	console.log("./tool -mu [username]")
	console.log("       --latest-match-from-username [username]")
	console.log("(replace [username] with a valid PUBG MatchID)")
	console.log()
	console.log("### Export MatchID as HTML Table")
	console.log("./tool -mhtml [matchID]")
	console.log("       --match-export-to-html [matchID]")
	console.log("(replace [matchID] with a valid PUBG MatchID)")
	console.log()
	console.log("### Export MatchID as HTML Table")
	console.log("./tool -muhtml [username]")
	console.log("       --match-export-to-html-from-username [username]")
	console.log("(replace [username] with a valid PUBG MatchID)")
	console.log()
	console.log("### Get Player Info")
	console.log("./tool -p [username]")
	console.log("       --get-player-info [username]")
	console.log("(replace [username] with a valid PUBG username)")
	console.log()
	console.log("### Get Latest MatchID from Username")
	console.log("./tool -lm [username]")
	console.log("       --get-latest-matchid-from-username [username]")
	console.log("(replace [username] with a valid PUBG username)")
	console.log()
	console.log("### .csv Cleanup")
	console.log("./tool -c")
	console.log("       --cleanup")
	console.log()
	console.log("### Setup")
	console.log("./tool -s")
	console.log("       --setup")
	console.log()
	console.log("### Help")
	console.log("./tool -h")
	console.log("       --help")
}
