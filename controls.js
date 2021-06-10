var binCountInput = document.getElementById("binCountInput");
var probInput = document.getElementById("probInput");
var speedInput = document.getElementById("speedInput");
var controlBtn = document.getElementById("controlBtn");
var clearBtn = document.getElementById("clearBtn");

binCountInput.addEventListener('change', function() {
	let count = binCountInput.value;
	if(count == null || count < 2) { 
		count = 2;
		binCountInput.value = count;
	}
	else if(count > 20) {
		count = 20;
		binCountInput.value = count;
	}
	window.binCount = count;
	window.binCountChanged = true;
});

probInput.addEventListener('change', function() {
	let p = probInput.value;
	if(p == null || p < 0) {
		p = 0;
		probInput.value = p;
	}
	else if(p > 1){
		p = 1
		probInput.value = p;
	}
	window.probability = p;
});

speedInput.addEventListener('change', function() {
	let s = speedInput.value;
	if(s == null || s < 1) {
		s = 1;
		speedInput.value = s;
	}
	else if(s > 5){
		s = 5
		speedInput.value = s;
	}
	window.speed = s;
});

controlBtn.addEventListener('click', function() { 
	let controlValue = controlBtn.innerHTML;
	if(controlValue == "Start"){
		controlValue = "Stop";
		binCountInput.disabled = true;
		clearBtn.disabled = true;
		window.dropBall = true;
	}
	else{ // control value == "Stop"
		controlValue = "Start";
		window.dropBall = false;
	}
	controlBtn.innerHTML = controlValue;
});

clearBtn.addEventListener('click', function() {
	window.clear = true;
});

function enableControls(){
	clearBtn.disabled = false;
	binCountInput.disabled = false;
}