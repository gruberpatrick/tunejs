var fs = require('fs');

module.exports = {

	//------------------------------------------------------------------------------
	// Create a ranged Array by the given Values
	//
	// @param int : the value to start from; if nothing else set, the one to got to
	// @param int : the value to go to; if c not set, the length
	// @param int : the steps for each loop
	//
	range: function(a, b, c){
		var lStep = 1;
		var lStart = 0;
		var lLength = 0;
		if(typeof b == "undefined" && typeof c == "undefined"){
			lLength = a;
		}else if(typeof c == "undefined"){
			lLength = b;
			lStart = a;
		}else if(typeof c != "undefined"){
			lLength = b;
			lStart = a;
			lStep = c;
		}
		var aResult = [];
		var lCount = 0;
		for(var i = lStart; i <= lLength; i += lStep){
			aResult[lCount++] = i;
		}
		return aResult;
	},

	//------------------------------------------------------------------------------
	// Shuffle given Array and Return it
	//
	// @param array : Array to Shuffle
	//
	shuffle: function(aArray){
		for(var j, x, i = aArray.length; i; j = Math.floor(Math.random() * i), x = aArray[--i], aArray[i] = aArray[j], aArray[j] = x);
		return aArray;
	},

	//------------------------------------------------------------------------------
	// Get the Files Header Size in Bytes
	//
	// @param object : the Path to the File
	//
	// @return int : the ID3v2 Header Size
	//
	getHeaderSize: function(oSong){

		var oStats = fs.statSync(oSong.sPath)
		var lFileSize = oStats["size"]
		return lFileSize - ((oSong.lLength * ((oSong.lBitrate / 8) * 1000)) + 128);

	}

};
