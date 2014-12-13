var Tools = require('../lib/tools.lib');
var Log = require('../lib/log.lib');

var Speaker = require('speaker');
var Lame = require('lame');
var fs = require('fs');

module.exports = {

	// Attributes
	oPlayers: [null, null],
	lFreePlayer: 0,
	aPlaylist: [],
	lMediaPointer: 0,

	//------------------------------------------------------------------------------
	// Initialize PlayerClass
	//
	init: function(){

		this.oPlayers[0] = this.PlayerClass;
		this.oPlayers[1] = this.PlayerClass;

	},

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

		var oThat = this;
		this.oPlayers[this.lFreePlayer].fStart = function(oSong){
			// playstart
			fCallback(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]]);
		};
		this.oPlayers[this.lFreePlayer].fFinish = function(oSong, lPlaytime){
			// set Song duration
			Log.log("Song duration: " + lPlaytime + " seconds");
			if(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]].lLength <= 0)
				DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]].lLength = lPlaytime;
			// playend
			oThat.lMediaPointer++;
			oThat.oPlayers[oThat.lFreePlayer].play(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]]);
		};
		this.oPlayers[this.lFreePlayer].play(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);

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

		this.setPlay(fCallback);

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

		this.setPlay(fCallback);

	},

	//------------------------------------------------------------------------------
	// Play Song with the current Media Pointer
	//
	setPlay: function(fCallback){

		this.oPlayers[this.lFreePlayer].stop();
		this.oPlayers[this.lFreePlayer].play(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);

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

	},

	//------------------------------------------------------------------------------
	// Creates the MediaPlayer using Speaker and LAME
	//
	// @param object : the Song to be played
	//
	PlayerClass: {

		oSpeaker: null,
		fStart: function(){},
		fFinish: function(){},
		lStartTime: 0,
		lPauseTime: 0,

		play: function(oSong){

			if(typeof oSong == "undefined" || typeof oSong.sPath == "undefined" || oSong.sPath == ""){
				return;
			}

			var oThat = this;
			this.oLame = fs.createReadStream(oSong.sPath).pipe(new Lame.Decoder);
			this.oSpeaker = this.oLame.pipe(new Speaker);
			this.lStartTime = Date.now();
			this.lPauseTime = 0;
			this.fStart(oSong);

			this.oSpeaker.on('finish', function(){
				oThat.stop();
				oThat.fFinish(oSong, Math.round((Date.now() - oThat.lStartTime) / 1000));
			});

		},

		stop: function(){
			this.oSpeaker._flush();
		},

		pause: function(){
			this.lPauseTime = Date.now();
		}

	}

};
