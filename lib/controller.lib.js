var Player = require('../lib/player.lib');

module.exports = {

	//------------------------------------------------------------------------------
	// Parse incoming PlayerCommand
	//
	// @param string : the command
	//
	parsePlayerCommand: function(sCommand){

		if(sCommand == "next")
			Player.next();
		else if(sCommand == "prev")
			Player.prev();

	},

	//------------------------------------------------------------------------------
	// Parse incoming SongRequest
	//
	// @param string : the command
	//
	parseSongRequest: function(sRequest){

		// nothing yet

	}

};
