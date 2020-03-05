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
		console.log("## WARNING ##\nThis will spit all data that will be written to a .CSV file in this directory\n--consent does not exist here--");
		exportmatchdata(argv[3]).then(function (result) {
			let outfile = "pubg_match_" + argv[3] + ".html"
			writefile(outfile, result)
		})
	}
}


//Exports Latest Match from Username Given in process.argv[3]
async function getlatestmatchfromusername() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -mu [PUBG Username]");
		})
	} else {
		try {
			console.log("## WARNING ##\nThis will spit all data that will be written to a .CSV file in this directory\n--consent does not exist here--");
			getudata(argv[3]).then(function (result) {
				exportmatchdata(result.latest_matchID).then(function (result_) {
					let outfile = "pubg_match_" + result.latest_matchID + ".csv"
					writefile(outfile, result_)
				})
			})
		} catch (err) {
			console.error(err)
		}

	}
}

//Exports MatchID Given as HTML
async function exportashtml() {

	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No MatchID Given or Too many arguments given.\n\nTry;\n./tool -mu [PUBG Username]");
		});
	} else {
		try {
			exportmatchdata(argv[3]).then(function (result) {
				console.log(result)
				let final = result;
				let head = `
<!DOCTYPE html>
<html>
	<head>
		<link href="html/style.css" rel="stylesheet" type="text/css" />
	</head>
	<body>` + final[final.length].split(",").join("<br>") + `
		<table>
				`;
				let end = `
		</table>
	</body>
</html>`;
					let tablehead = result[0];
					tablehead = '<tr class="head"><th>' + tablehead.split(",").join("</th><th>") + "</th></tr>";
					let table = head + tablehead;
					final[0] = "";
					let i=1;
					while(i < final.length) {
						console.log(final[i])
						if (final[i] !== undefined) {
							table = table + "<tr><td>" + final[i].split(",").join("</td><td>") + "</td></tr>"
						}
						if (final[i] == final.length){
							table = table;
						}
						i++
					}
				table = table + end;

				//replace thing here
				let outfile = "pubg_match_" + argv[3] + ".html";

				writefile(outfile, table);
			})
		} catch (err){
			console.error(err)
		}
	}

}

