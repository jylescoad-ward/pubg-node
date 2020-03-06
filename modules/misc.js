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
