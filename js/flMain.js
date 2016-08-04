function init()
{
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

	/*
	Warm-up phase:
		2 trials where only the right hand butterfly appears. After each touch, the video plays.
		2 trials where only the left butterfly appears. After each touch, the video plays.
		*/
		var warmUpPhase = [
		{	type: 'text',  media: introText, clicks: 1, backgroundColour: GREY },
		{	type: 'click', media: leftMedia,clicks: 1},
		{ 	type: 'reward',media: leftMedia},
		{	type: 'click', media: leftMedia,clicks: 1},
		{ 	type: 'reward',media: leftMedia},
		{	type: 'click', media: rightMedia,clicks: 1},
		{ 	type: 'reward',media: rightMedia},
		{	type: 'click', media: rightMedia,clicks: 1},
		{ 	type: 'reward',media: rightMedia},
		{	type: 'text', media: endText, clicks: 1}];


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
	var singleActionPhaseA = [].concat(R,L,R,R,L,L,R,L);
	var singleActionPhaseB = [].concat(L,R,R,L,R,L,L,R);



	/* 
	Choice phase.
	Then there is a 7 minute block where both butterflies on displayed 
	on the screen and the child can freely touch as much as they want 
	and the corresponding videos will play. During this time, it should 
	vary randomly from 1 to 5 touches for the video to play.
	*/
	var choicePhase = [{type:'choice', media: [{
		type: 'click',
		media: leftMedia,
		clicks: 5
	},{
		type: 'click',
		media: rightMedia,
		clicks: 5
	}], timeoutMinutes: 7, backgroundColour: GREY }];

	/*
		Outcome devaluation
		The butterflies disappears. Background changes from grey to blue.
		The video display appears, and the three video clips from one of the two car- 
		toon series/movies repeat four times with a 3-s interval between clips. 
		Which show/movie is randomly chosen. 
		*/
		var outcomeMedia = (Math.random() >= 0.5) ? leftMedia.videos : rightMedia.videos;


		var outcomeDevaluation = [
		{type: 'reward', media: { videos: outcomeMedia[0]}, backgroundColour: BLUE},
		{type: 'pause', timeoutSeconds: 3},
		{type: 'reward', media: { videos: outcomeMedia[1]} },
		{type: 'pause', timeoutSeconds: 3},
		{type: 'reward', media: { videos: outcomeMedia[2]}}
		];

	/*
		Post-devaluation extinction test 
		Following outcome devaluation, the video display 
		disappears, the background color changes back to gray, 
		and the display with the two butterfly icons appear again. 
		Unknown to the children, both response areas become deactivated, 
		so that touch responses do not cause any video outcomes 
		for a period of 1 min.
			*/

		var postDeval = [{type: 'post', media: [leftMedia,	rightMedia], timeoutMinutes: 1}];

		var buildTimeLine = [].concat(warmUpPhase, singleActionPhaseA, singleActionPhaseB, choicePhase);
		var timeline = choicePhase;
		var results = buildInitialRes(left, right);
		timeBegin = Date.now();

	//begin trial
	runTrial(timeline, 0, results, function(res){
		console.log(res);
		$('#mainContainer').html('<pre>' + JSON.stringify(res,  null, '\t') + '</pre>');
		console.log("results:", JSON.stringify(res,  null, '\t'));
	} );

}
function runTrial(timeline, i, results, next)
{
	if(i >= timeline.length)
		return next(results);
	var trial = timeline[i];
	if(trial.backgroundColour)
	{
		$('#mainContainer').css("background-color", trial.backgroundColour);
	}
	var trialData = {trialIndex: i, type: timeline[i].type, timeStart: Date.now() - timeBegin};
	console.log("current trial:", trial)
	if(trial.type === 'post')
	{
		post(trial, trialData, results, function(results){
			return runTrial(timeline, ++i, results, next);
		});
	}
	if(trial.type === 'choice')
	{
		choice(trial, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			scrub(trial);
			return runTrial(timeline, ++i, results, next);
		});
	}
	if(trial.type === 'click')
	{
		click(trial.media.image, trial.clicks, function(events){
			trialData.events = events; 
			results.trials.push(trialData);
			return runTrial(timeline, ++i, results, next);
		});
	}
	if(trial.type === 'reward')
	{
		reward(trial.media.videos, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrial(timeline, ++i, results, next);
		});
	}
	if(trial.type === 'text')
	{
		text(trial.media, trialData, i, results, function(events){
			trialData.events = events;
			results.trials.push(trialData);
			return runTrial(timeline, ++i, results, next);
		});
	}
	if(trial.type === 'pause')
	{
		setTimeout(function() {runTrial(timeline, ++i, results, next);}, 1000 * trial.timeoutSeconds);
	}

}
function post(trial, trialData, results, callback)
{
	//console.log('trialdata:', trialData);
	var image1 = trial.media[0].image;
	var image2 = trial.media[1].image;
	var clicks = 0;
	setTimeout(function() {
		$(image1).hide();
		$(image1).off();
		$(image2).hide();
		$(image2).off();
		results.trials.push(trialData);
		callback(results);
	}, 100 * 60 * trial.timeoutMinutes);

	$(image1).show();
	$(image2).show();
	randomize(image1);
	randomize(image2);
	$(image1).on('click', function() {
		trialData.events.push({action :'click', image: 'left', time : Date.now() - timeBegin, clickNumber: clicks++});
	});
	$(image2).on('click', function() {
		trialData.events.push({action :'click', image: 'right', time : Date.now() - timeBegin, clickNumber: clicks++});
	});
}

//this removes all event handlers and turns everything off
function scrub(trial)
{
	scrubEvents(trial);
	scrubMedia(trial);
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
		$(trial.media[x].media.image).off();
		$(trial.media[x].media.videos).off();
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
	}
	repeater(eventsFinal);
}
function click(media, maxClicks, callback)
{
	$(media).show();
	randomize(media);
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
	console.log($(video));
	$(video).show();
	$(video).get(0).play();
		//console.log(trial.media.videos[0]);
		$(video).one('ended',function(){
			events.push({action :'videoComplete', time : Date.now() - timeBegin});
			$(video).hide();
			$('#mediaPane').hide();
			//results.trials.push(trialData);
			callback(events);
		});
	}

	
	function text(text, trialData, index, results, callback)
	{
		if(DEBUG && false)
			console.log('INFORMATION BEING PRESENTED for trial');
		$('#mediaPane').show();
		$('#mediaPane').append('<div class="instruct" id="text_' + index + '">' + text + '</div>');
		var events = [];
		$('#mediaPane').one('click', function()
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
		//console.log(' videos[index]' ,vids );
		newVideo.src = "videos/" + vids.files[i];
		newVideo.id = id + "_" + i;
		newVideo.className = 'rewardVid';
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
	$('#mainContainer').append(newImage);
	$('#' + id).hide();
	return newImage;
}
function randomize(item)
{
	var offset =0;
	if(item.id === 'rightImage')
	{
		offset = sideWidth;
	}
	//console.log('right', item);
	$(item).css({left: Math.floor(Math.random() * (sideWidth - imageWidth)) + offset , top:Math.floor(Math.random() * (sideHeight - imageHeight))});
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