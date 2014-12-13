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

		var oThat = this;
		this.oWSS = new WebSocketServer({
			port: lPort
		});

		this.oWSS.on('connection', function (oWS) {

			oThat.aConnections.push(oWS);
			Log.log("New connection added.");

			oWS.on('message', function(oMessage){
				fMessage(oMessage, oWS);
			});

			oWS.on('close', function(){
				oThat.aConnections.splice(oThat.aConnections.indexOf(oWS), 1);

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

	},

	//------------------------------------------------------------------------------
	// Send a Data to specific Client
	//
	// @param object : the message to send
	// @param object : the Connection
	//
	send: function(oMessage, oWS){

		oWS.send(JSON.stringify(oMessage));

	}

};
