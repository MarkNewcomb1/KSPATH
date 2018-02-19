$(document).ready(function(){
	console.log("Hi there.");
	$('nav').hide();
	$('.mobile_menu_button').on('click', function(){
		console.log("CLICK");
		if ( $('nav').is(':hidden')) {
			$('nav').slideDown(200);
		} else {
			$('nav').slideUp(200);
		}
	}); //on click
});