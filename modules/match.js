const battlegrounds = require('battlegrounds');
const math = require('mathjs');
var config = require('./../config.json');
var api = new battlegrounds(config.api_key);

module.exports.raw = async function(id_given) {
  try {
		let matchid = id_given;
		const res = await api.getMatch({ id: matchid });
		var json_array = [];
		json_array[0] = "Rank,Placement Points,Kills,,Total Points,,Member 1,Member 2,Member 3,Member 4,,Squad ID,,Member 1 kills,Member 2 kills,Member 3 kills,Member 4 kills,,Member 1 ID,Member 2 ID,Member 3 ID,Member 4 ID";

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

		json_array[json_array.length] = "\n\n\nMatch Start," + datecombinestring;
		json_array[json_array.length + 1] = "\nMatch Duration," + new Date(res.attributes.duration * 1000).toISOString().substr(11, 8)
		return json_array;

	} catch (err) {
		console.log('error:')
		console.log(err)
		setTimeout(function () { console.log("error") }, 2000)
	}
}
