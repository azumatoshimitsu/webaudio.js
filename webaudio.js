//Webaudio.js
//MIT license. 
//Copyright (c) 2014 Azuma Toshimitsu
//vosegus.org

window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var WebAudio = function(arg) {

	if(!window.AudioContext) {
		throw new Error(['AudioContext is not supported']);
	}

	var context = new AudioContext();
	var loop = arg.url || false;
	var extention = supportedAudioFormat();
	var url = arg.url + extention;
	var userMedia = arg.userMedia;
	var buffer, source, timer, stream, streamNode;
	var currentTime = 0;

	var analyser = context.createAnalyser();
		analyser.fftSize = (arg.fftSize || 2048);
		analyser.minDecibels = (arg.minDecibels || -100);
		analyser.smoothingTimeConstant = (arg.smoothingTimeConstant || 0.8);

	return {
		play: function (delay, start) {
			var delay = delay || 0;
			var start = start || currentTime;
			if(!source) {
				var req = new XMLHttpRequest();
				req.open("GET", url, true);
				req.responseType = "arraybuffer";
				req.onload = function(e) {
					context.decodeAudioData(req.response, function(buf){
						buffer = buf;
						source = context.createBufferSource();
						source.buffer = buffer;
						source.loop = loop;
						source.connect(analyser);
						source.connect(context.destination);//出力先に接続
						source.start(delay, start);

					}, function(e){throw new Error(e);});
				}
				req.send();
			} else {
				source.stop(delay, start);
				source = context.createBufferSource();
				source.buffer = buffer;
				source.loop = loop;
				source.connect(analyser);
				source.connect(context.destination);
				source.start(delay, start);
			}
			return analyser;
		},
		stop: function () {
			source.stop();
			currentTime = context.currentTime;
			clearInterval(timer);
		},
		startUserMedia: function() {
			if(!userMedia ) {
				throw new Error(['unset media type']);
			}
			if(!navigator.getUserMedia) {
				throw new Error(['getUserMedia is not supported']);
			}
			navigator.getUserMedia(
				userMedia,
				function(stream) {
					streamNode = context.createMediaStreamSource(stream);
					streamNode.connect(analyser);
				},
				function(e) {
					throw new Error(e);
				}
			);
			return analyser;
		}
	};

	function supportedAudioFormat(){
		var audio = new Audio();
		var extention = "";
		if(audio.canPlayType("audio/ogg") == "probably" || audio.canPlayType("audio/ogg") == "maybe"){
		 	extention = ".ogg";
		} else if(audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe"){
		 	extention = ".wav";
		} else if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe"){
		 	extention = ".mp3";
		} else {
			return false;
		}
		return extention;
	};
	
};
