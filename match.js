const config = require("./config.json");

const battlegrounds = require('battlegrounds')

const api = new battlegrounds(config.api_key)

const matchid = process.argv[2];

const fs = require('fs');
const math = require('mathjs');

async function match(){
	try {
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

			final = final + position + "," + placementpoints + "," + totalkills + ",," + matchscore + ",," + member1[1] + "," + member2[1] + "," + member3[1] + "," + member4[1] + ",," + squadid + "\n";

			i++;
		}
		let outfile = "pubg_match_" + matchid + ".csv";

		if (fs.existsSync(outfile)){
			fs.unlink(outfile, (err) => {
				if (err){
					console.error(err)
					return
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

match()
