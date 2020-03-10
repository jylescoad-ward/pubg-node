const battlegrounds = require('battlegrounds');
var config = require('./../config.json');
var api = new battlegrounds(config.api_key);

  //CSV Export
module.exports.csv = async function(matchID){
  console.log("## WARNING ##\nThis will spit all data that will be written to a .csv file in this directory\n--consent does not exist here--");
  require('./match.js').raw(matchID).then(function (result_) {
    let outfile = "pubg_match_" + matchID + ".csv"
    require('./misc.js').writeFile(outfile, result_)
  })
}

  //HTML Export
module.exports.html = async function(matchID) {
		console.log("## WARNING ##\nThis will spit all data that will be written to a .html file in this directory\n--consent does not exist here--");
    try {
      require('./match.js').raw(matchID).then(function (result) {
        let final = result;
        let head = `
<!DOCTYPE html>
<html>
<head>
<link href="html/style.css" type="text/css" rel="stylesheet" />
<meta charset="UTF-8" />
<meta name="copyright" content="Copyright 2020 Jyles Coad-Ward and Associates." />
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
        let outfile = "pubg_match_" + matchID + ".html";

        require('./misc.js').writeFile(outfile, table);
      })
    } catch (err){ console.error(err) }
}
