$(document).ready(function(){
if ($(window).width() < 1025) {
	$('header nav').hide();
	$('.mobile_menu_button').on('click', function(){
		console.log("CLICK");
		if ( $('header nav').is(':hidden')) {
			$('header nav').slideDown(200);
		} else {
			$('header nav').slideUp(200);
		}
	}); //on click
} // end if	
});