//Exports Latest Match from Username Given in process.argv[3] to a .HTML Table
async function exportashtmlfromuname() {

	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No Username Given or Too many arguments given.\n\nTry;\n./tool -mu [PUBG Username]");
		});
	} else {
		console.log("## WARNING ##\nThis will spit all data that will be written to a .html file in this directory\n--consent does not exist here--");
		getudata(argv[3]).then(async function (result_) {
			let matchid = result_.latest_matchID;
			try {
				exportmatchdata(matchid).then(function (result) {
					let final = result;
					let head = `
	<!DOCTYPE html>
	<html>
		<head>
			<link href="html/style.css" type="text/css" rel="stylesheet" />
		</head>
		<body>
			<table>
					`;
					let end = `
			</table>
		</body>
	</html>`;
						let tablehead = result[0];
						tablehead = '<tr class="head"><th>' + tablehead.split(",").join("</th><th>") + "</th></tr></div>";
						let table = head + tablehead;
						final[0] = "";
						let i=1;
						while(i < final.length) {
							if (final[i] !== undefined) {
								table = table + "<tr><td>" + final[i].split(",").join("</td><td>") + "</td></tr>"
							}
							i++
						}
					table = table + end;

					//replace thing here
					let outfile = "pubg_match_" + matchid + ".html";

					writefile(outfile, table);
				})
			} catch (err){
				console.error(err)
			}
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
		getudata(argv[3]).then(function (result) { console.log(result) });
	}

}


//Get Latest PUBG MatchID from PUBG Username
function latestmatchidfromusername() {
	if (argv.length !== 4) {
		process.on('exit', function (code) {
			return console.error("No MatchID Given or Too many arguments.\n\nTry;\n./tool -lm [matchID]");
		});
	} else {
		getudata(argv[3]).then(function (result) { console.log(result.latest_matchID) })
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



//Big boy work
async function getudata(uname_given) {
	let final;
	try {
		const res = await api.getPlayers({ names: [uname_given] });
		final = {
			"name": res[0].id,
			"id": res[0].attributes.name,
			"latest_matchID": res[0].matches[0].id,
			"matches": JSON.stringify(res[0].matches)
		};
	} catch (err) {
		console.log('error:')
		console.error(err.errors[0].title + err.errors[0].detail)
		final = false;
	}
	return final;
}
async function exportmatchdata(id_given) {
	//Do the thing here!
	//Warns the user that this program is much like Tasmania, Consent does not exist and is not recognised. (handled by the command function, this is just a base.)


	try {
		let matchid = id_given;
		const res = await api.getMatch({ id: matchid });
		var json_array = [];
		json_array[0] = "Rank,Placement Points,Kills,,Total Points,,Member 1,Member 2,Member 3,Member 4,,Squad ID,,Member 1 kills,Member 2 kills,Member 3 kills,Member 4 kills,,Member 1 ID,Member 2 ID,Member 3 ID,Member 4 ID";
		//let htmlfilal = "<table><tr><th>Rank</th><th>Placement Points</th><th>Kills</th><th>Total Points</th><th>Member 1</th><th>Member 2</th><th>Member 3</th><th>Member 4</th><th>Team ID</th></tr>";

		let squadcount = res.rosters.length;
		var i = 0;
		while (i < squadcount) {

			let position = res.rosters[i].attributes.stats.rank;
			let squadid = res.rosters[i].id;
			let membercount = res.rosters[i].participants.length;
			//kills,name,id
			let member1 = [0, "", ""];
			let member2 = [0, "", ""];
			let member3 = [0, "", ""];
			let member4 = [0, "", ""];

			let m = 0;
			while (m !== membercount) {
				switch (m) {
					case 0:
						member1[0] = res.rosters[i].participants[m].attributes.stats.kills;
						member1[1] = res.rosters[i].participants[m].attributes.stats.name;
						member1[2] = res.rosters[i].participants[m].id;
						break;
					case 1:
						member2[0] = res.rosters[i].participants[m].attributes.stats.kills;
						member2[1] = res.rosters[i].participants[m].attributes.stats.name;
						member2[2] = res.rosters[i].participants[m].id;
						break;
					case 2:
						member3[0] = res.rosters[i].participants[m].attributes.stats.kills;
						member3[1] = res.rosters[i].participants[m].attributes.stats.name;
						member3[2] = res.rosters[i].participants[m].id;
						break;
					case 3:
						member4[0] = res.rosters[i].participants[m].attributes.stats.kills;
						member4[1] = res.rosters[i].participants[m].attributes.stats.name;
						member4[2] = res.rosters[i].participants[m].id;
						break;
				}
				m++;
			}

			let totalkills;
			switch (membercount) {
				case 0:
					totalkills = member1[0];
					break;
				case 1:
					totalkills = math.add(member1[0], member2[0]);
					break;
				case 2:
					totalkills = math.add(member1[0], member2[0], member3[0]);
					break;
				case 3:
					totalkills = math.add(member1[0], member2[0], member3[0], member4[0]);
					break;
				case 5:
					totalkills = math.add(member1[0], member2[0], member3[0], member4[0]);
					break;
			}

			let placementpoints;
			switch (position) {
				case 1:
					placementpoints = 10;
					break;
				case 2:
					placementpoints = 6;
					break;
				case 3:
					placementpoints = 5;
					break;
				case 4:
					placementpoints = 4;
					break;
				case 5:
					placementpoints = 3;
					break;
				case 6:
					placementpoints = 2;
					break;
				case 7:
					placementpoints = 1;
					break;
				case 8:
					placementpoints = 1;
					break;
				default:
					placementpoints = 0;
					break;
			}

			if (totalkills == undefined) {
				totalkills = 0;
			}
			if (placementpoints == 0) {
				placementpoints = 0;
			}

			json_array[position] = "\n" + position + "," + placementpoints + "," + totalkills + ",," + math.add(totalkills, placementpoints) + ",," + member1[1] + "," + member2[1] + "," + member3[1] + "," + member4[1] + ",," + squadid + ",," + member1[0] + "," + member2[0] + "," + member3[0] + "," + member4[0] + ",," + member1[2] + "," + member2[2] + "," + member3[2] + "," + member4[2];

			i++;
		}

		let datecombinestring = new Date(Date.parse(res.attributes.createdAt)).toLocaleDateString("en-AU") + " " + new Date(Date.parse(res.attributes.createdAt)).toLocaleTimeString("en-AU")

		//csvfinal = csvfinal + csvendthing;
		json_array[json_array.length] = "\n\n\nMatch Start," + datecombinestring;
		json_array[json_array.length + 1] = "\nMatch Duration," + new Date(res.attributes.duration * 1000).toISOString().substr(11, 8)
		return json_array;

	} catch (err) {
		console.log('error:')
		console.log(err)
		setTimeout(function () { console.log("error") }, 2000)
	}
}
async function writefile(filename, content) {
	if (fs.existsSync(filename)) {
		fs.unlink(filename, (err) => {
			if (err) {
				console.error(err)
				return;
			}
		})
	}

	const { exec } = require("child_process");
	exec("touch " + filename)

	fs.appendFile(filename, content, function (err) {
		if (err) throw err;
		setTimeout(function () { console.log('\nwritten to ' + filename) }, 2000)
	});
}




