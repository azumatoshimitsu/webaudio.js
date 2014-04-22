webaudio.js
===========
##Install
```javascript
<script src="webaudio.js"></script>
```

##Argument
```javascript
{
  url: String,
  volume: Number,
  loop: Bool,
  userMedia: { audio : Bool }
}
```

##Example
```javascript
var audio = new WebAudio({
	url: 'sound',
	loop: true,
	userMedia: { audio : true }
});
audio.play();
```
##Method
* play(delay, start);
* stop();
* startUserMedia();
* get('property');
* set('property', value);
* oscPlay(hz, wave);
* oscStop();

##Property
* analyserNode
* currentTime
* url
* loop
