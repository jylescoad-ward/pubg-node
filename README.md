# pubg-node
A PUBG Match Info Thing for Tournaments (made for RFLan)

## [all you need is node.js](https://nodejs.org/en/download/)

### install thing.
```bash
$ npm i battlegrounds mathjs
```

### usage
get latest matchID from PUBG username (required to get match data!)
```bash
$ ./latest_matchid [username]
```
replace [username] with a valid username, the program will spit out errors if it cannot connect to the PUBG api, or if your key is not valid or the username is not valid.

get match data (automatically exports to a .csv file in the same directory)
```bash
$ ./match [matchid]
```
replace [matchid] with the matchid that you got from the previous command or any matchid that is valid.
