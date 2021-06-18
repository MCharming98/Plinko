/**
 * The main file to implement UI with p5.js,
 * also contains the logistics for calculating the statistics.
 *
 * @author Chen Meng
 */

// html elements for dispaly of statistics
var totalBallCountDisp = document.getElementById("totalCount");
var meanDisp = document.getElementById("mean");
var varianceDisp = document.getElementById("variance");
var selectedBinDisp = document.getElementById("selectedBin");
var ballCountDisp = document.getElementById("ballCount");
var binProbabilityDisp = document.getElementById("binProbability");
var CIloBoundDisp = document.getElementById("CILowBound");
var CIhiBoundDisp = document.getElementById("CIHiBound");
var CIValueDisp = document.getElementById("CIValue");

// Dimension of the plinko board
var canvasHeight = 400; // Note that the top is at 0
var canvasWidth = 600;

// Control variables, manipulated by controls.js
var binCountChanged = false;
var dropBall = false;
var clear = false;
var probability = 0.5;
var speed = 2;

// Statistics variables
var totalBallCount;
var mean;
var variance;
var selectedBin;
var CIloBound;
var CIhiBound;

// Bin variables
var binCount = 5;
var binOffset = 5; // Number of pixels between the bins and the border of the board
var binList; // A list that stores all the bin objects
var binWidth;
var binHeight;
var maxBallCount; // Stores the maximum number of balls across all bins
/*
 * Number of pixels the histogram grows with each additional balls,
 * changes dynamically since the histogram height cannot surpass the binHeight.
 * In that case, the bin with most balls will have hist height == bin height,
 * while the height of histograms in other bins will decreasae.
 */
var binHistDelta; 

// Pin variables
var pinRadius = 5;
var pinOffset; // Vertical distance between each row of pins
var pinTree; // A 2D list stroing all pin objects, represented as a binary tree as seen on the board.
var pinDimension; // The height of the pin tree

// Ball variables
var ballStartX; // The position(startX, startY) where each ball is being dropped
var ballStartY;
var ballRadius = 10;
var ballList = []; // A queue storing all balls on the board

/**
 * Initialize the pinko board with the given number of bins
 * 
 * @param {number} binCount The number of bins
 */
function initBoard(binCount){
	// Initialize statistics
	totalBallCount = 0;
	mean = 0;
	variance = 0;
	selectedBin = -1;
	CIloBound = 0;
	CIhiBound = 0;
	binHistDelta = 5;

	// Initialize the bin and pin variables
	binWidth = Math.floor((canvasWidth-(binOffset*2))/binCount);
	binHeight = canvasHeight/5;
	pinDimension = binCount - 1;
	pinOffset = Math.floor((canvasHeight - binHeight - binOffset)/(pinDimension-1+2));
	/* Initially set to the number of balls that maximizes the histogram height
     * with the default value of binHistDelta, so binHistDelta will stay unchanged until maxBallCount
     * is overwritten with new values. See the first lines in updateStats().
     */
	maxBallCount = binHeight/binHistDelta; 

	// Initialize the bins
	binList = [];
	let pos = binOffset;
	for(let i=0; i<binCount; i++){
		let b = new Bin(i, binHeight, canvasHeight-binOffset, pos, pos+binWidth) // Defined in object.js
		binList.push(b);
		pos += binWidth;
	}

	// Initlize the pins
	let startX = binList[0].rightBound; // The first pin will be drawn at the right boundary of the left first bin
	let endX = binList[binList.length-1].leftBound; // The last pin will be drawn at the left boundary of the right first bin
	let y = canvasHeight-binOffset-binHeight-pinOffset; // The y-value of the pins

	pinTree = [];
	for(let i=pinDimension; i>0; i--){ // Draw the pins from bottom to top
		pinTree.unshift([]); // Prepend each row to the list since its drawn in reverse order
		for(let x=startX; x<=endX; x+=binWidth){
		  let p = new Pin(x, y, pinRadius, i-1, pinTree[0].length);
		  pinTree[0].push(p);
		}
		// The x-values will converge to the center since there are less pins on the top
		startX += binWidth/2;
		endX -= binWidth/2;
		y -=pinOffset;
	} 

	// Initialize the starting point of each ball
	ballStartX = pinTree[0][0].x; // Always on top of the top pin
	ballStartY = ballRadius; // Basically 0(at top) but have to show the entire ball

	// Calculate and store the ball trajectories from each pin
	for(let r=0; r<pinDimension-1; r++){
	  	for(let c=0; c<pinTree[r].length; c++){
	  		let curPin = pinTree[r][c];
	  		// Left and right child pins
	  		curPin.leftPin = pinTree[r+1][c];
	  		curPin.rightPin = pinTree[r+1][c+1];
	  		curPin.getTrajectory(); // Defined in object.js
	  	}
	}
	// Calculate and store the ball trajectories from the last row of pin
	for(let c=0; c<pinTree[pinDimension-1].length; c++){
	  	let curPin = pinTree[pinDimension-1][c];
	  	/* The last row of pins do not have children,
	  	 * so the balls will pass through the top middle of the target bin(endX, endY) and land in it
	  	 */
	  	let leftBin = binList[c];
	  	let rightBin = binList[c+1];
	  	curPin.leftTrajectory = curPin.calcTrajectory(leftBin.endX, leftBin.endY);
	  	curPin.rightTrajectory = curPin.calcTrajectory(rightBin.endX, rightBin.endY);
	}
}

