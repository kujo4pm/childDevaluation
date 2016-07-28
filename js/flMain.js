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
	console.log(left);
	console.log(right);
	
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
	var leftCount = 0 , rightCount = 0;

	// below is the experiment separated into trials
	var warmUp = [
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
	},];


	var timeline = warmUp;
	runTrial(timeline, 0);

}
function runTrial(timeline, i)
{
	
	var trial = timeline[i];
	console.log("current trial:", trial)
	if(trial.type === 'click')
	{
		$(trial.media.image).show();
		randomize(trial.media.image);
		var clicks = 0;
		$(trial.media.image).click(function()
		{
			if(++clicks >= trial.clicks)
			{	
				$(trial.media.image).hide();
				runTrial(timeline, ++i);
			}
		});
	}
	if(trial.type === 'reward')
	{
		$(trial.media.videos[0]).show();
		$(trial.media.videos[0]).get(0).play();
		console.log(trial.media.videos[0]);
		$(trial.media.videos[0]).on('ended',function(){
				console.log('videoOver');
			$(trial.media.videos[0]).hide();
			runTrial(timeline, ++i);
		});
	}
}
function buildVids(vids, id)
{
	var newVids = [];
	for(var i =0 ; i < vids.files.length; i++)
	{
		var newVideo = document.createElement('video');
		//console.log(' videos[index]' ,vids );
		newVideo.src = "videos/" + vids.files[i];
		newVideo.id = id + "_" + i;
		$('#mainContainer').append(newVideo);
		$('#' + newVideo.id).hide();
		newVids.push(newVideo);
	}
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
	console.log('right', item);
	$(item).css({left: Math.floor(Math.random() * (sideWidth - imageWidth)) + offset , top:Math.floor(Math.random() * (sideHeight - imageHeight))});
}
