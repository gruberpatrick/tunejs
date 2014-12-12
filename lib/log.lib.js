module.exports = {

	//------------------------------------------------------------------------------
	// Print Error Log
	//
	// @param string : Error Message
	//
	errorLog: function(sError){
		console.log("Error > " + sError);
	},

	//------------------------------------------------------------------------------
	// Print Normal Log
	//
	// @param string : Message
	//
	log: function(sText){
		console.log("TuneJS > " + sText);
	}

};