/**
 * Draw the bins and pins on the pinko board 
 */
function drawBoard(){
	binList.forEach((bin) => { bin.draw(); });
	pinTree.forEach((row) =>{
		row.forEach((pin) => { pin.draw(); });
	});
}

/**
 * Debug function, draws out the trajectories the balls will go through
 */
function drawTrajectory(){
	// Top free fall
	for(let y=ballStartY; y<=pinTree[0][0].y; y+=3){
		point(ballStartX, y);
	}
	// Trajectory of first n-1 row of pins
	for(let r=0; r<pinDimension-1; r++){
	  	for(let c=0; c<pinTree[r].length; c++){
	  		let curPin = pinTree[r][c];
	  		let leftPin = pinTree[r+1][c];
	  		let rightPin = pinTree[r+1][c+1];
	  		let leftTrajectory = curPin.leftTrajectory;
	  		let rightTrajectory = curPin.rightTrajectory;
	  		for(let x=curPin.x; x>leftPin.x; x--){
	  			point(x, leftTrajectory[0]*x*x+leftTrajectory[1]*x+leftTrajectory[2]);
	  		}
	  		
	  		for(let x=curPin.x; x<rightPin.x; x++){
	  			point(x, rightTrajectory[0]*x*x+rightTrajectory[1]*x+rightTrajectory[2]);
	  		}
	  	}
	}
	// Trajectory of the last row of pins
	for(let c=0; c<pinTree[pinDimension-1].length; c++){
	  	let curPin = pinTree[pinDimension-1][c];
	  	let leftBin = binList[c];
	  	let rightBin = binList[c+1];
	  	let leftTrajectory = curPin.leftTrajectory;
	  	let rightTrajectory = curPin.rightTrajectory;
	  	for(let x=curPin.x; x>leftBin.leftBound; x--){
	  		let y = leftTrajectory[0]*x*x+leftTrajectory[1]*x+leftTrajectory[2];
	  		if(y >= leftBin.bottom) { break; }
	  		point(x, y);
	  	}
	  	for(let x=curPin.x; x<rightBin.rightBound; x++){
	  		let y = rightTrajectory[0]*x*x+rightTrajectory[1]*x+rightTrajectory[2];
	  		if(y >= rightBin.bottom) { break; }
	  		point(x, y);
	  	}
	}
}

/**
 * Update the statistics on the UI
 */
