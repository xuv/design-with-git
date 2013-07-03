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

// Get github

var files = [];

var timelineData = [];
var timeline;


// Options for the timeline
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


// fetch svg files
var getSVGFiles = function( content ) {
	if (( content.type === "file" ) && ( content.name.substring(content.name.lastIndexOf(".")) === '.svg' )) {
		$("#filesList").append("<input type=\"button\" value=\"Get File\" " + "onclick=\"getFile('" + content.name +  "')\" /> " + content.name + "<br>");
		files.push(content);
		/*
		} else {
			
			for(i = 0; i < files.length; i++){
				// console.log
				if (svgFile.name != files[i].name){
					files.push(svgFile);
					$("#filesList").append("<input type=\"button\" value=\"Get File\" " + "onclick=\"getFile('" + svgFile.name +  "')\" /> " + svgFile.name + "<br>");
				}
			}
		
		}*/
	} else if ( content.type === "dir" ) {
		console.log(content.name);
		content.fetchContents(function (err,response) {
			if(err) { throw "outch dir..." }
			response.eachContent(function (dirContent) {
				getSVGFiles( dirContent );
			});
		})
	}

}

// fetch repository
var getRep = function(){
	var ghUser = new Gh3.User($("#userName")[0].value );
	var ghRepository = new Gh3.Repository($("#repositoryName")[0].value, ghUser);
	$("#filesList").empty();
	files = [];
	ghRepository.fetch(function (err, res) {
		ghRepository.fetchBranches(function (err, res) {
	  		res.eachBranch( function(branch){
	  			// console.dir(branch);
	  			branch.fetchContents(function (err, res) {
					if(err) { throw "outch ..." }
					res.eachContent(function (content) {
						getSVGFiles( content );
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
        			// add element to the timeline
        			timeline.addItem({
        				'start': new Date(commit.date),
        				'content': tmp,
        				'group': commit.author.name,
						'className' : 'thumb'
        			});
        			// store data un a variable
					timelineData.push({
					  'start': new Date(commit.date),
					  'content': svg,
					  'group': commit.author.name,
					  'className' : 'thumb'
					});
        		});
				// console.log(data.commit.author.name, data.commit.message, data.commit.author.date, data.files[0].raw_url );
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

// *** Pixel Diff ***
// First, renders each SGV into its own Canvas, then does a pixel diff between both

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

// *** Rescale SVG ***
// according to container size

var svgScale = function( el ) {
	var jqo = $(el);
	var s = $(jqo.children('svg')[0]);
	var svgWidth = s.attr('width');
	var svgHeight = s.attr('height');

	var svgSize = Math.max(svgWidth, svgHeight);
	// console.log('svgSize: ' +svgSize);

	var containerWidth = jqo.width();
	var containerHeight = jqo.height();

	var containerSize = Math.min(containerWidth, containerHeight);
	// console.log('containerSize: ' + containerSize);

	var scale = containerSize / svgSize;
	var translation = (scale -1) * svgSize/2;
	
	/* Careful here. The order of transformations is important */
	if ( (jqo.css('position') === 'absolute') && (navigator.userAgent.indexOf("WebKit") >= 0) ) {
		/* don't know why but works. Maybe position absolute changes this */
		s.css('transform', 'scale(' + scale + ')');
	} else {
		s.css('transform', 'translate(' + translation + 'px,' + translation + 'px) scale(' + scale + ')');
	}
}

// *** Compare two SVG trees ***

var svgDiff = {};

jsondiffpatch.config.objectHash = function(obj) {
	return obj._id || obj.id || obj.name || JSON.stringify(obj);
};

var loadAndCompareSVG = function(){

	var jsonBefore, jsonAfter;
	var svg1 = $('#side-by-side .before').html();
	var svg2 = $('#side-by-side .after').html();
	
	jsonBefore = $.xmlToJSON(svg1);
	jsonAfter = $.xmlToJSON(svg2);

	svgDiff = jsondiffpatch.diff(jsonBefore, jsonAfter);
	if (svgDiff != undefined) {
		$('#svg-diff .json').empty().append(jsondiffpatch.html.diffToHtml(jsonBefore, jsonAfter, svgDiff));
	} else {
		$('#svg-diff .json').empty().append("There is <strong>no difference</strong> between these two SVG trees. You silly :)");
	}

	$('#svg-before').hide();
	hideDiff('#svg-before');
	$('#svg-after').hide();
	hideDiff('#svg-after');
	
	$('.jsondiffpatch-deleted, jsondiffpatch-modified-original').mouseenter(function(){
		var id1 = []; // empty jQuery object
		$(this).find('span.jsondiffpatch-property-name').each(function(){
			if ($(this).text() === '@id') {
				var id = $(this).parent().children('p').text();
				id = id.slice(1, id.lastIndexOf('"')); // clean up the id from the quotes
				id1.push(id);
			}
		});
		if( id1 != []){
			id1.forEach(function(elID){
				console.log(elID);
				showDiff('#svg-before', '#' + elID);
			});
		};
		$('#svg-before').show();
	}).mouseleave(function(){
		$('#svg-before').hide();
		hideDiff('#svg-before');
	});
	
	$('.jsondiffpatch-added, .jsondiffpatch-modified-new').mouseenter(function(){
		var id2 = []; // empty jQuery object
		$(this).find('span.jsondiffpatch-property-name').each(function(){
			if ($(this).text() === '@id') {
				var id = $(this).parent().children('p').text();
				id = id.slice(1, id.lastIndexOf('"')); // clean up the id from the quotes
				id2.push(id);
			}
		});
		if( id2 != []){
			id2.forEach(function(elID){
				console.log(elID);
				showDiff('#svg-after', '#' + elID);
			});
		};
		$('#svg-after').show();
	}).mouseleave(function(){
		$('#svg-after').hide();
		hideDiff('#svg-after');
	});
}

// *** Diff roll over visibility ***

var showDiff = function( id, elID ){
	var svgEl = $(id).find(elID);
	svgEl.css('visibility', 'visible');
	svgEl.find('*').css('visibility', 'visible');
};

var hideDiff = function( id ){
	$( id ).find('path').css('visibility', 'hidden');
};




// *** INIT ALL ***

$(function(){

	// Sliders
	$('#before-after input').slider({
		min : 0,
		max : 300,
		step : 1,
		value : 150,
		tooltip : 'hide'
	}).on('slide', function(ev){
    	$('#before-after #mask').css('width', $(this).slider().data('slider').getValue());
    });

	$('#opacity input').slider({
		min : 0,
		max : 1,
		step : 0.01,
		value : 0.5,
		tooltip : 'hide'
	}).on('slide', function(ev){
    	$('#opacity .after').css('opacity', $(this).slider().data('slider').getValue());
    });

	// place empty svg
	$('div.before, div.after').each(function(){
		$(this).empty().append($(emptySVG));
		svgScale(this);
	});

	$( "#toggle" ).mouseenter(function(){
		$('#toggle .after').css('display', 'none');
	}).mouseleave(function(){
		$('#toggle .after').css('display', 'inline');
	});

	
	pixelDiff();
	pippinDiff();
	

	/* Init Timeline */
	timeline = new links.Timeline(document.getElementById('commit-timeline'));
	timeline.draw(timelineData, options);

	// $( '#commit-timeline' ).tooltip();

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
			// console.log("replaced");
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

	// SVG diff 
	loadAndCompareSVG();

	// Fill the About modal
	var converter = new Markdown.Converter();
    $.ajax({
    	url: "README.md"
    }).done(function(data){
    	console.log(data);
    	$('#about .modal-body').empty().html(converter.makeHtml(data));
    });
	
});