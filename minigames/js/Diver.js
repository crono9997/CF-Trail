function Diver() {
	this.limit = 5;
	this.color = '#FF0000';
	this.size = 25;	
	this.phase = 0;
	this.dir = 1;
	this.x = -50;
		this.xSpd = 10;
	if(randomInt(0,1) == 0){
		this.dir = -1;	
		this.x = canvasWidth+50;
		this.xSpd = -10;
	} 
};

Diver.prototype = new Enemy(this.x, Math.random()*200, this.xSpd,0,this.size,800, 5);

Diver.prototype.move = function move() {
	Enemy.prototype.move.call(this);
	//console.log(this.x, this.y);
	if(this.phase == 0){
		if((this.dir == 1 && this.x>= ship.x)||(this.dir == -1 && this.x<= ship.x)){
		//if(this.x>= ship.x){
			this.xSpd = 0;
			this.ySpd = 20;
			this.phase = 1;
		}
	}else{
		if(this.y>canvasHeight+100)this.die();	
	}
	
};

Diver.prototype.update = function update() {
	this.move();
	Enemy.prototype.update.call(this);	
	
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

Diver.prototype.draw = function draw() {
	if(this.hit>0)
		ctx.fillStyle = this.hitColor;
	else
		ctx.fillStyle = this.color;
	ctx.beginPath();
	if(this.phase == 1){
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x-20,this.y-20);
		ctx.lineTo(this.x-25,this.y-15);
		ctx.lineTo(this.x,this.y+15);
		ctx.lineTo(this.x+25,this.y-15);
		ctx.lineTo(this.x+20,this.y-20);
	}else{
	  	ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x-20*this.dir,this.y-20);
		ctx.lineTo(this.x-15*this.dir,this.y-25);
		ctx.lineTo(this.x+15*this.dir,this.y);
		ctx.lineTo(this.x-15*this.dir,this.y+25);
		ctx.lineTo(this.x-20*this.dir,this.y+20);

	}
	ctx.closePath();
	ctx.fill();
};