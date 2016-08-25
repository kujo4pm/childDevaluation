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
	var choicePhaseInitial = {phaseName: 'choice', trials:[{type:'choice', media: [{
		type: 'click',
		media: leftMedia,
		clicks: 5
	},{
		type: 'click',
		media: rightMedia,
		clicks: 5
	}], timeoutMinutes: 7, backgroundColour: GREY }]};

	/*
		Outcome devaluation
		The butterflies disappears. Background changes from grey to blue.
		The video display appears, and the three video clips from one of the two car- 
		toon series/movies repeat four times with a 3-s interval between clips. 
		Which show/movie is randomly chosen. 
		*/
		var outcomeMedia = (Math.random() >= 0.5) ? leftMedia.videos : rightMedia.videos;


		var outcomeDevaluation = {phaseName: 'Outcome devaluation', trials:[
		{type: 'reward', media: { videos: outcomeMedia[0]}, backgroundColour: BLUE},
		{type: 'pause', timeoutSeconds: 3},
		{type: 'reward', media: { videos: outcomeMedia[1]} },
		{type: 'pause', timeoutSeconds: 3},
		{type: 'reward', media: { videos: outcomeMedia[2]}}
		]};

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
		}], timeoutMinutes: 7, backgroundColour: GREY }]};


		var timeLineBuild = [
		intro,
		warmUpPhase, 
		singleActionPhaseA, 
		singleActionPhaseB, 
		choicePhaseInitial, 
		outcomeDevaluation, 
		postDeval, 
		choicePhasePD, conclusion];
		var timeline = timeLineBuild ;
		var results = buildInitialRes(left, right);
		results.subjectDetails = subjectDetails;
		timeBegin = Date.now();

		var phase = 0;	


		runPhase(timeline, phase, results, function(results)
		{
			console.log(res);
			$('#mediaPane').show();
			$('#mediaPane').html('<pre>' + JSON.stringify(res,  null, '\t') + '</pre>');
			console.log("results:", JSON.stringify(res,  null, '\t'));
		});
	//begin trial
	function runPhase(timeline, phase, results, callback)
	{
		runTrials(timeline[phase].trials, 0, results, function(res)
		{	
			phase++;
			if(DEBUG)
			{
				$('#phase').text("#"+ phase + " " + timeline[phase].phaseName);
				$('#jsonRes').val($('#jsonRes').val() + "\nRESULTS #"+ phase + "for phase:" + timeline[phase].phaseName + JSON.stringify(results,  null, '\t'));
			}
			return runPhase(timeline, phase, results, callback);
		});

		
	}
	
}
function runTrials(currentPhase, i, results, next)
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
	var trialData = {trialIndex: i, type: currentPhase[i].type, timeStart: Date.now() - timeBegin};
	console.log("current trial:", trial);
	if(trial.type === 'post')
	{
		post(trial, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, results, next);
		});
	}
	if(trial.type === 'choice')
	{
		choice(trial, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			scrub(trial);
			return runTrials(currentPhase, ++i, results, next);
		});
	}
	if(trial.type === 'click')
	{
		click(trial.media.image, trial.clicks, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, results, next);
		});
	}
	if(trial.type === 'reward')
	{
		reward(trial.media.videos, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, results, next);
		});
	}
	if(trial.type === 'text')
	{
		text(trial.media, i, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrials(currentPhase, ++i, results, next);
		});
	}
	if(trial.type === 'pause')
	{
		setTimeout(function() {runTrials(currentPhase, ++i, results, next);}, 1000 * trial.timeoutSeconds);
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
		$(image1).off();
		$(image2).hide();
		$(image2).off();
		callback(events);
	}, 100 * 60 * trial.timeoutMinutes);

	$(image1).show();
	$(image2).show();
	$(image1).on('click', function() {
		events.push({action :'click', image: 'left', time : Date.now() - timeBegin, clickNumber: ++clicks, imageSrc:$(image1).get(0).src});
	});
	$(image2).on('click', function() {
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
		$(trial.media[x].media.image).off();
		$(trial.media[x].media.videos).off();
	}
}

function scrubMedia(trial)
{
	for(var x = 0; x < trial.media.length; x++)
	{
		$(trial.media[x].media.image).hide();
		$(trial.media[x].media.videos).hide();
	}
}


function choice(trial, callback)
{
	var eventsFinal = [];
	setTimeout(function() {
		console.log("final:", eventsFinal);
		callback( eventsFinal);
	}, 60 * 100 * trial.timeoutMinutes);
	var leftMed = trial.media[0];
	var rightMed = trial.media[1];
	var repeater = function()
	{
		scrubEvents(trial);
		click(leftMed.media.image, leftMed.clicks, function(tc1){
			$(rightMed.media.image).hide();
			eventsFinal = eventsFinal.concat(tc1);
			reward(leftMed.media.videos, function(tr1){
				eventsFinal = eventsFinal.concat(tr1);
				return repeater([]);
			});
		});
		click(rightMed.media.image,rightMed.clicks, function(tc2){
			$(leftMed.media.image).hide();
			eventsFinal = eventsFinal.concat(tc2);
			reward(rightMed.media.videos, function(tr2){
				eventsFinal = eventsFinal.concat(tr2);
				repeater([]);
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
function reward(videos, callback)
{
	if(DEBUG && false)
		console.log('REWARD registered for trial');
	$('#mediaPane').show();
	var video = videos;
	var events = [];
	if(videos instanceof Array)
	{
		// if videos is an array choose a random one
		video = videos[Math.floor(Math.random() *  videos.length)]; 
	}
	$(video).show();
	$(video).get(0).play();
	//$(video).show();
	$(video).on('canplaythrough', function()
	{
		$(video).show();
	});
		//console.log(trial.media.videos[0]);
		$(video).one('ended',function(){
			events.push({action :'videoComplete', time : Date.now() - timeBegin});
			$(video).hide();
			$('#mediaPane').hide();
			//results.trials.push(trialData);
			callback(events);
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