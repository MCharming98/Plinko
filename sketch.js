var canvasHeight = 400;
var canvasWidth = 600;

var binCountChanged = false;
var probability = 0.5;

var binCount = 5;
var binOffset = 5;
var binList = [];
var binWidth;
var binHeight;

var pinRadius = 5;
var pinOffset;
var pinTree = [];
var pinDimension;

var ballStartX;
var ballStartY;
var ballRadius = 2;

function initBoard(binCount){
	binWidth = Math.floor((canvasWidth-(binOffset*2))/binCount);
	binHeight = canvasHeight/5;
	pinDimension = binCount - 1;
	pinOffset = Math.floor((canvasHeight - binHeight - binOffset)/(pinDimension-1+2));

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
	  		let leftPin = pinTree[r+1][c];
	  		let rightPin = pinTree[r+1][c+1];
	  		curPin.calcTrajectory(leftPin, rightPin);
	  	}
	}
	for(let c=0; c<pinTree[pinDimension-1].length; c++){
	  	let curPin = pinTree[pinDimension-1][c];
	  	let leftBin = binList[c];
	  	let rightBin = binList[c+1];
	  	let leftPin = new Pin(leftBin.endX, leftBin.endY, 0, 0, 0);
	  	let rightPin = new Pin(rightBin.endX, rightBin.endY, 0, 0, 0);
	  	curPin.calcTrajectory(leftPin, rightPin);
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
	  		//let leftTrajectory = curPin.getTrajectory(leftPin.x, leftPin.y);
	  		//let rightTrajectory = curPin.getTrajectory(rightPin.x, rightPin.y);
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
	  	//let leftTrajectory = curPin.getTrajectory(leftBin.endX, leftBin.endY);
	  	//let rightTrajectory = curPin.getTrajectory(rightBin.endX, rightBin.endY);
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
  	initBoard(binCount);
  	binCountChanged = false;
  }
  drawBoard();
  drawTrajectory();
}
