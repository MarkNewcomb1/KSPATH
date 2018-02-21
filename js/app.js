$(document).ready(function(){
	console.log("Hi there.");
	$('header nav').hide();
	$('.mobile_menu_button').on('click', function(){
		console.log("CLICK");
		if ( $('header nav').is(':hidden')) {
			$('header nav').slideDown(200);
		} else {
			$('header nav').slideUp(200);
		}
	}); //on click
});