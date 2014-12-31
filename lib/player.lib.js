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
			fCallback(DB.oDB.aSongs[oThat.aPlaylist[oThat.lMediaPointer]]);
		};
		this.oPlayers[this.lFreePlayer].fFinish = function(oSong){
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
	// Continue current active song in Playlist.
	//
	// @param function : callback for Pause Event
	//
	pause: function(fCallback){

		this.oPlayers[this.lFreePlayer].pause();
		fCallback(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);

	},

	//------------------------------------------------------------------------------
	// Continue current active song in Playlist.
	//
	// @param function : callback for Pause Event
	//
	stop: function(fCallback){

		this.oPlayers[this.lFreePlayer].stop();
		fCallback(DB.oDB.aSongs[this.aPlaylist[this.lMediaPointer]]);

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
			this.aPlaylist = Object.keys(DB.oDB.aSongs);
		}else if(sBy == 'SHUFFLE'){
			this.aPlaylist = Tools.shuffle(Object.keys(DB.oDB.aSongs));
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
	// Returns the current Player Stats
	//
	// @return object : player Stats
	//
	getPlayerStatus: function(){

		return this.oPlayers[this.lFreePlayer].oPlayer;

	},

	//------------------------------------------------------------------------------
	// ## MediaPlayer CLASS : using Speaker and LAME
	//
	PlayerClass: {

		oSpeaker: null,
		fStart: function(){},
		fFinish: function(){},
		lResumeTime: 0,
		oTimeInterval: null,
		oPlayer: {"bPlaying": false, "sPlayerStatus": "stopped", "lCurrentTime": 0, "lStartedTime": 0},

		play: function(oSong){

			if(typeof oSong == "undefined" || typeof oSong.sPath == "undefined" || oSong.sPath == "" || this.oPlayer.bPlaying)
				return;

			// check if Resume Time SET -> continue song from where left off
			var lStart = 0;
			if(this.lResumeTime > 0){
				var lHeaderSize = Tools.getHeaderSize(oSong);
				lStart = (this.lResumeTime * ((oSong.lBitrate / 8) * 1000)) + lHeaderSize;
			}

			// start playing song
			var oThat = this;
			this.setPlayerStatus(true, "playing", this.lResumeTime);
			this.oLame = fs.createReadStream(oSong.sPath, {start: lStart}).pipe(new Lame.Decoder);
			this.oSpeaker = this.oLame.pipe(new Speaker);
			this.fStart(oSong);

			this.oTimeInterval = setInterval(function(){
				oThat.lResumeTime++;
				oThat.oPlayer.lCurrentTime++;
			}, 1000);

			// start finish listener
			this.oSpeaker.removeAllListeners('finish');
			this.oSpeaker.on('finish', function(){
				oThat.stop();
				oThat.fFinish(oSong);
			});

		},

		stop: function(lSet){
			clearInterval(this.oTimeInterval);
			if(typeof lSet == "undefined")
				this.lResumeTime = 0;
			this.oSpeaker._flush();
			this.setPlayerStatus(false, "stopped", 0);
		},

		pause: function(){
			this.stop(1);
			this.setPlayerStatus(false, "paused", this.lResumeTime);
		},

		setPlayerStatus: function(bPlaying, sPlayerStatus, lCurrentTime){
			this.oPlayer.bPlaying = bPlaying;
			this.oPlayer.sPlayerStatus = sPlayerStatus;
			this.oPlayer.lCurrentTime = lCurrentTime;
			this.oPlayer.lStartedTime = Date.now();
		}

	}

};
