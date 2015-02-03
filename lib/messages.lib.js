module.exports = {

	//------------------------------------------------------------------------------
	// Creates a "SongChanged" Message
	//
	// @param object : currently playing Song
	// @param object : the Player Status
	//
	// @return object : Message
	//
	createSongChangedMessage: function(oSong, oPlayerStatus){
		return {"type": "SongChanged", "content": oSong, "player": oPlayerStatus};
	},

	//------------------------------------------------------------------------------
	// Creates a "SongResponse" Message
	//
	// @param object : currently playing Song
	// @param object : the Player Status
	//
	// @return object : Message
	//
	createSongResponseMessage: function(oSong, oPlayerStatus){
		return {"type": "SongResponse", "content": oSong, "player": oPlayerStatus};
	},

	//------------------------------------------------------------------------------
	// Creates a "PlayerStatusChanged" Message
	//
	// @param object : currently playing Song
	// @param object : the Player Status
	//
	// @return object : Message
	//
	createPlayerStatusChangedMessage: function(oSong, oPlayerStatus){
		return {"type": "PlayerStatusChanged", "content": oSong, "player": oPlayerStatus};
	},

	//------------------------------------------------------------------------------
	// Creates a "SearchResponse" Message
	//
	// @param object : Searched Songs Result
	//
	// @return object : Message
	//
	createSearchResponseMessage: function(aSongs){
		return {"type": "SearchResponse", "content": aSongs};
	}

};
