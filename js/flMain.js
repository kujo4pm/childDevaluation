var timeBegin;


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
	var warmUp = [
	{
		type: 'text',
		media: introText,
		clicks: 1
	},
	{
		type: 'click',
		media: leftMedia,
		clicks: 6
	},
	{
		type: 'reward',
		media: leftMedia,
		clicks: 1
	},
	{
		type: 'click',
		media: leftMedia,
		clicks: 1
	},
	{
		type: 'reward',
		media: leftMedia,
		clicks: 1
	},
	{
		type: 'click',
		media: rightMedia,
		clicks: 1
	},
	{
		type: 'reward',
		media: rightMedia,
		clicks: 1
	},
	{
		type: 'click',
		media: rightMedia,
		clicks: 1
	},
	{
		type: 'reward',
		media: rightMedia,
		clicks: 1
	},
	{
		type: 'text',
		media: endText,
		clicks: 1
	}];
	var choice = [{type:'choice', media: [{
		type: 'click',
		media: leftMedia,
		clicks: 5
	},{
		type: 'click',
		media: rightMedia,
		clicks: 5
	}], timeoutMinutes: 1 }];
	var timeline = warmUp;
	var results = buildInitialRes(left, right);
	timeBegin = Date.now();
	console.log(runTrial(timeline, 0, results));

}
function runTrial(timeline, i, results)
{
	console.log("results:", JSON.stringify(results,  null, '\t'));
	if(i >= timeline.length)
		return results;
	var trial = timeline[i];
	var trialData = {trialIndex: i, type: timeline[i].type, timeStart: Date.now() - timeBegin, event: []};
	console.log("current trial:", trial)
	if(trial.type === 'choice')
	{
		choice(timeline, trialData, i, results, function(){
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

}
function choice(timeline, trialData, i, results)
{
	click(timeline, trialData, i, results);
}
function click(media, maxClicks, trialData, results, callback)
{
	$(media).show();
	randomize(media);
	var clicks = 0;
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
	$(videos[0]).show();
	$(videos[0]).get(0).play();
		//console.log(trial.media.videos[0]);
		$(videos[0]).one('ended',function(){
			trialData.event.push({action :'videoComplete', time : Date.now() - timeBegin});
			$(videos[0]).hide();
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