const config = require("./config.json");

const battlegrounds = require('battlegrounds')

const api = new battlegrounds(config.api_key);

const fs = require('fs');

name = process.argv['2']

async function match(){
	try {
		const res = await api.getPlayers({ names: [name] })

		//console.log(res)

		//PlayerID
		let playerID = res[0].id;
		let playerIGN = res[0].attributes.name;
		let playerLatestMatchID = res[0].matches[0].id;
		let playerMatchArray = res[0].matches;

		const finaljson = {
			"name": playerIGN,
			"id": playerID,
			"latest_match_id": playerLatestMatchID,
			"matches": playerMatchArray
		}

		console.log(finaljson.latest_match_id);

	} catch(err) {
		console.log('error:')
    	console.error(err.errors[0].title)
  }
}

match()
