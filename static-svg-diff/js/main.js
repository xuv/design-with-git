// JSON data convert from SVG files 

var emptySVG = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
<!-- Created with Inkscape (http://www.inkscape.org/) -->\
<svg\
   xmlns:dc="http://purl.org/dc/elements/1.1/"\
   xmlns:cc="http://creativecommons.org/ns#"\
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
   xmlns:svg="http://www.w3.org/2000/svg"\
   xmlns="http://www.w3.org/2000/svg"\
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\
   width="200"\
   height="200"\
   id="svg2"\
   version="1.1"\
   inkscape:version="0.48.3.1 r9886"\
   sodipodi:docname="Nouveau document 1">\
  <defs\
     id="defs4" />\
  <sodipodi:namedview\
     id="base"\
     pagecolor="#ffffff"\
     bordercolor="#666666"\
     borderopacity="1.0"\
     inkscape:pageopacity="0.0"\
     inkscape:pageshadow="2"\
     inkscape:zoom="3.115"\
     inkscape:cx="61.476726"\
     inkscape:cy="100"\
     inkscape:document-units="px"\
     inkscape:current-layer="layer1"\
     showgrid="false"\
     inkscape:window-width="1280"\
     inkscape:window-height="776"\
     inkscape:window-x="0"\
     inkscape:window-y="24"\
     inkscape:window-maximized="1" />\
  <metadata\
     id="metadata7">\
    <rdf:RDF>\
      <cc:Work\
         rdf:about="">\
        <dc:format>image/svg+xml</dc:format>\
        <dc:type\
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\
        <dc:title></dc:title>\
      </cc:Work>\
    </rdf:RDF>\
  </metadata>\
  <g\
     inkscape:label="Calque 1"\
     inkscape:groupmode="layer"\
     id="layer1"\
     transform="translate(0,-852.36218)">\
    <path\
       style="fill:none;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
       d="M 0,0 200,200"\
       id="path2985"\
       inkscape:connector-curvature="0"\
       transform="translate(0,852.36218)"\
       sodipodi:nodetypes="cc" />\
    <path\
       style="fill:none;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
       d="M 0,1052.3622 200,852.36218"\
       id="path2985-4"\
       inkscape:connector-curvature="0"\
       sodipodi:nodetypes="cc" />\
  </g>\
</svg>\
';

/* Get Github */

var files = [];

var timelineData = [];
var timeline;


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


var getRep = function(){
	var ghUser = new Gh3.User($("#userName")[0].value );
	var ghRepository = new Gh3.Repository($("#repositoryName")[0].value, ghUser);
	var filesList = $("#filesList");
	filesList.empty();
	ghRepository.fetch(function (err, res) {
		ghRepository.fetchBranches(function (err, res) {
	  		res.eachBranch( function(branch){
	  			// console.dir(branch);
	  			branch.fetchContents(function (err, res) {
					if(err) { throw "outch ..." }
					res.eachContent(function (content) {
						if (( content.type === "file" ) &&
						( content.name.substring(content.name.lastIndexOf(".")) === '.svg' )) {
							var svgFile = content;
							// console.log(files.length);
							if (files.length === 0 ) {
								files.push(svgFile);
								filesList.append("<input type=\"button\" value=\"Get File\" " + "onclick=\"getFile('" + svgFile.name +  "')\" /> " + svgFile.name + "<br>");
							} else {
								for(i = 0; i < files.length; i++){
									// console.log
									if (svgFile.name != files[i].name){
										files.push(svgFile);
										filesList.append("<input type=\"button\" value=\"Get File\" " + "onclick=\"getFile('" + svgFile.name +  "')\" /> " + svgFile.name + "<br>");
									}
								}
							}
						}
					});
				});
			});
		});
	});
};

var getFileCommitHistoryData = function( svgFile ) {

	timelineData = [];
	timeline.clearItems();

	svgFile.fetchCommits(function (err, res) {
        if(err) { throw "outch ..." }

        svgFile.eachCommit(function (commit) {
        	// console.dir(commit);


            $.getJSON( commit.url, function(data) {
            	
            	var jqxhr = $.getJSON( data.files[0].contents_url, function(svg_e){
        			var svg = Base64.decode(svg_e.content);
        			//console.dir(svg);

        			var tmp = 	'<div class="svg-thumb" style="width: 40px; height: 40px;">' +
        						// '<span class="commit-message">' +
        						// data.commit.message +
        						// '</span>' +
        						svg + 
        						'</div>';

        			timeline.addItem({
        				'start': new Date(commit.date),
        				'content': tmp,
        				'group': commit.author.name,
						'className' : 'thumb'
        			});

        			
					timelineData.push({
					  'start': new Date(commit.date),
					  'content': svg,
					  'group': commit.author.name,
					  'className' : 'thumb'
					});

					/*
        			rawContent.append(
	            		'<li>' +
	            		data.commit.author.name + ' says:  "' +
	            		data.commit.message +'" at ' +
	            		data.commit.author.date + '<br>' +
	            		svg
	            	);
					*/
        		});
				console.log(data.commit.author.name, data.commit.message, data.commit.author.date, data.files[0].raw_url );
				jqxhr.done(function(){
					console.log('jqxhr-done');
					$('.svg-thumb').each(function(i, el){
						console.log('scaling');
						svgScale(el);
					});
					// Seems the elements have to be visible to be resized as svg in the timeline. 
					// I know, this is not a clear explanation of what's going on...
					// But this is needed. 
					timeline.setVisibleChartRangeAuto();
				});
			});
        });
	});
}


var getFile = function(fileName){
	for (i=0; i < files.length; i++){
		if (files[i].name === fileName ){
			files[i].fetchContent(function (err, res) {
				if(err) { throw "outch ..." }
				getFileCommitHistoryData(files[i]);
			});
			break;
		}
	}
};

/* Pixel Diff 
 * First, renders each SGV into its own Canvas, then does a pixel diff between both
 */


var pixelDiff = function() {
	canvg('under', $('#side-by-side div.before').html(), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });
	canvg('over', $('#side-by-side div.after').html(), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });

	var over = document.getElementById('over').getContext('2d');
	var under = document.getElementById('under').getContext('2d');

	under.blendOnto(over,'difference');

	$('#blend-diff #over').show();
}

