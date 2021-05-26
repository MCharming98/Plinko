var binCountInput = document.getElementById("binCountInput");
var probInput = document.getElementById("probInput");
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

controlBtn.addEventListener('click', function() { 
	let controlValue = controlBtn.innerHTML;
	if(controlValue == "Start"){
		controlValue = "Stop";
		binCountInput.disabled = true;
		clearBtn.disabled = true;
		window.dropBall = true;
	}
	else{
		controlValue = "Start";
		binCountInput.disabled = false;
		clearBtn.disabled = false;
		window.dropBall = false;
	}
	controlBtn.innerHTML = controlValue;
});

clearBtn.addEventListener('click', function() {
	binList.forEach(bin => (bin.clear()));
});