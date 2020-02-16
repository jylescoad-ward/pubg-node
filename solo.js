const config = require("./config.jsom");

const battlegrounds = require('battlegrounds')

const api = new battlegrounds(config.api_key, config.platform + '-' + config.region)

const matchid = process.argv[2];

const fs = require('fs');

math = require("/usr/local/lib/node_modules/mathjs")

async function match(){
	try {
		const res = await api.getMatch({id:matchid});
		
		let ppllen = res.participants.length;
		var i=0;var final="name,dammage dealt,kills,points";
		while (i < ppllen){
			let name = res.participants[i].attributes.stats.name;
			let dmgdlt = res.participants[i].attributes.stats.damageDealt;
			let kills = res.participants[i].attributes.stats.kills;
			let placement = res.participants[i].attributes.stats.winPlace;
			
			let placeaward;
			switch (placement){
				case 1:
					placeaward = 10;
					break;
				case 2:
					placeaward = 6;
					break;
				case 3:
					placeaward = 5;
					break;
				case 4:
					placeaward = 4;
					break;
				case 5:
					placeaward = 3;
					break;
				case 6:
					placeaward = 2;
					break;
				case 7:
					placeaward = 1;
					break;
				case 8:
					placeaward = 1;
					break;
				default:
					placeaward = 0;
					break;
			}
			
			final = final + "\n" + name + "," + dmgdlt + "," + kills + "," + math.add(kills, placeaward);
			
			
			i = i + 1;
		}
		fs.writeFile("solo-" + matchid + ".csv", final, function (err) {
			if (err) throw err;
			console.log('written to solo-' + matchid + '.csv');
		});
	} catch(err) {
		console.log('error:')
    	console.error(err)
  }
}

match()
