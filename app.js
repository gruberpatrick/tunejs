DB = require('./lib/db.lib');
var Log = require('./lib/log.lib');
var Player = require('./lib/player.lib');
var Websocket = require('./lib/socket.lib');
var Tools = require('./lib/tools.lib');
var Messages = require('./lib/messages.lib');
var Controller = require('./lib/controller.lib');

// initialize DB and Player
DB.DB();

// Load Database from Folder
//DB.loadFolder('/media/patrick/swap/music/', function(lL, lC, sStat){ if(sStat == 'directory'){ Log.log(lL + ' - ' + lC); } });
//DB.saveDB(function(){ Log.log('DB saved.'); });

Player.init();
Player.createPlaylist('SHUFFLE');
Player.play(function(oSong){
	Log.log('Now playing: "' + oSong.sTitle + ' << ' + oSong.sArtist + '"');
	Websocket.broadcast(Messages.createSongChangedMessage(oSong));
});

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

});