var pippinDiff = function() {
	canvg('pippinUnder', $('#side-by-side div.before').html(), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });
	canvg('pippinOver', $('#side-by-side div.after').html(), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });

	var pippinOver = document.getElementById('pippinOver').getContext('2d');
	var pippinUnder = document.getElementById('pippinUnder').getContext('2d');

	pippinUnder.blendOnto(pippinOver,'difference-pippin');
}

/* Rescale SVG giving the container selector with CSS3 transforms 
var svgScale = function( selector ) {
	var svgWidth = $( selector + ' svg').attr('width');
	var svgHeight = $( selector + ' svg').attr('height');s

	var svgSize = Math.max(svgWidth, svgHeight);
	console.log('svgSize: ' +svgSize);

	var containerWidth = $( selector ).width();
	var containerHeight = $( selector ).height();

	var containerSize = Math.min(containerWidth, containerHeight);
	console.log('containerSize: ' + containerSize);

	var scale = containerSize / svgSize;
	var translation = (scale -1) * svgSize/2;

	// Careful here. The order of transformations is important
	if ( ($(selector).css('position') === 'absolute') && (navigator.userAgent.indexOf("WebKit") >= 0) ) {
		// position: absolute; in parent container changes the translation origin in Chrome
		$( selector + ' svg').css('transform', 'scale(' + scale + ')');
	} else {
		$( selector + ' svg').css('transform', 'translate(' + translation + 'px,' + translation + 'px) scale(' + scale + ')');
	}
}
*/

