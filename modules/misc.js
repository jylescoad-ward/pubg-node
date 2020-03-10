const fs = require('fs');

  //Write File Function
module.exports.writeFile = async function(location, content){
	if (fs.existsSync(location)) {
		fs.unlink(location, (err) => {
			if (err) {
				console.error(err)
				return;
			}
		})
	}

	const { exec } = require("child_process");
	exec("touch " + location)

	fs.appendFile(location, content, function (err) {
		if (err) throw err;
		setTimeout(function () { console.log('\nwritten to ' + location) }, 2000)
	});
  return true;
}

module.exports.startPUBGNode = function(config) {
	const argv = process.argv;
	if (config.api_key === "not_set") {
		require('./cmd.js').prog_setup();
	} else {
		switch (argv[2].split("\r").join("")) {
			case '-m':
			case '--export-match-data':
				require('./cmd.js').getmatchdata();
				break;
			case '-mu':
			case '--latest-match-from-username':
				require('./cmd.js').getlatestmatchfromusername();
				break;
			case '-mhtml':
			case '--match-export-to-html':
				require('./cmd.js').exportashtml();
				break;
			case '-muhtml':
			case '--match-export-to-html-from-username':
				require('./cmd.js').exportashtmlfromuname();
				break;
			case '-p':
			case '--get-player-info':
				require('./cmd.js').getplayerinfo();
				break;
			case '-lm':
			case '--get-latest-matchid-from-username':
				require('./cmd.js').latestmatchidfromusername();
				break;
			case '-c':
			case '--cleanup':
				require('./cmd.js').cleanup();
				break;
			case '-s':
			case '--setup':
				require('./cmd.js').prog_setup();
				break;
			case '-h':
			case '--help':
				require('./cmd.js').help();
				break;
			default:
				console.log("No Valid Arguments Recognised, Try './tool --help' or 'node require('./cmd.js').js --help'");
				process.exit();
				break;
		}
		process.exit();
	}
}
