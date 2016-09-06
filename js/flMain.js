function init(subjectDetailsUnparsed)
{
	var subjectDetails = parseForm(subjectDetailsUnparsed);
	if(!checkVideoSupported())
	{
		$('#mediaPane').html(unsupported);
		return;
	}
	//These are set for each subject and remain the same
	var left = {
		imageIndex : Math.round(Math.random()),
		videosIndex : Math.round(Math.random())
	};
	var right = {
		imageIndex : 1 - left.imageIndex,
		videosIndex : 1 - left.videosIndex
	};
	//console.log(left);
	//console.log(right);
	
	var rightMedia = 
	{
		image: buildImage(images[right.imageIndex],'rightImage'),
		videos: buildVids(videos[right.videosIndex], 'rightVids')
	} ;
	var leftMedia =
	{
		image:buildImage(images[left.imageIndex],'leftImage'),
		videos: buildVids(videos[left.videosIndex], 'leftVids')
	};

	
	// below is the experiment separated into trials

	var intro = {phaseName: 'into', trials: [{	type: 'text',  media: introText, clicks: 1, backgroundColour: GREY}]};
	var conclusion = {phaseName: 'conclusion', trials:[{	type: 'text', media: endText, clicks: 1}]};
	/*
	Warm-up phase:
		2 trials where only the right hand butterfly appears. After each touch, the video plays.
		2 trials where only the left butterfly appears. After each touch, the video plays.
		*/
		var warmUpPhase = {phaseName: 'warm up', trials:[
		{	type: 'click', media: leftMedia,clicks: 1},
		{ 	type: 'reward',media: leftMedia},
		{	type: 'click', media: leftMedia,clicks: 1},
		{ 	type: 'reward',media: leftMedia},
		{	type: 'click', media: rightMedia,clicks: 1},
		{ 	type: 'reward',media: rightMedia},
		{	type: 'click', media: rightMedia,clicks: 1},
		{ 	type: 'reward',media: rightMedia}]};


	/*
	Single-action phase. Part A.
	Then there are 8 more trials like this, but with this pseudo-random sequence:
	RLRRLLRL 
	Single action phase Part B.
	Then there are 8 more trials with this sequence:
	LRRLRLLR 
	But for these 8 trials, it should take between 1 and 5 touches (vary randomly for each trial) for the video to play.
	*/

	var L = [{type: 'click',media: leftMedia,clicks: 5},
	{type: 'reward',media: leftMedia}];
	var R = [{type: 'click',media: rightMedia,clicks: 5},
	{type: 'reward',media: rightMedia}];
	var singleActionPhaseA = {phaseName: 'Single-action phase. Part A.', trials: [].concat(R,L,R,R,L,L,R,L)};
	var singleActionPhaseB = {phaseName: 'Single-action phase. Part B.', trials: [].concat(L,R,R,L,R,L,L,R)};



	/* 
	Choice phase.
	Then there is a 7 minute block where both butterflies on displayed 
	on the screen and the child can freely touch as much as they want 
	and the corresponding videos will play. During this time, it should 
	vary randomly from 1 to 5 touches for the video to play.
	*/
	var choicePhaseInitial = {phaseName: 'Choice', trials:[{type:'choice', media: [{
		type: 'click',
		media: leftMedia,
		clicks: 5
	},{
		type: 'click',
		media: rightMedia,
		clicks: 5
	}], timeoutMinutes: 7, minVideos:DEBUG ? 2 : 9, backgroundColour: GREY }]};

	/*
		Outcome devaluation
		The butterflies disappears. Background changes from grey to blue.
		The video display appears, and the three video clips from one of the two car- 
		toon series/movies repeat four times with a 3-s interval between clips. 
		Which show/movie is randomly chosen. 
		*/
		var outcomeMedia = (Math.random() >= 0.5) ? leftMedia.videos : rightMedia.videos;


		var outcomeDevaluation = {phaseName: 'Outcome devaluation', trials:[
		{type: 'reward', media: { videos: outcomeMedia}, backgroundColour: BLUE, randomPick: false, timeoutSeconds: 3}]};

	/*
		Post-devaluation extinction test 
		Following outcome devaluation, the video display 
		disappears, the background color changes back to gray, 
		and the display with the two butterfly icons appear again. 
		Unknown to the children, both response areas become deactivated, 
		so that touch responses do not cause any video outcomes 
		for a period of 1 min.
			*/

		var postDeval = {phaseName: 'Post-devaluation extinction test', trials:[{type: 'post', media: [leftMedia,	rightMedia], timeoutMinutes: 1, backgroundColour: GREY}]};
	/*
		Post-devaluation reacquisition test. 
		This is identical to the choice phase except only lasts for 3.5 minutes.
		*/
		var choicePhasePD = {phaseName: 'Post-devaluation reacquisition', trials:[{type:'choice', media: [{
			type: 'click',
			media: leftMedia,
			clicks: 5
		},{
			type: 'click',
			media: rightMedia,
			clicks: 5
		}], timeoutMinutes: 7, minVideos: DEBUG ? 2 : 9, backgroundColour: GREY }]};


		var timeLineBuild = [ intro, warmUpPhase, singleActionPhaseA,
		singleActionPhaseB,  choicePhaseInitial,  outcomeDevaluation,
		postDeval,  choicePhasePD]; var timeline = timeLineBuild ;
		var results = buildInitialRes(left, right); results.subjectDetails =
		subjectDetails; timeBegin = Date.now();

		var phase = 0;	


		runPhase(timeline, phase, results, function(results)
		{
			$('#mediaPane').show();

			$('#mediaPane').html(resultsPage(results));
			if(DEBUG)
			{
				console.log("results:", JSON.stringify(results,  null, '\t'));
			}
			uploadFiles(results);


		});
	//begin trial
	function runPhase(timeline, phase, results, callback)
	{
		if(phase >= timeline.length)
		{
			return callback(results);
		}
		runTrials(timeline[phase].trials, 0, timeline[phase].phaseName, results, function(res)
		{	
			phase++;
			if(DEBUG && phase < timeline.length)
			{
				$('#phase').text("#"+ phase + " " + timeline[phase].phaseName);
				$('#jsonRes').val($('#jsonRes').val() + "\nRESULTS #"+ phase + "for phase:" + timeline[phase].phaseName + JSON.stringify(results,  null, '\t'));
			}
			return runPhase(timeline, phase, results, callback);
		});
	}
	
}
function runTrials(currentPhase, i, phaseName, results, next)
{
	var trial = currentPhase[i];
	if(i >= currentPhase.length)
	{
		scrub(trial);
		return next(results);
	}
	
	if(trial.backgroundColour)
	{
		$('#mainContainer').css("background-color", trial.backgroundColour);
	}
	var trialData = {phase: phaseName, trialIndex: i, type: currentPhase[i].type, timeStart: Date.now() - timeBegin};
	console.log("current trial:", trial);
	if(trial.type === 'post')
	{
		post(trial, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, phaseName, results, next);
		});
	}
	if(trial.type === 'choice')
	{
		choice(trial, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			scrub(trial);
			return runTrials(currentPhase, ++i, phaseName, results, next);
		});
	}
	if(trial.type === 'click')
	{
		click(trial.media.image, trial.clicks, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, phaseName, results, next);
		});
	}
	if(trial.type === 'reward')
	{
		reward(trial.media.videos, {randomPick: trial.randomPick, timeoutSeconds: trial.timeoutSeconds}, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, phaseName, results, next);
		});
	}
	if(trial.type === 'text')
	{
		text(trial.media, i, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, phaseName, results, next);
		});
	}
	if(trial.type === 'pause')
	{
		setTimeout(function() {runTrials(currentPhase, ++i, phaseName, results, next);}, 1000 * trial.timeoutSeconds);
	}

}
function post(trial, callback)
{
	//console.log('trialdata:', trialData);
	var image1 = trial.media[0].image;
	var image2 = trial.media[1].image;
	var clicks = 0;
	var events = [];
	setTimeout(function() {
		$(image1).hide();
		$(image1).off('click');
		$(image2).hide();
		$(image2).off('click');
		callback(events);
	}, 1000 * 60 * trial.timeoutMinutes / (DEBUG ? 10 : 1));

	$(image1).show();
	$(image2).show();
	$(image1).on('click', function() {
		if(SHAKES)
			{shakeImage(image1);}
		events.push({action :'click', image: 'left', time : Date.now() - timeBegin, clickNumber: ++clicks, imageSrc:$(image1).get(0).src});
	});
	$(image2).on('click', function() {
		if(SHAKES)
			{shakeImage(image2);}
		events.push({action :'click', image: 'right', time : Date.now() - timeBegin, clickNumber: ++clicks, imageSrc:$(image2).get(0).src});
	});
}

