var fs = require('fs');
var log = require('../lib/log.lib');

module.exports = {

	// attributes
	oDB: {'oSongs': {}, 'aFolders': []},
	lTotalFiles: 0,
	lLoadedFiles: 0,
	aID3V2Tags: {'TALB':'sAlbum','TBPM':'sBPM','TCOM':'sComposer','TCON':'sGenre','TIT2':'sTitle','TLEN':'sLength','TPE1':'sArtist','TPE2':'sAlbumArtist','TRCK':'sTrackNumber','TYER':'sYear','COMM':'sComment'},

	// initialize DB, load DB
	DB: function(){
		var oInfo = fs.statSync('./settings/db.json');
		if(oInfo.size > 1){
			this.oDB = require('./settings/db.json');
		}else{
			log.errorLog('The DB File has no content. Please reload your DB.');
		}
	},

	saveDB: function(fCallback){
		fs.writeFile('./settings/db.json', JSON.stringify(this.oDB), fCallback);
	},

	// load Folder into DB
	loadFolder: function(sFolder, fProcess, fFinished){
		this.recursiveLoad(sFolder, fProcess);
		if(typeof fFinished == 'function')
			fFinished(this.lLoadedFiles);
		this.lLoadedFiles = 0;
	},

	recursiveLoad: function(sFolder, fProcess){
		var oInfo = fs.statSync(sFolder);
		if(!oInfo.isDirectory()){
			log.errorLog("Not a Folder.");
			return;
		}
		this.oDB.aFolders.push(sFolder);
		var aContent = fs.readdirSync(sFolder);
		for(var i in aContent){
			oInfo = fs.statSync(sFolder + aContent[i]);
			if(oInfo.isDirectory()){
				this.countFiles(sFolder + aContent[i] + '/');
				this.recursiveLoad(sFolder + aContent[i] + '/', fProcess);
				if(typeof fProcess == 'function')
					fProcess(this.lLoadedFiles, this.lTotalFiles, 'directory', sFolder);
			}else if(oInfo.isFile(sFolder + aContent[i]) && this.isCorrectFileType(sFolder + aContent[i])){
				this.loadSongInfo(sFolder + aContent[i], oInfo);
				if(typeof fProcess == 'function')
					fProcess(this.lLoadedFiles, this.lTotalFiles, 'song', sFolder + aContent[i]);
				break;
			}
		}
	},

	countFiles: function(sFolder){
		this.lTotalFiles += fs.readdirSync(sFolder).length;
	},

	// load Song Information
	loadSongInfo: function(sPath, oInfo){
		this.oDB.oSongs[sPath] = {};
		var oFile = fs.readFileSync(sPath, {flag: 'r'});
		this.oDB.oSongs[sPath] = this.loadID3V2(sPath, oInfo, oFile);
		if(this.oDB.oSongs[sPath] == null || typeof this.oDB.oSongs[sPath].sTitle == 'undefined')
			this.oDB.oSongs[sPath] = this.loadID3V1(sPath, oInfo, oFile);
		this.lLoadedFiles++;
	},

	// load ID3V11 Tag
	loadID3V1: function(sPath, oInfo, oFile){
		var oSongV1 = {};
		oSongV1.sTagType = this.parseBuffer(oFile.toString('utf8', oInfo.size - 128, oInfo.size - 125));
		if(oSongV1.sTagType != 'TAG'){
			return null;
		}
		oSongV1.sTitle = this.parseBuffer(oFile.toString('utf8', oInfo.size - 125, oInfo.size - 95));
		oSongV1.sArtist = this.parseBuffer(oFile.toString('utf8', oInfo.size - 95, oInfo.size - 65));
		oSongV1.sAlbum = this.parseBuffer(oFile.toString('utf8', oInfo.size - 65, oInfo.size - 35));
		oSongV1.lYear = parseInt(oFile.toString('utf8', oInfo.size - 35, oInfo.size - 31));
		if(oFile.toString('utf8', oInfo.size - 3, oInfo.size - 2) == '\u0000'){
			oSongV1.sComment = this.parseBuffer(oFile.toString('utf8', oInfo.size - 31, oInfo.size - 3));
			oSongV1.lTrackNr = oFile.readUInt8(oInfo.size - 2);
		}else{
			oSongV1.sComment = this.parseBuffer(oFile.toString('utf8', oInfo.size - 31, oInfo.size - 1));
			oSongV1.lTrackNr = null;
		}
		oSongV1.lGenre = oFile.readUInt8(oInfo.size - 1);
		oSongV1.lSize = oInfo.size;
		return oSongV1;
	},

	// load ID3V12 Tag
	loadID3V2: function(sPath, oInfo, oFile){
		var oSongV2 = {};
		var sTagType = oFile.toString('utf8', 0, 3);
		if(sTagType != 'ID3')
			return null;
		var lTagVersion = [oFile.readUInt8(3), oFile.readUInt8(4)];
		var lTagFlags = oFile.readUInt8(5);
		var lTagSize = oFile.readUInt32BE(6);
		var lHeaderSize = 10;
		if((lTagFlags & 0x40) !== 0) {
			lHeaderSize += dv.readUInt32BE(11);
		}
		var lPos = lHeaderSize;
		if(lTagVersion[0] < 3){
			// TODO: implement for < Version 3
			// console.log(oFile.toString('utf8', 8, 11));
		}else{
			var c = 0;
			while(lPos <= lTagSize){
				var sTag = oFile.toString('utf8', lPos, lPos + 4);
				var lLength = oFile.readUInt32BE(lPos + 4) - 1;
				lPos += 11;
				if(lLength < 0)
					continue;
				if(lPos + lLength >= lTagSize)
					break;
				for(var i in this.aID3V2Tags){
					if(i == sTag)
						oSongV2[this.aID3V2Tags[sTag]] = this.parseBuffer(oFile.toString('utf8', lPos, lPos + lLength));
				}
				lPos += lLength;
			}
		}
		oSongV2.lSize = oInfo.size;
		return oSongV2;
	},

	// check if File is of correct File type
	isCorrectFileType: function(sPath){
		var sFT = sPath.substr(sPath.lastIndexOf('.') + 1);
		if(sFT == 'mp3')
			return true;
		return false;
	},

	parseBuffer: function(sInput){
		return sInput.toString().replace(/(^\s+|\s+$)/, '');
	}

};
