function Bin(id, height, bottom, leftBound, rightBound){
  this.id = id;
  this.height = height;
  this.bottom = bottom;
  this.leftBound = leftBound;
  this.rightBound = rightBound;
  this.ballCount = 0;
  this.endX = this.leftBound + (this.rightBound-this.leftBound)/2;
  this.endY = this.bottom-this.height;
  this.histY = bottom;
  
  this.draw = function() {
    fill(51);
    stroke(51);
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
  this.leftPin;
  this.rightPin;

  this.draw = function(){
    fill(51);
    stroke(51);
    circle(this.x, this.y ,this.r);
  }

  this.calcTrajectory = function(targetX, targetY) {
    let midX = this.x + (targetX-this.x)/2;
    let midY = this.y + (this.y-targetY)/4;
    let A = []
    A.push([this.x*this.x, this.x, 1]);
    A.push([targetX*targetX, targetX, 1]);
    A.push([midX*midX, midX, 1]);
    let b = [this.y, targetY, midY];
    let res = math.lusolve(A, b);
    for(let i=0; i<3; i++){ res.push(res.shift()[0]); }
    return res;
  }

  this.getTrajectory = function(){
    this.leftTrajectory = this.calcTrajectory(this.leftPin.x, this.leftPin.y);
    this.rightTrajectory = this.calcTrajectory(this.rightPin.x, this.rightPin.y);
  }

  return this;
}

function Ball(x, y, r, targetPin){
  this.x = x;
  this.y = y;
  this.r = r;
  this.availableColors = ["red", "green", "blue", "yellow", "purple", "cyan", "magenta", "orange"];
  this.color = this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
  this.targetPin = targetPin;
  this.dir = 0;
  this.trajectory = [];
  this.bin = null;

  this.transform = function(d){
    if(this.dir == 0){ this.y += d*2; }
    else {
      this.x += this.dir * d;
      this.y = this.x*this.x*this.trajectory[0] + this.x*this.trajectory[1] + this.trajectory[2];
    }

    if(this.targetPin != null && this.targetPin.y - this.y <= this.r) {
      let r = Math.random();
      if(r <= window.probability){
        this.dir = 1;
        this.trajectory = this.targetPin.rightTrajectory;
        this.targetPin = this.targetPin.rightPin;
      }
      else{
        this.dir = -1;
        this.trajectory = this.targetPin.leftTrajectory;
        this.targetPin = this.targetPin.leftPin;
      }
    }
  }

  this.draw = function(){
    fill(this.color);
    noStroke();
    circle(this.x, this.y ,this.r);
  }

  return this;
}