var Player = require('player');
var Tools = require('../lib/tools.lib');
var Log = require('../lib/log.lib');

module.exports = {

	// Attributes
	oPlayers: [ new Player([]), new Player([]) ],
	lFreePlayer: 0,
	aPlaylist: [],
	lMediaPointer: 0,

	//------------------------------------------------------------------------------
	// Start Media Playback
	//
	// @param function : callback for Playing Event
	//
	play: function(fCallback){

		if(this.aPlaylist.length == 0){
			Log.errorLog("No Songs in Playlist.");
			return;
		}

		this.oPlayers[this.lFreePlayer].add(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]].sPath);
		var oThat = this;
		this.oPlayers[this.lFreePlayer].on('playend', function(){
			oThat.lMediaPointer++;
			oThat.oPlayers[oThat.lFreePlayer].list = [];
			oThat.oPlayers[oThat.lFreePlayer].add(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]].sPath);
			oThat.oPlayers[oThat.lFreePlayer].play();
			fCallback(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]]);
		});
		this.oPlayers[this.lFreePlayer].play();
		fCallback(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);

	},

	//------------------------------------------------------------------------------
	// Play next Song in Playlist
	//
	// @param function : callback for Playing Event
	//
	next: function(fCallback){

		if(this.lMediaPointer + 1 > this.aPlaylist.length - 1)
			this.lMediaPointer = 0;
		else
			this.lMediaPointer++;

		this.setPlay();

	},

	//------------------------------------------------------------------------------
	// Play previous Song in Playlist
	//
	// @param function : callback for Playing Event
	//
	prev: function(fCallback){

		if(this.lMediaPointer - 1 < 0)
			this.lMediaPointer = this.aPlaylist.length - 1;
		else
			this.lMediaPointer--;

		this.setPlay();

	},

	//------------------------------------------------------------------------------
	// Play Song with the current Media Pointer
	//
	setPlay: function(){
		this.oPlayers[this.lFreePlayer].stop();
		this.oPlayers[this.lFreePlayer].list = [];

		this.lFreePlayer = (this.lFreePlayer == 0 ? 1 : 0);
		this.oPlayers[this.lFreePlayer].add(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]].sPath);
		this.oPlayers[this.lFreePlayer].play();
		fCallback(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);
	},

	//------------------------------------------------------------------------------
	// Creates a Playlist by Defined Value
	//
	// @param string : value by which the Playlist is created
	//
	createPlaylist: function(sBy){

		if(sBy == 'ID'){
			this.aPlaylist = Tools.range(DB.oDB.aSongs.length);
		}else if(sBy == 'SHUFFLE'){
			this.aPlaylist = Tools.shuffle(Tools.range(DB.oDB.aSongs.length));
		}

	},

	//------------------------------------------------------------------------------
	// Returns the currently playing Song
	//
	// @return object : current Song
	//
	getCurrentSong: function(){

		return DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]];

	}

};
