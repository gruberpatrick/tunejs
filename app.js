DB = require('./lib/db.lib');
var Log = require('./lib/log.lib');
var Player = require('./lib/player.lib');
var Websocket = require('./lib/socket.lib');
var Tools = require('./lib/tools.lib');
var Messages = require('./lib/messages.lib');
var Controller = require('./lib/controller.lib');

// Load Database from Folder
Log.log("Performing DB actions.");
DB.DB();
var bChanged = false;
DB.loadFolder('', function(lPerc, sInfo){
	Log.log(lPerc + "%");
	bChanged = true;
});
if(bChanged){
	DB.songInfoCheck(0, function(){
		DB.saveDB();
	});
}

Player.init();
Player.createPlaylist('SHUFFLE');
/*
// Start Playback on Startup
Player.play(function(oSong){
	Log.log('Now playing: "' + oSong.sTitle + ' << ' + oSong.sArtist + '"');
	Websocket.broadcast(Messages.createSongChangedMessage(oSong, Player.getPlayerStatus()));
});
*/

// open Socket connection
Websocket.startSocket(1234, function(sMessage, oWS){

	try{
		var oMessage = JSON.parse(sMessage);
	}catch(e){
		Log.errorLog('Wrong Protocol format: ' + e);
		return;
	}

	if(oMessage.type == 'PlayerCommand')
		Controller.parsePlayerCommand(oMessage.content, oWS);
	else if(oMessage.type == 'SongRequest')
		Controller.parseSongRequest(oMessage.content, oWS);
	else if(oMessage.type == 'SongSearch')
		Controller.parseSongSearch(oMessage.content, oWS);

});
