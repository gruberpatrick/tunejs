var oMediaScope = null;

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

FullTmpl.renderTemplate();
$(window).resize(function(){
	FullTmpl.renderTemplate();
});

$("#fullscreenbutton").click(function(){
	FullTmpl.toggleFullscreen();
});

// -----------------------------------------------------------------------------
// Media APP Angular Code
//
(function(){

	var app = angular.module("mediaApp", []);
	app.controller("MediaControl", ["$scope", "$filter", function($scope, $filter){

		// Angular Control
		oMediaScope = $scope;
		$scope.bPlay = true;
		$scope.oCurrentSong = {};
		$scope.oPlayer = {};
		$scope.lPlayCounter = 0;
		$scope.oTimeout = null;
		$scope.lPercentage = 0;
		$scope.aSongList = [];
		$scope.aTmpList = null;

		$scope.bInvert = false;
		$scope.sOrder = "sTitle";

		$scope.setPlay = function(bPlay){
			$scope.$apply(function(){
				$scope.bPlay = bPlay;
			});
		};

		$scope.setCurrentSong = function(oSong){
			$scope.$apply(function(){
				$scope.oCurrentSong = oSong;
			});
		};

		$scope.setPercentage = function(lPercentage){
			$scope.$apply(function(){
				$scope.lPercentage = lPercentage;
			});
		};

		$scope.setPlayCounter = function(lValue, bCount){
			$scope.$apply(function(){
				$scope.lPlayCounter = lValue;
			});
			$scope.setPercentage((lValue / $scope.oCurrentSong.lLength) * 100);
			if($scope.oTimeout != null)
				clearTimeout($scope.oTimeout);
			if(!bCount)
				return;
			$scope.oTimeout = setTimeout(function(){
				$scope.setPlayCounter(++lValue, bCount);
			}, 1000);
		};

		$scope.isPlaying = function(){
			return $scope.bPlay;
		};

		$scope.formatTime = function(lSeconds){
			return Math.floor(lSeconds / 60) + ":" + (lSeconds % 60 < 10 ? "0" + lSeconds % 60 : lSeconds % 60);
		};

		$scope.setSongList = function(aSongList){
			$scope.aSongList = aSongList;
			if($scope.aTmpList == null)
				$scope.aTmpList = aSongList;
		};

		$scope.resetSongList = function(){
			$scope.oSongList = $scope.oTmpList;
		};

	}]);

})();

// -----------------------------------------------------------------------------
// Socket Control
//
var oClient = new WebSocket("ws://localhost:1234");
oClient.onopen = function(){

	oClient.send(JSON.stringify({"type":"SongRequest","content":""}));
	oClient.send(JSON.stringify({"type":"SongSearch","content": ""}));

	$("#next").click(function(){
		oClient.send(JSON.stringify({"type":"PlayerCommand","content":"next"}));
	});
	$("#prev").click(function(){
		oClient.send(JSON.stringify({"type":"PlayerCommand","content":"prev"}));
	});
	$("#play").click(function(){
		if(oMediaScope.isPlaying()){
			oClient.send(JSON.stringify({"type":"PlayerCommand","content":"pause"}));
		}else{
			oClient.send(JSON.stringify({"type":"PlayerCommand","content":"play"}));
		}
	});
	$("#searchbutton").click(function(){
		var sSearch = $("#songsearch").val();
		if(sSearch != ""){
			oClient.send(JSON.stringify({"type":"SongSearch","content": sSearch}));
		}else{
			oMediaScope.resetSongList();
		}
	});

};
oClient.onmessage = function(sMessage){
	var oMessage = JSON.parse(sMessage.data);
	if(oMessage.type == "SongChanged" || oMessage.type == "SongResponse" || oMessage.type == "PlayerStatusChanged"){
		oMediaScope.setCurrentSong(oMessage.content);
		if(typeof oMessage.player != "undefined"){
			oPlayer = oMessage.player;
			oMediaScope.setPlay(oMessage.player.bPlaying);
			oMediaScope.setPlayCounter(oMessage.player.lCurrentTime, oMessage.player.bPlaying);
		}
	}else if(oMessage.type == "SearchResponse"){
		oMediaScope.setSongList(oMessage.content);
	}
};
