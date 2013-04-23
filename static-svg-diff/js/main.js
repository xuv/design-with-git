/* Global Variable */
// JSON data convert from SVG files 

/* Pixel Diff 
 * First, renders each SGV into its own Canvas, then does a pixel diff between both
 */

var pixelDiff = function() {
	canvg('under', $('#blend-diff .before').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });
	canvg('over', $('#blend-diff .after').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });

	var over = document.getElementById('over').getContext('2d');
	var under = document.getElementById('under').getContext('2d');

	under.blendOnto(over,'difference');

	$('#blend-diff #over').show();
}

var pippinDiff = function() {
	canvg('pippinUnder', $('#blend-diff .before').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });
	canvg('pippinOver', $('#blend-diff .after').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });

	var pippinOver = document.getElementById('pippinOver').getContext('2d');
	var pippinUnder = document.getElementById('pippinUnder').getContext('2d');

	pippinUnder.blendOnto(pippinOver,'difference-pippin');
}


/* Load an XML (SVG) file and convert it to JSON */
/*
var loadAndConvertXML = function( url ) { 
	var jsonData;
	$.ajax({
	    url: url,
	    dataType:"xml"
	}).done(function(xmlData){
	    jsonData = $.xmlToJSON(xmlData);
	    console.log(url);
	    console.dir(jsonData);
	    return jsonData;
	});
}

var initJSONSVGs = function() {
	var urlSVGbefore = $('#blend-diff .before').attr('src');
	var urlSVGafter = $('#blend-diff .after').attr('src'); 
	jsonBefore = loadAndConvertXML(urlSVGbefore);
	jsonAfter = loadAndConvertXML(urlSVGafter);
}
*/

var svgDiff = {};

var loadAndCompareSVG = function(){
	var jsonBefore, jsonAfter;
	var url2svg1 = $('#blend-diff .before').attr('src');
	var url2svg2 = $('#blend-diff .after').attr('src');

	$.when(
		$.ajax({
		    url: url2svg1,
		    dataType:"xml"
		}).done(function(xmlData){
		    jsonBefore = $.xmlToJSON(xmlData);
		    // console.dir(jsonBefore);
		}),
		$.ajax({
		    url: url2svg2,
		    dataType:"xml"
		}).done(function(xmlData){
		    jsonAfter = $.xmlToJSON(xmlData);
		    // console.dir(jsonAfter);
		})
	).done(function(){
		/* Node Diff
		 * Convert each SVG to a JSON object and compare them
		 */
		svgDiff = jsondiffpatch.diff(jsonBefore, jsonAfter);
		console.log("SVG DIFF");
		// console.dir(svgDiff);
		//console.log(JSON.stringify(svgDiff));
		if (svgDiff != undefined) {
			$('#svg-diff .json').empty().append(jsondiffpatch.html.diffToHtml(jsonBefore, jsonAfter, svgDiff));
		} else {
			$('#svg-diff .json').empty().append("No difference.");
		}
	});
}

$(function(){
	// UI: create tabs
	$( "#tabs" ).tabs();

	/*
	$( "#svg-diff-tab" ).click( function() {
		console.log("clicked");
		loadAndCompareSVG();
	});
	*/

	/* init before-after slider */
	$( "#before-after .slider" ).slider({
		min : 0,
		max : 300,
		value : 150,  
		slide: function( event, ui ) {
			$('#before-after #mask').css('width', ui.value);
		}
	});

	/* init opacity slider */
	$( "#opacity .slider" ).slider({
		min : 0,
		max : 100,
		value : 50,  
		slide: function( event, ui ) {
			$('#opacity .after').css('opacity', ui.value/100);
		}
	});


	$( "#toggle" ).mouseenter(function(){
		$('#toggle .after').css('visibility', 'hidden');
	}).mouseleave(function(){
		$('#toggle .after').css('visibility', 'visible');
	});

	pixelDiff();
	pippinDiff();

	/*
	var c = document.getElementById('under');
	var ctx = c.getContext('2d');
	ctx.drawSvg($('#blend-diff .before').attr('src'), 0, 0, 300, 150);
	*/

	/* Simulate git commit log for svg file to be rendered in Timeline */
	var data = [];
	/*
	data.push({
	  'start': new Date(2013, 3, 15),
	  'end': new Date(2013, 3, 27),  // end is optional
	  'content': 'Design with Git',
	  'group': 'master'
	  // Optional: a field 'className'
	  // Optional: a field 'editable'
	});
	*/

	data.push({
	  'start': new Date(2013, 3, 16),
	  //'end': new Date(2013, 3, 16),  // end is optional
	  'content': '<img src="img/a.svg" title="first commit" />',
	  'group': 'master',
	  'className' : 'thumb'
	});


	data.push({
	  'start': new Date(2013, 3, 17),
	  // 'end': new Date(2013, 3, 27),  // end is optional
	  'content': '<img src="img/b.svg" title="second commit" />',
	  'group': 'master',
	  'className' : 'thumb'
	});

	data.push({
	  'start': new Date(2013, 3, 18, 12, 20),
	  // 'end': new Date(2013, 3, 27),  // end is optional
	  'content': '<img src="img/c.svg" title="branch and commit" />',
	  'group': 'julien',
	  'className' : 'thumb'
	});

	/* Options for the Timeline */
	var options = {
		width:  "100%",
		height: "auto",
		layout: "box",
		style: "dot",
		selectable: "true",
		eventMargin: 0,  // minimal margin between events
		eventMarginAxis: 0, // minimal margin beteen events and the axis
		groupsOnRight: false
	};

	/* Init Timeline */
	var timeline = new links.Timeline(document.getElementById('commit-timeline'));
	timeline.draw(data, options);

	$( '#commit-timeline' ).tooltip();

	/* Return the index of the selected element in the timeline */
	function getSelectedRow() {
        var row = undefined;
        var sel = timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    }

    /* Selection of an element in the timeline */
    var target = ".before"
	var onSelect = function (event) {
		var i = getSelectedRow();
		// xml to JSON
		var json =  $.xmlToJSON(data[i].content);
		var svguri = json.img['@src'];
    	$(target).each(function(){
    		$(this).attr('src', svguri);
    	});

    	if (target === '.before') {
    		$('.th-before').removeClass('th-before');
    		$('.timeline-event-selected').addClass('th-before');
    		target = '.after';
    	} else {
    		$('.th-after').removeClass('th-after');
    		$('.timeline-event-selected').addClass('th-after');
    		target = '.before';
    	}

    	pixelDiff();
    	pippinDiff();
    	loadAndCompareSVG();

    }

	links.events.addListener(timeline, "select", onSelect);

	/* SVG diff */
	loadAndCompareSVG();
})