function updateStats(){
	let binData = [];
	binList.forEach((bin) => {
		maxBallCount = Math.max(maxBallCount, bin.ballCount); // Finds the number of balls in the bin with most balls
		/* Add all the balls to this list, the value will be the id of the bin it lands in,
		 * used in stats calculation.
		 */
		binData = binData.concat(Array(bin.ballCount).fill(bin.id));
	});
	
	binHistDelta = binHeight/maxBallCount; 
	binList.forEach((bin) => {
		bin.histHeight = bin.ballCount * binHistDelta; // Adjust the height of the histograms
	});

	// Calculate the stats
	totalBallCount = binData.length;
	mean = totalBallCount == 0 ? 0 : math.mean(binData);
	variance = totalBallCount == 0 ? 0 : math.variance(binData);

	// Calculate the confidence interval
	let CIBallCount = 0;
	for(let i=CIloBound; i<=CIhiBound; i++){ CIBallCount += binList[i].ballCount; }

	if(selectedBin == -1){ // -1 means no bin is selected
		selectedBinDisp.innerText = "None";
		ballCountDisp.innerText = 0;
		binProbabilityDisp.innerText = 0
		CIloBoundDisp.innerText = 0;
		CIhiBoundDisp.innerText = 0;
		CIValueDisp.innerText = 0
	}
	else{
		let binBallCount = binList[selectedBin].ballCount;
		selectedBinDisp.innerText = selectedBin;
		ballCountDisp.innerText = binBallCount;
		binProbabilityDisp.innerText = totalBallCount == 0 ? 0 : ((binBallCount/totalBallCount)*100).toFixed(3);
		CIloBoundDisp.innerText = CIloBound;
		CIhiBoundDisp.innerText = CIhiBound;
		CIValueDisp.innerText = totalBallCount == 0  ? 0 : ((CIBallCount/totalBallCount)*100).toFixed(3);
	}

	totalBallCountDisp.innerText = totalBallCount;
	meanDisp.innerText = mean.toFixed(3);
	varianceDisp.innerText = variance.toFixed(3);
}

/**
 * Init function called by p5.js
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30); // Calls draw() 30 times per second
  initBoard(binCount);
}
/**
 * Main drawing function called by p5.js
 */
function draw() {
	background(220); // Light gray background
	if(binCountChanged) {
		ballList = [];
		initBoard(binCount);
		updateStats();
		binCountChanged = false;
	}
	if(clear) {
		binList.forEach(bin => (bin.clear()));
		updateStats();
		clear = false;
	}

	drawBoard();
	//drawTrajectory();

	if(dropBall){
		if(ballList.length == 0 || ballList[ballList.length-1].y + ballList[ballList.length-1].r 
		> pinTree[0][0].y){ // Add a new ball if there is none or the last ball reaches to the first pin
			ballList.push(new Ball(ballStartX, ballStartY, ballRadius, pinTree[0][0]));	
		}
	}
	else if(ballList.length == 0){ window.enableControls(); } // Enable controls after all balls are landed

    let length = ballList.length;
	for(let i=0; i<length; i++){ // Traverse through each ball once and update its status
		let ball = ballList.shift();
		ball.transform(speed);
		if(ball.bin == null && ball.y + ball.r > canvasHeight - binOffset - binHeight){
			// Assigns the ball to the bin its in if it has not been assigned yet
			ball.bin = binList[Math.floor((ball.x-binOffset)/binWidth)];
		}
		if(ball.bin == null || ball.y + ball.r < ball.bin.bottom - ball.bin.histHeight){
			// Draws the ball and adds it back to the list if it is still falling
			ball.draw();
			ballList.push(ball);
		}
		else if(ball.bin != null){
			// Update the statistics when the ball lands
			ball.bin.ballCount++;
			updateStats();
		}
	}
}

/**
 * Handles mouse click event, handled by p5.js
 */
function mouseClicked(){
	if(mouseX >=0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= canvasHeight){ // Only checks the clicks inside the plink board
		// Zero the status of the bins
		selectedBin = -1;
		binList.forEach((bin) => {
			bin.selected = false;
			bin.CIselected = false;
		});
		// Traverse through all the bins and find which bin is selected
		for(let i=0; i<binList.length; i++){
			let bin = binList[i];
			if(bin.select(mouseX, mouseY)){
				// Calculate the range of the confidence interval
				selectedBin = bin.id;
				let midBin = (binList.length-1)/2;
				let range = selectedBin - midBin;
				CIloBound = Math.min(midBin-range, selectedBin);
				CIhiBound = Math.max(midBin-range, selectedBin);
				for(let b=CIloBound; b<=CIhiBound; b++){
					binList[b].CIselected = true;
				}
				break;
			}
		}
		updateStats();
	}
}
