var Player = require('../lib/player.lib');
var Log = require('../lib/log.lib');
var Websocket = require('../lib/socket.lib');
var Messages = require('../lib/messages.lib');

module.exports = {

	//------------------------------------------------------------------------------
	// Parse incoming PlayerCommand
	//
	// @param string : the command
	//
	parsePlayerCommand: function(sCommand, oWS){

		if(sCommand == "next"){
			Player.next(function(oSong){
				Log.log("Now playing: \"" + oSong.sTitle + " << " + oSong.sArtist + "\"");
				Websocket.broadcast(Messages.createSongChangedMessage(oSong));
			});
		}else if(sCommand == "prev"){
			Player.prev(function(oSong){
				Log.log("Now playing: \"" + oSong.sTitle + " << " + oSong.sArtist + "\"");
				Websocket.broadcast(Messages.createSongChangedMessage(oSong));
			});
		}

	},

	//------------------------------------------------------------------------------
	// Parse incoming SongRequest
	//
	// @param string : the command
	//
	parseSongRequest: function(sRequest, oWS){

		if(sRequest == ""){
			Websocket.send(Messages.createSongResponseMessage(Player.getCurrentSong()), oWS);
		}else{

		}

	}

};
