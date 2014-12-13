module.exports = {

	//------------------------------------------------------------------------------
	// Creates a "SongChanged" Message
	//
	// @param object : currently playing Song
	//
	// @return object : Message
	//
	createSongChangedMessage: function(oSong){
		return {"type": "SongChanged", "content": oSong};
	},

	//------------------------------------------------------------------------------
	// Creates a "SongResponse" Message
	//
	// @param object : currently playing Song
	//
	// @return object : Message
	//
	createSongResponseMessage: function(oSong){
		return {"type": "SongResponse", "content": oSong};
	}

};
