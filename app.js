DB = require('./lib/db.lib');
var Log = require('./lib/log.lib');
var Player = require('./lib/player.lib');
var Websocket = require('./lib/socket.lib');
var Tools = require('./lib/tools.lib');
var Messages = require('./lib/messages.lib');
var Controller = require('./lib/controller.lib');

// initialize DB and Player
DB.DB();
Player.createPlaylist("SHUFFLE");
Player.play(function(oSong){
	Log.log("Now playing: \"" + oSong.sTitle + " << " + oSong.sArtist + "\"");
	Websocket.broadcast(Messages.createSongChangedMessage(oSong));
});

// open Socket connection
Websocket.startSocket(1234, function(sMessage, oWS){

	var oMessage = JSON.parse(sMessage);

	if(oMessage.type == "PlayerCommand")
		Controller.parsePlayerCommand(oMessage.content);
	else if(oMessage.type == "SongRequest")
		Controller.parseSongRequest(oMessage.content);

});
