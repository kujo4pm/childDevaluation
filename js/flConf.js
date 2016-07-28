/*
** This is the file to configure the functional learning 
** experiment for the Psychology department at the 
** University of Sydney
*/

/*
** In the beginning we need to set up for each subject
** whether they will have left | right for the green
** red butterflies repsectively, and which set of videos
** will be associated with which butterfly image
*/

var sideWidth = 400; 
var sideHeight = 400;
var imageWidth = 172;
var imageHeight = 109; 
var images = ['green_butterfly.jpg', 'red_butterfly.jpg'];
var sides = ['left', 'right'];
var videos = [ {
	name: 'frozen',
	files: ['fr_vid1.mp4', 'fr_vid2.mp4', 'fr_vid3.mp4']
},
{
	name: 'nemo',
	files: ['nm_vid1.mp4', 'nm_vid2.mp4', 'nm_vid3.mp4']
}];
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
	console.log("left:", left);
	console.log("right:", right);

	var leftImage = '<img src="img/' + images[left.imageIndex] + '" id="leftImg" class="leftImage" onload="randomLeft(this);"/>';

	var rightImage = '<img src="img/' + images[right.imageIndex] + '" id="rightImg" class="rightImage" onload="randomRight(this);"/>';
	var leftVideo = {
		type: 'single-stim',
		stimulus: '<video autoplay class="block-center"><source src="../videos/fr_vid1.mp4" type="video/mp4"></video>',
		is_html: true
	}
	var leftPair ={
		timeline:[
		{stimulus: leftImage},
		{stimulus: leftVideo}
		]};
		var warmUpTrials = {
			type:'html',
			timeline:[
			{stimulus: leftImage, cont_btn: "rightImg"},
			{stimulus: leftVideo},
			{stimulus:leftImage, cont_btn: "leftImg"}, 
			{stimulus:rightImage}, 
			{stimulus:rightImage}
			],
			response_ends_trial:false,
			is_html: true
		};
		var welcome = {
			type: 'text',
			text: 'Welcome text for the experiment!'
		};
		var done = {
			type: 'text',
			text: 'All done'
		};
		var timeline = [];
		timeline.push(welcome);
		timeline.push(warmUpTrials);
		timeline.push(done);
		jsPsych.init({
			timeline: timeline
		})

	}

	function randomLeft(item)
	{
		console.log('left', item);
		$(item).css({left:Math.floor(Math.random() * sideWidth), top: Math.floor(Math.random() * (sideHeight - imageHeight))});
	}
	function randomRight(item)
	{
		console.log('right', item);
		$(item).css({left:Math.floor(Math.random() * sideWidth) + sideWidth , top:Math.floor(Math.random() * (sideHeight - imageHeight))});
	}