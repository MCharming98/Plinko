/**
 * Contains the controls logistics present above the plinko board
 *
 * @author Chen Meng
 */

// html elements for controls
var binCountInput = document.getElementById("binCountInput");
var probInput = document.getElementById("probInput");
var speedInput = document.getElementById("speedInput");
var controlBtn = document.getElementById("controlBtn");
var clearBtn = document.getElementById("clearBtn");

/**
 * Value change event listener for bin count input
 */
binCountInput.addEventListener('change', function() {
	let count = binCountInput.value;
	// bin count range = [2, 20], bin count can go above 20 but the board UI has to be adjusted 
	if(count == null || count < 2) { 
		count = 2;
		binCountInput.value = count;
	}
	else if(count > 20) {
		count = 20;
		binCountInput.value = count;
	}
	//Notify sketch that bin count has changed
	window.binCount = count;
	window.binCountChanged = true;
});

/**
 * Value change event listener for probability input
 */
probInput.addEventListener('change', function() {
	let p = probInput.value;
	// Probability range = [0,1]
	if(p == null || p < 0) {
		p = 0;
		probInput.value = p;
	}
	else if(p > 1){
		p = 1
		probInput.value = p;
	}
	//Notify sketch that probability has changed
	window.probability = p;
});

/**
 * Value change event listener for speed input
 */
speedInput.addEventListener('change', function() {
	let s = speedInput.value;
	// Speed range = [1,5]
	if(s == null || s < 1) {
		s = 1;
		speedInput.value = s;
	}
	else if(s > 5){
		s = 5
		speedInput.value = s;
	}
	//Notify sketch that speed has changed
	window.speed = s;
});

/**
 * Mouse click event listener for controls
 */
controlBtn.addEventListener('click', function() { 
	let controlValue = controlBtn.innerHTML;
	if(controlValue == "Start"){
		controlValue = "Stop";
		binCountInput.disabled = true;
		clearBtn.disabled = true;
		window.dropBall = true; //Notify sketch to start dropping balls
	}
	else{ // control value == "Stop"
		controlValue = "Start";
		window.dropBall = false; //Notify sketch to stop dropping balls
	}
	controlBtn.innerHTML = controlValue;
});

/**
 * Mouse click event listener for clear
 */
clearBtn.addEventListener('click', function() {
	//Notify sketch to clear the statistics
	window.clear = true;
});


/**
 * A function called by sketch to enable the control buttons
 */
function enableControls(){
	clearBtn.disabled = false;
	binCountInput.disabled = false;
}