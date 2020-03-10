const battlegrounds = require('battlegrounds');
var config = require('./../config.json');
var api = new battlegrounds(config.api_key);

module.exports.raw = async function(uname_given){
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
