var Player = require('player');

module.exports = {

	oPlayer: new Player([ ]),

	addSong: function(sPath){
		this.oPlayer.add(sPath);
	},

	play: function(fCallback){
		this.oPlayer.play(fCallback);
	}

};
