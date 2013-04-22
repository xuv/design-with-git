$(function(){
	// create SVG place holders
	// $('img[data-ph]').tsPlaceHold();
	// UI: create tabs
	$( "#tabs" ).tabs();

	$( "#before-after .slider" ).slider({
		min : 0,
		max : 300,
		value : 150,  
		slide: function( event, ui ) {
			$('#before-after #mask').css('width', ui.value);
		}
	});

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

	var pixelDiff = function() {
		canvg('under', $('#blend-diff .before').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });
		canvg('over', $('#blend-diff .after').attr('src'), { ignoreMouse: true, ignoreAnimation: true, scaleWidth: 300, scaleHeight: 300 });

		var over = document.getElementById('over').getContext('2d');
		var under = document.getElementById('under').getContext('2d');

		over.blendOnto(under,'difference');
	}

	pixelDiff();

	/*
	var c = document.getElementById('under');
	var ctx = c.getContext('2d');
	ctx.drawSvg($('#blend-diff .before').attr('src'), 0, 0, 300, 150);
	*/

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

	var timeline = new links.Timeline(document.getElementById('commit-timeline'));
	timeline.draw(data, options);

	$( '#commit-timeline' ).tooltip();

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
		var json = mapDOM(data[i].content, false)
		var svguri = json.attributes.src;
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
    }

	links.events.addListener(timeline, "select", onSelect);

})