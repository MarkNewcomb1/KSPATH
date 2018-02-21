<?php
include 'header.php';	
?>


<!-- Slider starts -->
	<script>
		jQuery(document).ready(function($) {
			$('.slider').unslider({
				autoplay: true,
				arrows: false,
				delay: 7000
			});
		});
	</script>
    <div class="slider">
	   <ul> 
           	<li>
           		<div class="text-inside-slider"><h2>Quality Commitment</h2>
                <p>We believe in the efficiency of quality. High quality results cost a little more to produce, but pay larger benefits in patient care. Our commitment to quality control and quality assurance has three components that overlap to assure accurate testing results.</p></div>
                <img src="img/slider1.jpg">
            </li>
			<li><div class="text-inside-slider"><h2>Client Service</h2>
                <p>Our representatives will assure that your questions or concerns are promptly and courteously handled or channeled to the appropriate technical or professional personnel.</p></div>
                <img src="img/slider2.jpg">                
            </li>
			<li><div class="text-inside-slider"><h2>Testing Capabilities</h2>
                <p>Multi-speciality, Chemistry, Hematology, and Serology profiles, in addition to single tests, Endocrinology, and Therapeutic Drug Assay, services are available. </p></div>
                <img src="img/slider3.jpg">                
            </li>
			<li><div class="text-inside-slider"><h2>Quality Control</h2>
                <p>This includes both external CAP proficiency surveys and also an internal quality control program. Coefficients of variation, standard deviations, standards and control monitors are analyzed to assure that the results are reliable.</p></div>
                <img src="img/slider2.jpg">                  
            </li>
            <li><div class="text-inside-slider"><h2>We review statistical data</h2>
                <p>to verify that both our own internal and national external standards are met or exceeded.</p>
                <p>We voluntarily subscribe to the College of American Pathologists inter-laboratory comparison and external proficiency program.</p>
                <p>All testing personnel in our laboratory participate in the proficiency program.</p></div>
                <img src="img/slider1.jpg">                
            </li>
	   </ul> <!-- necessary wrapper for unslider -->
    </div> <!-- slider div -->

<!-- Slider Ends -->

<div class="home-banner">
	Quality Commitment
</div> <!-- home banner -->

<div class="container" id="maincontent">
<h3>What We Do</h3>
<img src="img/Microscope.gif">
                <h6>Stat Testing</h6>
                <p>Available on request for most tests. Please Client Service for detailed information on submission, delivery, and reporting.</p> 

                <h6>Call back Testing</h6>
                <p>Available on request. Specimens will be collected and processed as ROUTINE; however results will be called upon completion.</p> 
 
                <h6>Routine Testing</h6>
                <p>will be collected and the test performed within 2 to 24 hours of receipt at KPS, unless otherwise at a predetermined time.</p> 
    
                <h6>Test Reporting</h6>
        <p>Written/electronic results are sent the quickest way possible, usually by Fax. On request, a report will be telephoned, then written.</p>  
</div> <!-- container -->
<?php
include 'footer.php';
?>