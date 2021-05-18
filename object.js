function Bin(id, height, bottom, leftBound, rightBound){
  this.id = id;
  this.height = height;
  this.bottom = bottom;
  this.leftBound = leftBound;
  this.rightBound = rightBound;
  this.ballCount = 0;
  this.endX = this.leftBound + (this.rightBound-this.leftBound)/2;
  this.endY = this.bottom-this.height;
  
  this.draw = function() {
    line(this.leftBound, this.bottom-this.height, this.leftBound, this.bottom);
    line(this.rightBound, this.bottom-this.height, this.rightBound, this.bottom);
    line(this.leftBound, this.bottom, this.rightBound, this.bottom);
    textSize(24);
    textAlign(CENTER);
    text(this.id, (leftBound+rightBound)/2, (this.bottom+this.bottom-this.height)/2)
  }
  
  this.clear = function() {
    this.ballCount = 0;
  }

  return this;
}

function Pin(x, y, r, row, col){
  this.x = x;
  this.y = y;
  this.r = r;
  this.row = row;
  this.col = col;
  this.leftTrajectory;
  this.rightTrajectory;

  this.draw = function(){
    fill(51);
    circle(x, y ,r);
  }

  this.getTrajectory = function(targetX, targetY){
  	let midX = this.x + (targetX-this.x)/2;
  	let midY = this.y + (this.y-targetY)/4;
  	let A = []
  	A.push([this.x*this.x, this.x, 1]);
  	A.push([targetX*targetX, targetX, 1]);
  	A.push([midX*midX, midX, 1]);
  	let b = [this.y, targetY, midY];
  	let res = math.lusolve(A, b);
  	for(let i=0; i<3; i++){
  		res.push(res.shift()[0]);
  	}
  	return res;
  }

  
  this.calcTrajectory = function(leftPin, rightPin){
  	let leftMidX = this.x + (leftPin.x-this.x)/2;
  	let leftMidY = this.y + (this.y-leftPin.y)/4;
  	let A = []
  	A.push([this.x*this.x, this.x, 1]);
  	A.push([leftPin.x*leftPin.x, leftPin.x, 1]);
  	A.push([leftMidX*leftMidX, leftMidX, 1]);
  	let b = [this.y, leftPin.y, leftMidY];
  	let res = math.lusolve(A, b);
  	for(let i=0; i<3; i++){ res.push(res.shift()[0]); }
  	this.leftTrajectory = res;

  	let rightMidX = this.x + (rightPin.x-this.x)/2;
  	let rightMidY = this.y + (this.y-rightPin.y)/4;
  	A = []
  	A.push([this.x*this.x, this.x, 1]);
  	A.push([rightPin.x*rightPin.x, rightPin.x, 1]);
  	A.push([rightMidX*rightMidX, rightMidX, 1]);
  	b = [this.y, rightPin.y, rightMidY];
  	res = math.lusolve(A, b);
  	for(let i=0; i<3; i++){ res.push(res.shift()[0]); }
  	this.rightTrajectory = res;
  }

  return this;
}

function Ball(x, y, r){
  this.x = x;
  this.y = y;
  this.r = r;
  this.dir = 0;

  this.transform = function(dx){
    dx = this.dir*dx;
    this.x += dx;
    this.y = A*x*x + B*x
  }

  return this;
}