//this removes all event handlers and turns everything off
function scrub(trial)
{
	if(trial && trial.media)
	{
		scrubEvents(trial);
		scrubMedia(trial);
	}
	$('#mediaPane').hide();
}
function scrubEvents(trial)
{
	for(var x = 0; x < trial.media.length; x++)
	{
		$(trial.media[x].media.image).off('click');
		$(trial.media[x].media.videos).off('click');
	}
}

function scrubMedia(trial)
{
	for(var x = 0; x < trial.media.length; x++)
	{
		$(trial.media[x].media.image).hide();
		$(trial.media[x].media.videos).get(0).pause();
		$(trial.media[x].media.videos).hide();
	}
}


function choice(trial, callback)
{
	var eventsFinal = [];
	var timeUp = false;
	var timeout = setTimeout(function() {
		if(DEBUG)
		{
			console.log('Phase Timed Out and video played ' + rewards + " times");
			timeUp = true;
		}
		if(rewards >= trial.minVideos)
		{
			callback( eventsFinal);
		}		
	}, 60 * 1000 * trial.timeoutMinutes  / (DEBUG ? 100 : 1));
	var leftMed = trial.media[0];
	var rightMed = trial.media[1];
	var rewards = 0;
	var repeater = function()
	{
		scrubEvents(trial);
		click(leftMed.media.image, leftMed.clicks, function(tc1){
			$(rightMed.media.image).hide();
			eventsFinal = eventsFinal.concat(tc1);
			reward(leftMed.media.videos, {}, function(tr1){
				eventsFinal = eventsFinal.concat(tr1);
				if(++rewards >= trial.minVideos && timeUp)
				{
					return callback( eventsFinal);
				}
				return repeater([]);
			});
		});
		click(rightMed.media.image,rightMed.clicks, function(tc2){
			$(leftMed.media.image).hide();
			eventsFinal = eventsFinal.concat(tc2);
			reward(rightMed.media.videos, {}, function(tr2){
				eventsFinal = eventsFinal.concat(tr2);
				if(++rewards >= trial.minVideos && timeUp)
				{
					return callback( eventsFinal);
				}
				return repeater([]);
			});
		});
	};
	repeater(eventsFinal);
}
function click(media, maxClicks, callback)
{
	$(media).show();
	var randMaxClicks = maxClicks - Math.floor(maxClicks * Math.random());
	var currentClicks = 0;
	var events = [];
	if(DEBUG)
		console.log('clicks:', randMaxClicks, ' from maxClicks:', maxClicks);
	$(media).on('click', function(event)
	{
		if(SHAKES){shakeImage(media);}
		if(DEBUG && false)
			console.log('BUTTERFLY clicked:', $(media).get(0).src);
		events.push({action :'click', time : Date.now() - timeBegin, clickNumber: ++currentClicks, image:$(media).get(0).src});
		if(currentClicks >= randMaxClicks)
		{	
			$(media).hide();
			$( this ).off( event );
			//results.trials.push(trialData);
			callback(events);
		}
	});
}
function reward(videos, options, callback)
{
	options.randomPick = (options.randomPick === undefined) ? true : options.randomPick;
	options.timeoutSeconds = (options.timeoutSeconds === undefined) ? 0 : options.timeoutSeconds;
	if(DEBUG && false)
		console.log('REWARD registered for trial');
	$('#mediaPane').show();
	var events = [];
	if(videos instanceof Array)
	{
		if(options.randomPick)
		{
			// if videos is an array choose a random one
			videos = [videos[Math.floor(Math.random() *  videos.length)]]; 
		}
	}
	else
	{
		videos = [videos];
	}
	var index = 0;
	video = videos[index];
	$(video).show();
	$(video).get(0).play();
	//$(video).show();
	$(video).on('canplaythrough', function()
	{
		$(video).show();
	});
		//console.log(trial.media.videos[0]);
		$(video).on('ended',function(){
			events.push({action :'videoComplete', time : Date.now() - timeBegin});
			if(++index >= videos.length)
			{
				$(video).off('ended');
				$(video).hide();
				$('#mediaPane').hide();
				//results.trials.push(trialData);
				callback(events);
			}
			else
			{
				videos[0].src = videos[index].src;
				if(!options.timeoutSeconds)
				{
					$(video).get(0).play();
				}
				else
				{
					setTimeout(function() {$(video).get(0).play();}, options.timeoutSeconds * 1000);
				}
				
			}
		});
	}

	
	function text(text, index, callback)
	{
		if(DEBUG && false)
			console.log('INFORMATION BEING PRESENTED for trial');
		$('#mediaPane').show();
		$('#mediaPane').append('<div class="instruct" id="text_' + index + '">' + text + '<a href="#" class="clickhere"><b>Click here to continue</b></a>' + '</div>' );
		var events = [];
		$('a.clickhere').one('click', function()
		{
			events.push({action :'click', time : Date.now() - timeBegin});
			$('#text_' + index).hide();
			$('#mediaPane').hide();
			//results.trials.push(trialData);
			callback(events);
		});
	}
	function buildVids(vids, id)
	{
		var newVids = [];
		$('#mediaPane').show();
		for(var i =0 ; i < vids.files.length; i++)
		{
			var newVideo = document.createElement('video');
			newVideo.src = "videos/" + vids.files[i];
			newVideo.id = id + "_" + i;
			newVideo.className = 'rewardVid';
			newVideo.poster = "/img/poster.gif";
			console.log(' new video created' , newVideo);
			$('#mediaPane').append(newVideo);
			$('#' + newVideo.id).hide();
			newVids.push(newVideo);
		}
		$('#mediaPane').hide();
		return newVids;
	}
	function buildImage(image, id)
	{
		var newImage = document.createElement('img');
		newImage.src = "img/" + image;
		newImage.id = id;
		var offset =0;
		if(id === 'rightImage')
		{
			offset = sideWidth;
		}
		$('#mainContainer').append(newImage);
		$(newImage).css({left:  (sideWidth - imageWidth) / 2 + offset , top:(sideHeight - imageHeight)/2});
		$('#' + id).hide();
		return newImage;
	}
	function resize()
	{
		sideWidth = $('#mainContainer').width() / 2; 
		sideHeight = $('#mainContainer').height();
		
		$('#rightImage').css({left:  (sideWidth - imageWidth) / 2 + sideWidth , top:(sideHeight - imageHeight)/2});
		$('#leftImage').css({left:  (sideWidth - imageWidth) / 2 , top:(sideHeight - imageHeight)/2});
	}


	function buildInitialRes(left, right)
	{
		var results = {};
		results.left = {
			side: 'Left',
			image: images[left.imageIndex],
			videos: videos[left.videosIndex]
		};
		results.right = 
		{
			side: 'Right',
			image: images[right.imageIndex],
			videos: videos[right.videosIndex]
		};
		results.trials = [];
		if(DEBUG)
			console.log('intial results', results);
		return results;
	}

	function checkVideoSupported()
	{
		var canPlay = false;
		var v = document.createElement('video');
		if(v.canPlayType && v.canPlayType('video/mp4').replace(/no/, '')) {
			canPlay = true;
		}
		return canPlay;
	}

	function parseForm(subjectDetailsUnparsed)
	{
		return {
			dob: subjectDetailsUnparsed[0].value,
			age: subjectDetailsUnparsed[1].value,
			gender: subjectDetailsUnparsed[2].value,
			languages: subjectDetailsUnparsed[3].value,
			sequenceNo: subjectDetailsUnparsed[4].value,
			comments: subjectDetailsUnparsed[5].value
		};
	}
	function preload(videos, callback)
	{
		loadVid(videos, 0,0, callback);
	}

	function loadVid(vids, x ,y, callback)
	{
		if(x ==  videos.length)
		{
			callback();
		}
		else
		{
			$('#preloadPane').attr('src', "videos/" + videos[x].files[y]);
			$('#preloadPane').get(0).play();
			$('#preloadPane').one('canplaythrough', function(e)
			{
				console.log("videos/" + videos[x].files[y] + " loaded");
				if(y + 1 === videos[x].files.length)
				{
					loadVid(vids,  ++x, 0, callback);
				}
				else
				{
					loadVid(vids,  x, ++y, callback);
				}
				
			});
		}
	}
	$(window).on('resize', resize);
	function formValidate(form)
	{
		var message = "";
		if(	form.children(' input[name="dob"]').val() == ""	||
			form.children(' input[name="age"]').val() == ""	||
			form.children(' input[name="gender"]').val() == ""||
			form.children(' input[name="lang"]').val() == ""	||
			form.children(' input[name="sequence"]').val() == "")
		{
			message += "Please include a value for each field\n";
		}
		console.log(Date.parse(form.children(' input[name="dob"]').val()));
		if( isNaN(Date.parse(form.children(' input[name="dob"]').val())))
		{
			message += "Please include a valid DOB in the format of YYYY/MM/DD\n";
		}
		if(isNaN(parseInt(form.children(' input[name="age"]').val())))
		{
			message += "Include Age as whole numbers\n";
		}
		return message;

	}

	function saveResults(res)
	{
		var resText = '';
		resText += 'Subject Details\n';

		resText += parseObj(res.subjectDetails, {showHeader:true});
		resText  += '\n\n\n\n';

		resText += 'Media File config\n';
		resText += parseObj(res.left, {showHeader:true});
		resText += parseObj(res.right, {showHeader:false});
		resText  += '\n\n\n\n';

		resText += 'Trial Results\n';

		resText += parseObj(res.trials, {showHeader:true});

	//console.log(JSON.flatten(testRes));
	function parseObj(obj, options)
	{
		if(typeof options === 'undefined' )
		{
			options = {};
		}
		if(typeof options.showHeader === 'undefined' )
		{
			options.showHeader = false;
		}
		var resText = '';
		if(Array.isArray(obj))
		{
			if(options.showHeader)
			{
				var headers = [];
				for(var x =0; x < obj.length; x ++ )
				{
					var currentFlatObj = flatten(obj[x]);
					var y = 0;
					for(var propt in currentFlatObj)
					{
						if(y >= headers.length)
						{
							//console.log('adding', getLastProp(propt));
							headers.push(getLastProp(propt));
						}
						else if(!(headers[y].lastIndexOf(getLastProp(propt)) == 0 || 
							headers[y].lastIndexOf("/" + getLastProp(propt)) > 0))
						{
							headers[y] += "/" + getLastProp(propt);

						}
						y++;
					}
				}
				for(var z  = 0; z < headers.length; z++)
				{
					resText+= headers[z] + ",";
				}
				resText +="\n";
				
			}
			for(var x =0; x < obj.length; x ++ )
			{
				resText += parseObj(flatten(obj[x]));
			}
			//console.log(resText);
			return resText;

		}
		else
		{
			obj = flatten(obj);
			if(options.showHeader)
			{
				for(var propt in obj){
					resText  += propt + ',';
				}
				resText  += '\n';
			}		
			for(var propt in obj){
				resText  += obj[propt] + ',';
			}
			resText  += '\n';
			return resText;
		}
		function getLastProp(str)
		{
			return propt.lastIndexOf('.') != -1 ? propt.slice(propt.lastIndexOf('.') + 1) : propt;
		}
		function flatten(data) {
			var result = {};
			function recurse (cur, prop) {
				if (Object(cur) !== cur) {
					result[prop] = cur;
				} else if (Array.isArray(cur)) {
					for(var i=0, l=cur.length; i<l; i++)
						recurse(cur[i], prop + "." + i);
					if (l == 0)
						result[prop] = [];
				} else {
					var isEmpty = true;
					for (var p in cur) {
						isEmpty = false;
						recurse(cur[p], prop ? prop+"."+p : p);
					}
					if (isEmpty && prop)
						result[prop] = {};
				}
			}
			recurse(data, "");
			return result;
		}
	}
	return resText;
}