var svgScale = function( el ) {
	var jqo = $(el);
	var s = $(jqo.children('svg')[0]);
	var svgWidth = s.attr('width');
	var svgHeight = s.attr('height');

	var svgSize = Math.max(svgWidth, svgHeight);
	console.log('svgSize: ' +svgSize);

	var containerWidth = jqo.width();
	var containerHeight = jqo.height();

	var containerSize = Math.min(containerWidth, containerHeight);
	console.log('containerSize: ' + containerSize);

	var scale = containerSize / svgSize;
	var translation = (scale -1) * svgSize/2;
	/* Careful here. The order of transformations is important */
	// if (jqo.hasClass('computed') != true) {
		if ( (jqo.css('position') === 'absolute') && (navigator.userAgent.indexOf("WebKit") >= 0) ) {
			/* don't know why but works. Maybe position absolute changes this */
			s.css('transform', 'scale(' + scale + ')');
		} else {
			s.css('transform', 'translate(' + translation + 'px,' + translation + 'px) scale(' + scale + ')');
		}
	// }

	// jqo.addClass('computed');
}

var svgDiff = {};

var loadAndCompareSVG = function(){
	var jsonBefore, jsonAfter;
	var svg1 = $('#side-by-side div.before').html();
	var svg2 = $('#side-by-side div.after').html();
	
	jsonBefore = $.xmlToJSON(svg1);
	jsonAfter = $.xmlToJSON(svg2);

	svgDiff = jsondiffpatch.diff(jsonBefore, jsonAfter);
	if (svgDiff != undefined) {
		$('#svg-diff .json').empty().append(jsondiffpatch.html.diffToHtml(jsonBefore, jsonAfter, svgDiff));
	} else {
		$('#svg-diff .json').empty().append("No difference.");
	}

	/*
	$.when(
		$.ajax({
		    url: url2svg1,
		    dataType:"text"
		}).done(function(xmlData){			
			$('#svg-before').empty().append($(xmlData));
		    jsonBefore = $.xmlToJSON(xmlData);
		    svgScale('#svg-before');
		}),
		$.ajax({
		    url: url2svg2,
		    dataType:"text"
		}).done(function(xmlData){
			$('#svg-after').empty().append($(xmlData));
		    jsonAfter = $.xmlToJSON(xmlData);
		    svgScale('#svg-after');
		})
	).done(function(){
		// Node Diff
		// Convert each SVG to a JSON object and compare them
		
		svgDiff = jsondiffpatch.diff(jsonBefore, jsonAfter);
		if (svgDiff != undefined) {
			$('#svg-diff .json').empty().append(jsondiffpatch.html.diffToHtml(jsonBefore, jsonAfter, svgDiff));
		} else {
			$('#svg-diff .json').empty().append("No difference.");
		}
	});
	*/
}

$(function(){
	// UI: create tabs
	// $( "#tabs" ).tabs();

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

	/* place empty svg */
	$('div.before, div.after').each(function(){
		$(this).empty().append($(emptySVG));
		svgScale(this);
	});

	$( "#toggle" ).mouseenter(function(){
		$('#toggle .after').css('visibility', 'hidden');
	}).mouseleave(function(){
		$('#toggle .after').css('visibility', 'visible');
	});

	pixelDiff();
	pippinDiff();

	/* Init Timeline */
	timeline = new links.Timeline(document.getElementById('commit-timeline'));
	timeline.draw(timelineData, options);

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
    var target = "div.before"
	var onSelect = function (event) {
		var i = getSelectedRow();
		// xml to JSON
		var svg = timelineData[i].content; 
		//var json =  $.xmlToJSON(timelineData[i].content);
		//var svguri = json.img['@src'];
    	$(target).each(function(){
    		$(this).empty().append($(svg));
			svgScale(this);
			console.log("replaced");
    	});

    	if (target === 'div.before') {
    		$('.th-before').removeClass('th-before');
    		$('.timeline-event-selected').addClass('th-before');
    		target = 'div.after';
    	} else {
    		$('.th-after').removeClass('th-after');
    		$('.timeline-event-selected').addClass('th-after');
    		target = 'div.before';
    	}

    	pixelDiff();
    	pippinDiff();
    	loadAndCompareSVG();

    }

	links.events.addListener(timeline, "select", onSelect);

	/* SVG diff */
	loadAndCompareSVG();
})