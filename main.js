//Stuff that is required for things to work or it wont work.
const battlegrounds = require('battlegrounds');
const math = require('mathjs');
const fs = require('fs');


var config = "";
var api = "";
var argv = "";
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
        case '--get-latest-match':
            getlatestmatch();
            break;
        case '-p':
        case '--get-player-info':
            getplayerinfo();
            break;
        case '-lm':
        case '--get-latest-matchid-from-username':
            latestmatch();
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
    console.log("       --get-latest-match [matchID]")
    console.log("(replace [matchID] with a valid PUBG MatchID)")
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

function cleanup() {
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("## WARNING ##")
    console.log("This function will delete ALL match data in this directory")
    rl.question("Are You sure? [y/N]", async function (option) {
        switch (option) {
            case 'y':
            case 'Y':
                console.log("Deleting ALL match data...");

                let script = 'rm -v *.csv';

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


//Time for the ACTual FUCKING FUNCTIONS!!!!!!!!!

//Get Latest Match Data and Export to a Comma Seperated Value File for Easier Reading!
async function getlatestmatch() {
    if (argv.length !== 4) {

    } else {
		//Do the thing here!

            //Warns the user that this program is much like Tasmania, Consent does not exist and is not recognised.
        console.log("## WARNING ##\nThis will spit all data that will be written to a .CSV file in this directory\n--consent does not exist here--");


        try {
            let matchid = argv[3];
            const res = await api.getMatch({id:matchid});

            let final = "rank,placement points,kills, ,total points, ,member 1,member 2,member 3,member 4, ,squad id \n";

            let squadcount = res.rosters.length;
            var i=0;
            while (i < squadcount){

                let position = res.rosters[i].attributes.stats.rank;
                let squadid = res.rosters[i].id;
                let membercount = res.rosters[i].participants.length;
                //kills,name,id
                let member1 = [0, "", ""];
                let member2 = [0, "", ""];
                let member3 = [0, "", ""];
                let member4 = [0, "", ""];

                let m=0;
                while (m !== membercount){
                    switch (m){
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
                switch (membercount){
                    case 0:
                        totalkills = member1[0];
                        break;
                    case 1:
                        totalkills = math.add(member1[0],member2[0]);
                        break;
                    case 2:
                        totalkills = math.add(member1[0],member2[0],member3[0]);
                        break;
                    case 3:
                        totalkills = math.add(member1[0],member2[0],member3[0],member4[0]);
                        break;
                    case 5:
                        totalkills = math.add(member1[0],member2[0],member3[0],member4[0]);
                        break;
                }

                let placementpoints;
                switch (position){
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

                if (totalkills == undefined){
                    totalkills = 0;
                }
                if (placementpoints == 0){
                    placementpoints = 0;
                }

                let matchscore;

                if(placementpoints !== 0 && totalkills !== 0){
                    matchscore = math.add(totalkills, placementpoints);
                } else {
                    matchscore = 0;
                }

                let combinestring = position + "," + placementpoints + "," + totalkills + ",," + matchscore + ",," + member1[1] + "," + member2[1] + "," + member3[1] + "," + member4[1] + ",," + squadid + "\n";

                final = final + combinestring;
                i++;
            }

            let endthing = "\n\n\nmatch start date,duration\n" + res.attributes.createdAt + "," + new Date(res.attributes.duration * 1000).toISOString().substr(11, 8);
            console.log(final)
            final = final + endthing;

            let outfile = "pubg_match_" + matchid + ".csv";

            if (fs.existsSync(outfile)){
                fs.unlink(outfile, (err) => {
                    if (err){
                        console.error(err)
                        return;
                    }
                })
            }

            const { exec } = require("child_process");
            exec("touch " + outfile)

            fs.appendFile(outfile, final, function (err) {
            if (err) throw err;
                console.log('written to ' + outfile);
            });

            setTimeout(function(){console.log("")},2000)
        } catch(err) {
            console.log('error:')
            console.log(err)
            setTimeout(function(){console.log("error")},2000)
        }
    }
}


//Gives end user a bit of info about the player that they have mentioned, this includes; their ID, IGN, LatestMatchID, and an array of their recent Matches
async function getplayerinfo() {
    if (argv.length !== 4) {
        process.on('exit', function (code) {
            return console.error("No MatchID Given or Too many arguments.\n\nTry;\nnpm start -m [matchID]");
        });
    } else {
        try {
            const res = await api.getPlayers({ names: [argv[3]] });
            console.log({
                "name": res[0].id,
                "id": res[0].attributes.name,
                "latest_matchID": res[0].matches[0].id,
                "matches": res[0].matches
            });
        } catch (err) {
            console.log('error:')
            console.error(err.errors[0].title + err.errors[0].detail)
        }
    }

}

async function latestmatch() {
    if (argv.length !== 4) {
        process.on('exit', function (code) {
            return console.error("No MatchID Given or Too many arguments.\n\nTry;\nnpm start -m [matchID]");
        });
    } else {
        try {
            const res = await api.getPlayers({ names: [argv[3]] });
            console.log(res[0].matches[0].id);
        } catch (err) {
            console.log('error:')
            console.error(err.errors[0].title + err.errors[0].detail)
        }
    }
}