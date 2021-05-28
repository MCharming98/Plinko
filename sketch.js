var canvasHeight = 400;
var canvasWidth = 600;

var binCountChanged = false;
var dropBall = false;
var probability = 0.5;
var speed = 3;

var binCount = 5;
var binOffset = 5;
var binList = [];
var binWidth;
var binHeight;
var maxBallCount; 
var binHistDelta = 5;

var pinRadius = 5;
var pinOffset;
var pinTree = [];
var pinDimension;

var ballStartX;
var ballStartY;
var ballRadius = 10;
var ballList = [];

function initBoard(binCount){
	binWidth = Math.floor((canvasWidth-(binOffset*2))/binCount);
	binHeight = canvasHeight/5;
	pinDimension = binCount - 1;
	pinOffset = Math.floor((canvasHeight - binHeight - binOffset)/(pinDimension-1+2));
	maxBallCount = binHeight/binHistDelta;

	binList = [];
	let pos = binOffset;
	for(let i=0; i<binCount; i++){
		let b = new Bin(i+1, binHeight, canvasHeight-binOffset, pos, pos+binWidth)
		binList.push(b);
		pos += binWidth;
	}

	let startX = binList[0].rightBound;
	let endX = binList[binList.length-1].leftBound;
	let y = canvasHeight-binOffset-binHeight-pinOffset;

	pinTree = [];
	for(let i=pinDimension; i>0; i--){
		pinTree.unshift([]);
		for(let x=startX; x<=endX; x+=binWidth){
		  let p = new Pin(x, y, pinRadius, i-1, pinTree[0].length);
		  pinTree[0].push(p);
		}
		startX += binWidth/2;
		endX -= binWidth/2;
		y -=pinOffset;
	} 

	ballStartX = pinTree[0][0].x;
	ballStartY = ballRadius;

	for(let r=0; r<pinDimension-1; r++){
	  	for(let c=0; c<pinTree[r].length; c++){
	  		let curPin = pinTree[r][c];
	  		curPin.leftPin = pinTree[r+1][c];
	  		curPin.rightPin = pinTree[r+1][c+1];
	  		curPin.getTrajectory();
	  	}
	}
	for(let c=0; c<pinTree[pinDimension-1].length; c++){
	  	let curPin = pinTree[pinDimension-1][c];
	  	let leftBin = binList[c];
	  	let rightBin = binList[c+1];
	  	curPin.leftTrajectory = curPin.calcTrajectory(leftBin.endX, leftBin.endY);
	  	curPin.rightTrajectory = curPin.calcTrajectory(rightBin.endX, rightBin.endY);
	}
}

function drawBoard(){
	binList.forEach((bin) => { bin.draw(); });
	pinTree.forEach((row) =>{
		row.forEach((pin) => { pin.draw(); });
	});
}

function drawTrajectory(){
	for(let y=ballStartY; y<=pinTree[0][0].y; y+=3){
		point(ballStartX, y);
	}
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

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30);
  initBoard(binCount);
}

function draw() {
	background(220);
	if(binCountChanged) {
		ballList = [];
		initBoard(binCount);
		binCountChanged = false;
	}

	drawBoard();
	//drawTrajectory();

	if(dropBall){
		if(ballList.length == 0 || ballList[ballList.length-1].y + ballList[ballList.length-1].r 
								   > pinTree[0][0].y){
			ballList.push(new Ball(ballStartX, ballStartY, ballRadius, pinTree[0][0]));	
		}
	}
    let length = ballList.length;
	for(let i=0; i<length; i++){
		let ball = ballList.shift();
		ball.transform(speed);
		if(ball.bin == null && ball.y + ball.r > canvasHeight - binOffset - binHeight){
			ball.bin = binList[Math.floor((ball.x-binOffset)/binWidth)];
		}
		if(ball.bin == null || ball.y + ball.r < ball.bin.bottom - ball.bin.histHeight){
			ball.draw();
			ballList.push(ball);
		}
		else if(ball.bin != null){
			ball.bin.ballCount++;
			/*
			let str = "";
			binList.forEach((bin) => { str += bin.ballCount + " "; });
			console.log("1 2 3 4 5");
			console.log(str);
			*/
		}
	}

	binList.forEach((bin) => {
		maxBallCount = Math.max(maxBallCount, bin.ballCount);
	});
	binHistDelta = binHeight/maxBallCount;
	binList.forEach((bin) => {
		bin.histHeight = bin.ballCount * binHistDelta;
	});

}