function buildFilename(res)
{
	var today = new Date();
	return res.subjectDetails.gender.toLowerCase() + "-" + res.subjectDetails.age + "-" + today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate() + '--' + today.getTime() ;
}

 /**
 * Called when the client library is loaded to start the auth flow.
 */
 function handleClientLoad() {
 	$('#jsonRes').val($('#jsonRes').val() + 'Client library loaded...\n');
 	window.setTimeout(checkAuth, 1);
 }
	/**
	* Check if the current user has authorized the application.
	*/
	function checkAuth() {
		$('#jsonRes').val($('#jsonRes').val() + 'Checking application authorization...\n');
		gapi.auth.authorize(
			{'client_id': authenticate.CLIENT_ID, 'scope': authenticate.SCOPES, 'immediate': true},
			handleAuthResult);
	}
	/**
	* Called when authorization server replies.
	*
	* @param {Object} authResult Authorization result.
	*/
	function handleAuthResult(authResult) {
		$('#jsonRes').val($('#jsonRes').val() + 'Handling authorization result...\n');
		var authButton = document.getElementById('authButton');
		var preloadButton = document.getElementById('preloadVidsButton');
		authButton.style.display = 'none';
		preloadButton.style.display = 'none';
		if (authResult && !authResult.error) {
			$('#jsonRes').val($('#jsonRes').val() + 'Authorized...\n');
			// Access token has been successfully retrieved, requests can be sent to the API.
			$('#auth').append('Google account authorized...');
			preloadButton.style.display = 'block';
		} else {
			$('#jsonRes').val($('#jsonRes').val() + 'Not yet authorized...\n');
			// No access token could be retrieved, show the button to start the authorization flow.
			authButton.style.display = 'block';
			authButton.onclick = function() {
				gapi.auth.authorize(
					{'client_id': authenticate.CLIENT_ID, 'scope': authenticate.SCOPES, 'immediate': false},
					handleAuthResult);
			};
		}
	}
  /**
       * Start the file upload.
       *
       * @param {Object} evt Arguments from the file selector.
       */
       function uploadFiles(results) {
       	gapi.client.load('drive', 'v2', function() {
       		insertFile(results, {mode:'csv'});
       		insertFile(results, {mode:'json'});
       	});
       }
      /**
       * Insert new file.
       */
       function insertFile(results, options) {
       	var resText;
       	if(options.mode === 'csv')
       	{
       		resText = saveResults(results);
       	}
       	else
       	{
       		resText =  JSON.stringify(results,  null, '\t');
       	}
       	const boundary = '-------314159265358979323846264';
       	const delimiter = "\r\n--" + boundary + "\r\n";
       	const close_delim = "\r\n--" + boundary + "--";
       	var appState = '';
       	var fileName = buildFilename(results)+'.' + (options.mode || 'txt');
       	var contentType = 'application/json';
       	var metadata = {
       		'title': fileName,
       		'mimeType': contentType,
       		'parents': [{'id': authenticate.FOLDER_ID }]
       	};
       	var base64Data = btoa(resText);
       	var multipartRequestBody =
       	delimiter +
       	'Content-Type: application/json\r\n\r\n' +
       	JSON.stringify(metadata) +
       	delimiter +
       	'Content-Type: ' + contentType + '\r\n' +
       	'Content-Transfer-Encoding: base64\r\n' +
       	'\r\n' +
       	base64Data +
       	close_delim;
       	var request = gapi.client.request({
       		'path': '/upload/drive/v2/files',
       		'method': 'POST',
       		'params': {'uploadType': 'multipart'},
       		'headers': {
       			'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
       		},
       		'body': multipartRequestBody});
       	request.execute(function(arg) {
       		$('#jsonRes').val($('#jsonRes').val() + 'Results Uploaded to url:' + arg.downloadUrl);

       	});
       }
       var ncindex = 0;
       function clickHandler(e)
       {
       	$('#jsonRes').val($('#jsonRes').val() + 'normal CLICK:' + (++ncindex));
       }
       function shakeImage(media) {
       	var l = 20;  
       	for( var i = 0; i < 4; i++ )   
       		$( media ).animate( { 
       			'margin-left': "+=" + ( l = -l ) + 'px',
       			'margin-right': "-=" + l + 'px'
       		}, 20);  

       }
	       function fullScreen()
	       {
	       	if (document.fullscreenEnabled || 
	       		document.webkitFullscreenEnabled || 
	       		document.mozFullScreenEnabled ||
	       		document.msFullscreenEnabled
	       		) {
	       		var i = document.documentElement;
	// go full-screen
	if (i.requestFullscreen) {
		i.requestFullscreen();
	} else if (i.webkitRequestFullscreen) {
		i.webkitRequestFullscreen();
	} else if (i.mozRequestFullScreen) {
		i.mozRequestFullScreen();
	} else if (i.msRequestFullscreen) {
		i.msRequestFullscreen();
	}

	}
	}