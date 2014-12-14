var fs = require('fs');
var Log = require('../lib/log.lib');
var Lame = require('lame');
var Taglib = require('taglib');

module.exports = {

	// Attributes
	oDB: {'aSongs': {}, 'aFolders': {}},
	lTotalFiles: 0,
	lLoadedFiles: 0,
	aID3V2Tags: {'TALB':'sAlbum','TCOM':'sComposer','TCON':'sGenre','TIT2':'sTitle','TLEN':'sLength','TPE1':'sArtist','TPE2':'sAlbumArtist','TRCK':'sTrackNumber','TYER':'sYear','COMM':'sComment'},

	//------------------------------------------------------------------------------
	// Initialize and load DB from DB File
	//
	DB: function(){

		var oInfo = fs.statSync('./settings/db.json');

		if(oInfo.size > 1){
			this.oDB = require('../settings/db.json');
			this.lLoadedFiles = Object.keys(DB.oDB.aSongs).length;
		}else{
			Log.errorLog('The DB File has no content.');
			this.saveDB();
		}

	},

	//------------------------------------------------------------------------------
	// Save the loaded DB to the DB File
	//
	saveDB: function(){

		fs.writeFileSync('./settings/db.json', JSON.stringify(this.oDB), {"flag": "w+"});
		Log.log("DB saved.");

	},

	//------------------------------------------------------------------------------
	// Load the given Folder and initialize File parsing
	//
	// @param string : the Folder-Path to load
	// @param function : the callback Function for the Load Process
	// @param function : the callback Function for when the Process is funished
	//
	loadFolder: function(sFolder, fProcess, fFinished){

		this.loadFoldersRecursive(sFolder, fProcess);
		this.lTotalFiles -= Object.keys(DB.oDB.aFolders).length;
		this.loadFilesInFolders(fProcess);

		if(typeof fFinished == 'function')
			fFinished(this.lLoadedFiles);

		this.lLoadedFiles = 0;

	},

	//------------------------------------------------------------------------------
	// Recursive Function; Folders and Subfolders; Puts them into Array to load
	// later
	//
	// @param string : the Folder-Path to load
	// @param function : the callback Function for the Load Process
	//
	loadFoldersRecursive: function(sFolder, fProcess){

		var oInfo = fs.statSync(sFolder);

		if(!oInfo.isDirectory()){
			Log.errorLog("Not a Folder.");
			return;
		}

		this.oDB.aFolders[sFolder] = false;
		var aContent = fs.readdirSync(sFolder);

		for(var i in aContent){

			oInfo = fs.statSync(sFolder + aContent[i]);
			if(oInfo.isDirectory()){
				this.countFiles(sFolder + aContent[i] + '/');
				this.loadFoldersRecursive(sFolder + aContent[i] + '/', fProcess);
			}

		}

	},

	//------------------------------------------------------------------------------
	// Checks Folders in the DB and loads MP3 Files found.
	//
	// @param function : the callback Function for the Load Process
	//
	loadFilesInFolders: function(fProcess, lIndex){

		for(var i in this.oDB.aFolders){

			var aContent = fs.readdirSync(i);
			for(var j in aContent){
				var oInfo = fs.statSync(i + aContent[j]);
				if(oInfo.isFile() && this.isCorrectFileType(i + aContent[j])){

					if(typeof DB.oDB.aSongs[i + aContent[j]] == "undefined"){
						this.loadSongInfo(i + aContent[j], oInfo);

						if(typeof fProcess == 'function')
							fProcess(Number(((this.lLoadedFiles / this.lTotalFiles) * 100).toFixed(2)), i + aContent[j]);
					}

				}
			}

			this.oDB.aFolders[i] = true;

		}

	},

	//------------------------------------------------------------------------------
	// Count the Files a Folder contains; used for estimating the Load Process
	//
	// @param string : the Folder-Path to load
	//
	countFiles: function(sFolder){

		this.lTotalFiles += fs.readdirSync(sFolder).length;

	},

	//------------------------------------------------------------------------------
	// Handles as Song-Path and saves gathered Information to DB
	//
	// @param string : the File-Path to load
	// @param object : FS information about the File; used for filesize
	//
	loadSongInfo: function(sPath, oInfo, fResolve){

		this.oDB.aSongs[sPath] = {};
		var oFile = fs.readFileSync(sPath, {flag: 'r'});

		this.lLoadedFiles++;

		this.oDB.aSongs[sPath] = this.loadID3V2(sPath, oInfo, oFile);
		if(this.oDB.aSongs[sPath] == {} || typeof this.oDB.aSongs[sPath].sTitle == 'undefined')
			this.oDB.aSongs[sPath] = this.loadID3V1(sPath, oInfo, oFile);

		this.oDB.aSongs[sPath].lBitrate = 0;
		this.oDB.aSongs[sPath].lLength = 0;
		this.oDB.aSongs[sPath].lSize = 0;
		this.oDB.aSongs[sPath].lSampleRate = 0;
		this.oDB.aSongs[sPath].lChannels = 0;
		this.oDB.aSongs[sPath].lAdded = Math.round(Date.now() / 1000);
		this.oDB.aSongs[sPath].lLastPlay = 0;
		this.oDB.aSongs[sPath].lLastSkip = 0
		this.oDB.aSongs[sPath].lPlayCount = 0;
		this.oDB.aSongs[sPath].lSkipCount = 0;
		this.oDB.aSongs[sPath].sPath = sPath;
		this.oDB.aSongs[sPath].lId = this.oDB.aSongs.length - 1;

	},

	songInfoCheck: function(){
		Taglib.read(sPath, function(sErr, oTags, oProp){
			if(typeof oTags.title != "undefined" && typeof oTags.artist != "undefined" && typeof oTags.album != "undefined"){
				oThat.oDB.aSongs[sPath].sTitle = oTags.title || "";
				oThat.oDB.aSongs[sPath].sArtist = oTags.artist || "";
				oThat.oDB.aSongs[sPath].sAlbum = oTags.album || "";
				oThat.oDB.aSongs[sPath].lYear = oTags.year || 0;
				oThat.oDB.aSongs[sPath].lTrack = oTags.track || 0;
				oThat.oDB.aSongs[sPath].sComment = oTags.comment || "";
				oThat.oDB.aSongs[sPath].lLength = oProp.length || 0;
				oThat.oDB.aSongs[sPath].lBitrate = oProp.bitrate || 0;
				oThat.oDB.aSongs[sPath].lSampleRate = oProp.sampleRate || 0;
				oThat.oDB.aSongs[sPath].lChannels = oProp.channels || 2;
			}
		});
	},

	//------------------------------------------------------------------------------
	// Load ID3V1 Tag according to Standard
	//
	// @param string : the File-Path to load
	// @param object : FS information about the File
	// @param object : the read Content of the File
	//
	loadID3V1: function(sPath, oInfo, oFile){

		var oSongV1 = {};
		oSongV1.sTagType = this.parseBuffer(oFile.toString('utf8', oInfo.size - 128, oInfo.size - 125));
		if(oSongV1.sTagType != 'TAG')
			return {};

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

		oSongV1.sGenre = oFile.readUInt8(oInfo.size - 1);

		return oSongV1;

	},

	//------------------------------------------------------------------------------
	// Load ID3V2 Tag according to Standard
	//
	// @param string : the File-Path to load
	// @param object : FS information about the File
	// @param object : the read Content of the File
	//
	loadID3V2: function(sPath, oInfo, oFile){

		var oSongV2 = {};
		var sTagType = oFile.toString('utf8', 0, 3);
		if(sTagType != 'ID3')
			return {};

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
				else if(lPos + lLength >= lTagSize)
					break;

				for(var i in this.aID3V2Tags){
					if(i == sTag)
						oSongV2[this.aID3V2Tags[sTag]] = this.parseBuffer(oFile.toString('utf8', lPos, lPos + lLength));
				}

				lPos += lLength;

			}

		}

		oSongV2.lAdded = Math.round(Date.now() / 1000);

		return oSongV2;
	},

	//------------------------------------------------------------------------------
	// Check Filetype for Music Files [currently only MP3]
	//
	// @param string : the File-Path to load
	//
	isCorrectFileType: function(sPath){

		var sFT = sPath.substr(sPath.lastIndexOf('.') + 1);
		if(sFT == 'mp3')
			return true;
		return false;

	},

	//------------------------------------------------------------------------------
	// Parse String for not needed Characters
	//
	// @param string : value to parse
	//
	parseBuffer: function(sInput){

		return unescape(encodeURIComponent(sInput.toString())).replace(/\u0000/, '').trim();

	}

};
