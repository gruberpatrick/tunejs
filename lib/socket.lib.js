var WebSocketServer = require('ws').Server;
var Log = require('../lib/log.lib');

module.exports = {

	// Attributes
	oWSS: null,
	aConnections: [],

	//------------------------------------------------------------------------------
	// Start the Websocket and handle the Events
	//
	// @param int : the Port where to open the Socket
	// @param function : callback for the received Message
	//
	startSocket: function(lPort, fMessage){

		this.oWSS = new WebSocketServer({
			port: lPort
		});

		this.oWSS.on('connection', function (oWS) {

			this.aConnections.push(oWS);
			Log.log("New connection added.");

			oWS.on('message', function(oMesage){ fMessage(oMessage, oWS); });

			oWS.on('close', function(){
				for(var i in this.aConnections){
					if(this.aConnections[i] == ws)
						this.aConnection.splice(i, 1);
				}

				oWS.close();
				Log.log("Connection removed.");
			});

			oWS.on('error', function (e) {
				Log.errorLog("Socket Connection Error.");
			});

		});

	},

	//------------------------------------------------------------------------------
	// Send a Broadcast Message to all Connected Clients
	//
	// @param object : the message to send
	//
	broadcast: function(oSong){

		var sMessage = JSON.stringify(oSong);
		for(var i in this.aConnections){
			this.aConnections[i].send(sMessage);
		}

	}

};
