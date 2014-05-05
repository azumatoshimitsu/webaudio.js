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
	var extention = supportedAudioFormat();
	var userMedia = arg.userMedia;
	var buffer, source, stream, streamNode, oscillator;
	var prop = {};
	prop.currentTime = 0;
	prop.url = arg.url + extention;
	prop.loop = arg.loop || false;

	prop.analyserNode = context.createAnalyser();
	prop.analyserNode.fftSize = (arg.fftSize || 2048);
	prop.analyserNode.minDecibels = (arg.minDecibels || -100);
	prop.analyserNode.smoothingTimeConstant = (arg.smoothingTimeConstant || 0.8);

	prop.gainNode = context.createGainNode();
	prop.gainNode.gain.value = arg.value || 1;

	return {
		get: function(propName) {
			if(!prop[propName]) {
				throw new Error([propName + ' Can not be get']);
			}
			return prop[propName];
		},
		set: function(propName, value) {
			if(propName === 'gainNodeValue') {
				prop['gainNode'].gain.value = value;
			} else {
				prop[propName] = value;
			}
		},
		play: function (delay, start) {
			var delay = delay || 0;
			var start = start || prop.currentTime;
			if(!source) {
				var req = new XMLHttpRequest();
				req.open("GET", prop.url, true);
				req.responseType = "arraybuffer";
				req.onload = function(e) {
					context.decodeAudioData(req.response, function(buf){
						buffer = buf;
						playSource(delay, start);
					}, function(e){throw new Error(e);});
				}
				req.send();
			} else {
				source.stop(0);
				playSource(delay, start);
			}
		},
		stop: function () {
			if(source) {
					source.stop(0);
				prop.currentTime = context.currentTime;
			}
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
					streamNode.connect(prop.analyserNode);
				},
				function(e) {
					throw new Error(e);
				}
			);
		},
		oscPlay: function(hz, wave) {
            var h = hz || 440;
            var t = wave || 'SINE';
            if(oscillator)
            	oscillator.stop(0);
            oscillator = context.createOscillator();
            oscillator.connect(prop.gainNode);
            prop.gainNode.connect(context.destination);
            oscillator.frequency.value = h;
            oscillator.type = oscillator[t];//波形を選択
            oscillator.start(0);//再生
		},
		oscStop: function() {
            if(oscillator)
            	oscillator.stop(0);
		}
	};

	function playSource(delay, start) {
		source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = prop.loop;
		source.connect(prop.gainNode);
		source.connect(prop.analyserNode);
		prop.gainNode.connect(context.destination);
		source.start(delay, start);
	};

	function supportedAudioFormat(){
		var audio = new Audio();
		var extention = "";
		if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe"){
		 	extention = ".mp3";
		} else if(audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe"){
		 	extention = ".wav";
		} else if(audio.canPlayType("audio/ogg") == "probably" || audio.canPlayType("audio/ogg") == "maybe"){
		 	extention = ".ogg";
		} else {
			return false;
		}
		return extention;
	};
	
};
