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

var sideWidth = $('#mainContainer').width() / 2; 
var sideHeight = $('#mainContainer').height();
var imageWidth = 172;
var imageHeight = 109; 
var images = ['green_butterfly.gif', 'red_butterfly.gif'];
var sides = ['left', 'right'];
var videos = [ {
	name: 'frozen',
	files: ['fr_vid1.mp4', 'fr_vid2.mp4', 'fr_vid3.mp4']
},
{
	name: 'nemo',
	files: ['nm_vid1.mp4', 'nm_vid2.mp4', 'nm_vid3.mp4']
}];


var DEBUG =false;

var GREY = '#c2c2a3';
var BLUE = '#99ccff';


var timeBegin;

if(!DEBUG)
{
	$(".debug").hide();
}
