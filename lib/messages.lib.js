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
	}

};
