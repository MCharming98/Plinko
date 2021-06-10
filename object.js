/**
 * A single bin object in the bottom of the plinko board
 * 
 * @param {number} id The number of the bin
 * @param {number} height The height of the bin
 * @param {number} bottom The y-value of the bottom of the bin
 * @param {number} leftBound The x-value of the left boundry of the bin
 * @param {number} rightBound The x-value of the right boundry of the bin
 * @return {object} Return this object when called with {new}
 */
function Bin(id, height, bottom, leftBound, rightBound){
  this.id = id; 
  this.height = height;
  this.bottom = bottom;
  this.leftBound = leftBound;
  this.rightBound = rightBound;
  this.ballCount = 0; // Number of balls this bin holds
  /* (endX, endY) is a point where balls will land on this bin
     it is at the top middle of the bin, used in calculation of ball trajectory, does not show in the board */
  this.endX = this.leftBound + (this.rightBound-this.leftBound)/2;
  this.endY = this.bottom-this.height;
  this.histHeight = 0; // Height of the histogram for this bin
  this.selected = false; // Indicates whether the bin is selected by cursor click
  this.CIselected = false; // Indicates whether the bin is selected for CI
  
  /**
   * Draws the bin on the plinko board
   */
  this.draw = function() {
    // Draws the histogram inside this bin, filled with green if not selected, and cyan if selected.
    if(this.selected || this.CIselected) { fill("cyan"); }
    else { fill("green"); }
    noStroke();
    rect(this.leftBound, this.bottom-this.histHeight, this.rightBound-this.leftBound, this.histHeight);

    // Draws the bin itself.
    fill("black");
    stroke("black");
    line(this.leftBound, this.bottom-this.height, this.leftBound, this.bottom);
    line(this.rightBound, this.bottom-this.height, this.rightBound, this.bottom);
    line(this.leftBound, this.bottom, this.rightBound, this.bottom);

    // Draws the bin id in the middle of the bin, the text color is red if selected, otherwise black.
    textSize(24);
    textAlign(CENTER);
    noStroke();
    if(this.selected) { fill("red"); }
    else { fill("black"); }
    text(this.id, (leftBound+rightBound)/2, (this.bottom+this.bottom-this.height)/2);

    // Resets default color and stroke for other drawings
    fill("black");
    stroke("black");
  }

  /**
   * Checks if a recent cursor click happens inside this bin
   * 
   * @param {number} x The x-value of the cursor click
   * @param {number} y The y-value of the cursor click
   * @return {boolean} Returns true if x and y is in the bound of this bin, false otherwise
   */
  this.select = function(x, y) {
  	this.selected = x>this.leftBound && x<this.rightBound && 
  					y<=this.bottom && y>=this.bottom-this.height;
  	return this.selected;
  }

  /**
   * Clears the stats of the bin when called
   */
  this.clear = function() {
    this.ballCount = 0;
    this.selected = false;
  }

  return this;
}

/**
 * A single pin object in the middle of the plinko board
 * 
 * @param {number} x The x-value of the pin
 * @param {number} y The y-value of the pin
 * @param {number} r The radius of the pin
 * @param {number} row The row index of the pin in the pin tree
 * @param {number} col The col index of the pin in the pin tree
 * @return {object} Return this object when called with {new}
 */
function Pin(x, y, r, row, col){
  this.x = x;
  this.y = y;
  this.r = r;
  this.row = row;
  this.col = col;
  /* Stores the ball trajectory from this pin to the next left/right pin,
   * the trajectory is simulated by a quadratic equation y = A*x^2 + B*x + C, calculated by calcTrajectory()
   * these variable stores an array of size 3 with value [A, B, C]
   */
  this.leftTrajectory; 
  this.rightTrajectory;
  // Pointer to the left and right child pins in the lower level
  this.leftPin;
  this.rightPin;

  /**
   * Draws the pin on the plinko board
   */
  this.draw = function(){
    fill("black");
    stroke("black");
    circle(this.x, this.y ,this.r);
  }

  /**
   * Simulates the trajectory with a quadratic equation between this pin and the target x and y
   * 
   * @param {number} targetX The x-value of the target pin(point)
   * @param {number} targetY The y-value of the target pin(point)
   * @return {number[]} Returns the trajectory
   */
  this.calcTrajectory = function(targetX, targetY) {
    /* Calculates a "mid" point to fit in the quadratic formula, since 3 points are needed to solve for 3 unknowns
       this is not the middle of the pin(x, y) and (targetX, targetY).
       To simulate the bouncing trajectory of the ball, this point is set higher than the pin.
    */
    let midX = this.x + (targetX-this.x)/2;
    let midY = this.y + (this.y-targetY)/4;
    /* Fit the 3 points (x, y), (midX, midY), (targetX, targetY) into the equation Ax = b,
       and solve for A, B, and C mentioned above. 
    */
    let A = []
    A.push([this.x*this.x, this.x, 1]);
    A.push([targetX*targetX, targetX, 1]);
    A.push([midX*midX, midX, 1]);
    let b = [this.y, targetY, midY];
    // the returned result from lusove is [[A],[B],[C]], it is converted in to [A, B, C]
    let res = math.lusolve(A, b);
    for(let i=0; i<3; i++){ res.push(res.shift()[0]); }
    return res;
  }

  /**
   * Calculate and store the trajectories from the pin to its left and right child pins.
   */
  this.getTrajectory = function(){
    this.leftTrajectory = this.calcTrajectory(this.leftPin.x, this.leftPin.y);
    this.rightTrajectory = this.calcTrajectory(this.rightPin.x, this.rightPin.y);
  }

  return this;
}

/**
 * A single ball object falling through the plinko board
 * 
 * @param {number} x The starting x-value of the ball
 * @param {number} y The starting y-value of the ball
 * @param {number} r The radius of the ball
 * @param {pin} targetPin The next pin this ball will land and bounce on
 * @return {object} Return this object when called with {new}
 */
function Ball(x, y, r, targetPin){
  this.x = x;
  this.y = y;
  this.r = r;
  // Randomly choose a color from the color list
  this.availableColors = ["red", "green", "blue", "yellow", "purple", "cyan", "magenta", "orange"];
  this.color = this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
  this.targetPin = targetPin; // Equals null when the ball will land in a bin next
  this.dir = 0; // Indicates the direction of the ball. -1: left, 1: right, 0: free fall(vertical)
  /* The trajectory of the ball, passed in from the pin it lands on,
     initially empty to represent free fall movement */
  this.trajectory = [];
  this.bin = null; // The bin in which this ball lands, updates when the ball lands in a bin

 /**
  * Changes the position of the ball(x, y) along its current trajectory with the given speed
  * 
  * @param {number} d The speed of the ball movement in pixels/frame
  */
  this.transform = function(d){
    if(this.dir == 0){ this.y += d*2; } // Free fall is twice as fast
    else {
      this.x += this.dir * d;
      this.y = this.x*this.x*this.trajectory[0] + this.x*this.trajectory[1] + this.trajectory[2];
    }
    // When the ball is hitting a pin, update the next pin and the trajectory
    if(this.targetPin != null && this.targetPin.y - this.y <= this.r) { // targetPin == null when next is a bin
      let r = Math.random(); // random number in [0,1)
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
  /**
   * Draws the ball on the plinko board
   */
  this.draw = function(){
    fill(this.color);
    noStroke();
    circle(this.x, this.y ,this.r);
  }

  return this;
}