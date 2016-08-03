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
	var warmUpPhase = [
	{	type: 'text',  media: introText, clicks: 1},
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
	var choicePhase = [{type:'choice', media: [{
		type: 'click',
		media: leftMedia,
		clicks: 1
	},{
		type: 'click',
		media: rightMedia,
		clicks: 1
	}], timeoutMinutes: 9, backgroundColour: GREY }];

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


		var timeline = postDeval;
		var results = buildInitialRes(left, right);
		timeBegin = Date.now();

	//begin trial
	runTrial(timeline, 0, results);

}
function runTrial(timeline, i, results)
{
	console.log("results:", JSON.stringify(results,  null, '\t'));
	if(i >= timeline.length)
		return results;
	var trial = timeline[i];
	if(trial.backgroundColour)
	{
		$('#mainContainer').css("background-color", trial.backgroundColour);
	}
	var trialData = {trialIndex: i, type: timeline[i].type, timeStart: Date.now() - timeBegin, event: []};
	console.log("current trial:", trial)
	if(trial.type === 'post')
	{
		post(trial, trialData, results, function(results){
			//scrub(trial);
			console.log('results:', results);
			return runTrial(timeline, ++i, results);
		});
	}
	if(trial.type === 'choice')
	{
		choice(trial, trialData, results, function(){
			scrub(trial);
			return runTrial(timeline, ++i, results);
		});
	}
	if(trial.type === 'click')
	{
		click(trial.media.image, trial.clicks, trialData, results, function(){
			return runTrial(timeline, ++i, results);
		});
	}
	if(trial.type === 'reward')
	{
		reward(trial.media.videos, trialData, results, function(){
			return runTrial(timeline, ++i, results);
		});
	}
	if(trial.type === 'text')
	{
		text(trial.media, trialData, i, results, function(){
			return runTrial(timeline, ++i, results);
		});
	}
	if(trial.type === 'pause')
	{
		setTimeout(function() {runTrial(timeline, ++i, results);}, 1000 * trial.timeoutSeconds);
	}

}
function post(trial, trialData, results, callback)
{
	//console.log('trialdata:', trialData);
	var updatedRes = results;
	setTimeout(function() {callback(updatedRes)}, 100 * 60 * trial.timeoutMinutes);
	click(trial.media[0].image, 1, trialData, results, function(){
	})
}

//this removes all event handlers and turns everything off
function scrub(trial)
{
	for(var x = 0; x < trial.media.length; x++)
	{
		$(trial.media[x].media.image).off();
		$(trial.media[x].media.image).hide();
		$(trial.media[x].media.videos).off();
		$(trial.media[x].media.videos).hide();
		$('#mediaPane').hide();
	}
}
function choice(trial, trialData, results, callback)
{
	//console.log('trialdata:', trialData);
	setTimeout(function() {callback()}, 100 * 60 * trial.timeoutMinutes);
	click(trial.media[0].media.image, trial.media[0].clicks, trialData, results, function(){
		$(trial.media[1].media.image).hide();
		reward(trial.media[0].media.videos, trialData, results, function(){
			choice(trial, trialData, results, callback);
		});
	});
	click(trial.media[1].media.image, trial.media[1].clicks, trialData, results, function(){
		$(trial.media[0].media.image).hide();
		reward(trial.media[1].media.videos, trialData, results, function(){
			choice(trial, trialData, results, callback);
		});
	});
}
function click(media, maxClicks, trialData, results, callback)
{
	$(media).show();
	randomize(media);
	var clicks = maxClicks - Math.floor(maxClicks * Math.random());
	if(DEBUG)
		console.log('clicks:', clicks, ' from maxClicks:', maxClicks);
	$(media).on('click', function(event)
	{
		if(DEBUG)
			console.log('BUTTERFLY clicked');
		trialData.event.push({action :'click', time : Date.now() - timeBegin, clickNumber: clicks + 1});
		if(++clicks >= maxClicks)
		{	
			$(media).hide();
			$( this ).off( event );
			results.trials.push(trialData);
			callback();
		}
	});
}
function reward(videos, trialData, results, callback)
{
	if(DEBUG && false)
		console.log('REWARD registered for trial');
	$('#mediaPane').show();
	var video = videos;
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
			trialData.event.push({action :'videoComplete', time : Date.now() - timeBegin});
			$(video).hide();
			$('#mediaPane').hide();
			results.trials.push(trialData);
			callback();
		});
	}

	
	function text(text, trialData, index, results, callback)
	{
		if(DEBUG && false)
			console.log('INFORMATION BEING PRESENTED for trial');
		$('#mediaPane').show();
		$('#mediaPane').append('<div class="instruct" id="text_' + index + '">' + text + '</div>');
		$('#mediaPane').one('click', function()
		{
			trialData.event.push({action :'click', time : Date.now() - timeBegin});
			$('#text_' + index).hide();
			$('#mediaPane').hide();
			results.trials.push(trialData);
			callback();
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