var Log = require('./lib/log.lib');
var DB = require('./lib/db.lib');
var Player = require('./lib/player.lib');

DB.DB();
DB.loadFolder('/media/patrick/swap/music/', function(lLoaded, lTotal){ console.log(lLoaded + " - " + lTotal); });

for(var i in DB.oDB.oSongs){
	Player.addSong(i);
}

Player.play(function(oSong){
	console.log(oSong);
});
