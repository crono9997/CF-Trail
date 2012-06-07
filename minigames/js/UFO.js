function UFO() {
	this.limit = 5;
	this.color = '#0000FF';
	this.color2 = '#00FF00';
	this.size = 20;	
	this.phase = 0;
	this.dir = 1;
};

UFO.prototype = new Enemy(Math.random()*canvasWidth, -50, 0,5,this.size,800, 1);

// Adjusts UFOs xSpd and ySpd and moves the UFO accordingly.
UFO.prototype.move = function move() {
	Enemy.prototype.move.call(this);
	if(this.phase % 2 == 0){
	//console.log(this.y,this.phase*80);
	if(this.y>this.phase*80){
			this.phase++;
			this.xSpd = 5*this.dir;
			this.ySpd = 0;
		}
	}else{
		if(this.dir == 1){
			if(this.x>canvasWidth-this.size){
				this.phase++;
				this.xSpd = 0;
				this.ySpd = 5;
				this.dir*=-1;
			}
		}else{
			if(this.x<=this.size){
				this.phase++;
				this.xSpd = 0;
				this.ySpd = 5;
				this.dir*=-1;
			}
		}
	}
		
	if(this.y>canvasHeight+100)this.die();	
	
};

UFO.prototype.update = function update() {
	this.move();
	if(randomInt(0,100) == 0)spawnEnemyBullet(this);
	
	if(distance(this.x, this.y, ship.x, ship.y)<this.size+45){
		health-=15;
		if(health<=0){
			health = 0;
			dead = true;
			paused = true;
			addEventListener("mousedown", oRetry);
		}
		hit = 5;
		this.die();
	}
};

UFO.prototype.draw = function draw() {
	Sprite.prototype.drawCircle.call(this, this.color, this.size);
	Sprite.prototype.drawRectangle.call(this, this.color2, this.x-this.size, this.y-this.size/4, this.size*2, this.size/2);
};