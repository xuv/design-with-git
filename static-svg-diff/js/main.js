$(function(){
	// create SVG place holders
$('img[data-ph]').tsPlaceHold();
// UI: create tabs
$( "#tabs" ).tabs();

$( "#before-after .slider" ).slider({
	min : 0,
	max : 300,
	value : 150,  
	slide: function( event, ui ) {
		$('#before-after .after').css('width', ui.value);
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
})