var Player = require('../lib/player.lib');
var Log = require('../lib/log.lib');
var Websocket = require('../lib/socket.lib');
var Messages = require('../lib/messages.lib');

module.exports = {

	//------------------------------------------------------------------------------
	// Parse incoming PlayerCommand
	//
	// @param string : the command
	// @param object : the Socket Object
	//
	parsePlayerCommand: function(sCommand, oWS){

		if(sCommand == "next"){
			Player.next(function(oSong){
				Log.log("Now playing: \"" + oSong.sTitle + " << " + oSong.sArtist + "\"");
				Websocket.broadcast(Messages.createSongChangedMessage(oSong, Player.getPlayerStatus()));
			});
		}else if(sCommand == "prev"){
			Player.prev(function(oSong){
				Log.log("Now playing: \"" + oSong.sTitle + " << " + oSong.sArtist + "\"");
				Websocket.broadcast(Messages.createSongChangedMessage(oSong, Player.getPlayerStatus()));
			});
		}else if(sCommand == "pause"){
			Player.pause(function(oSong){
				Log.log("Paused");
				Websocket.broadcast(Messages.createPlayerStatusChangedMessage(oSong, Player.getPlayerStatus()));
			});
		}else if(sCommand == "play"){
			Player.play(function(oSong){
				Log.log('Now playing: "' + oSong.sTitle + ' << ' + oSong.sArtist + '"');
				Websocket.broadcast(Messages.createPlayerStatusChangedMessage(oSong, Player.getPlayerStatus()));
			});
		}else if(sCommand == "stop"){
			Player.stop(function(oSong){
				Log.log('Stopped');
				Websocket.broadcast(Messages.createPlayerStatusChangedMessage(oSong, Player.getPlayerStatus()));
			});
		}

	},

	//------------------------------------------------------------------------------
	// Parse incoming SongRequest
	//
	// @param string : the command
	// @param object : the Socket Object
	//
	parseSongRequest: function(sRequest, oWS){

		if(sRequest == ""){
			Websocket.send(Messages.createSongResponseMessage(Player.getCurrentSong(), Player.getPlayerStatus()), oWS);
		}else{
			// get song with given ID
		}

	},

	//------------------------------------------------------------------------------
	// Parse incoming SongRequest
	//
	// @param string : the search string
	// @param object : the Socket Object
	//
	parseSongSearch: function(sSearch, oWS){

		Websocket.send(Messages.createSearchResponseMessage(DB.searchSong(sSearch)), oWS);

	}

};
