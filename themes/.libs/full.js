var oCurrentSong = {};

var FullTmpl = {

	renderTemplate: function(){

		// fit head elements
		var lFullWidth = $("tunejs-head-inner").width();
		var lFixedWidth = $("tunejs-head-playercontrols").outerWidth(true) + $("tunejs-head-search").outerWidth(true) + $("tunejs-head-buttongroup").outerWidth(true);
		$("tunejs-head-playersong").width(lFullWidth - lFixedWidth);

		// fit content elements
		var lFullHeight = $("body").height();
		var lFixedHeight = $("tunejs-head").outerHeight(true) + $("tunejs-footer").outerHeight(true);
		$("tunejs-content").height(lFullHeight - lFixedHeight);

		// fit left content elements
		lFullHeight = $("tunejs-content-left-inner").outerHeight();
		lFixedHeight = ($("#tab-wrapper").outerHeight(true) - $("#tab-wrapper").height()) + $("#tab-buttons").height();
		console.log(lFullHeight + " - " + lFixedHeight);
		$("#tab-wrapper").height(lFullHeight - lFixedHeight);

	},

	toggleFullscreen: function(){

		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement){
				if(document.documentElement.requestFullscreen){
					document.documentElement.requestFullscreen();
				}else if(document.documentElement.msRequestFullscreen){
					document.documentElement.msRequestFullscreen();
				}else if(document.documentElement.mozRequestFullScreen){
					document.documentElement.mozRequestFullScreen();
				}else if(document.documentElement.webkitRequestFullscreen){
					document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			}else{
				if(document.exitFullscreen){
					document.exitFullscreen();
				}else if (document.msExitFullscreen){
					document.msExitFullscreen();
				}else if (document.mozCancelFullScreen){
					document.mozCancelFullScreen();
				}else if (document.webkitExitFullscreen){
					document.webkitExitFullscreen();
				}
			}

	}

};

var oClient = new WebSocket("ws://localhost:1234");
oClient.onopen = function(){
	oClient.send(JSON.stringify({"type":"SongRequest","content":""}));
	$("#next").click(function(){
		oClient.send(JSON.stringify({"type":"PlayerCommand","content":"next"}));
	});
	$("#prev").click(function(){
		oClient.send(JSON.stringify({"type":"PlayerCommand","content":"prev"}));
	});
};
oClient.onmessage = function(sMessage){
	var oMessage = JSON.parse(sMessage.data);
	if(oMessage.type == "SongChanged" || oMessage.type == "SongResponse"){
		oCurrentSong = oMessage.content;
		$("#songtitle").html(oMessage.content.sTitle);
		oMessage.content.sAlbum != "" ? $("#songalbum").html(oMessage.content.sAlbum) : $("#songalbum").html(oMessage.content.sArtist + " <unknown>");
		$("#songartist").html(oMessage.content.sArtist);
	}
}

FullTmpl.renderTemplate();
$(window).resize(function(){
	FullTmpl.renderTemplate();
});

$("#fullscreenbutton").click(function(){
	FullTmpl.toggleFullscreen();
});
