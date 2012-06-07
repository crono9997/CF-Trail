function Bullet(x,y,xSpd,ySpd,size,color,damage,target) {
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd;
	this.size = size;
	this.color = color;
	this.damage = damage;
	this.target = target;
	this.list = false;
	if(this.target instanceof Array){
		this.list = true;
	}
};

Bullet.prototype = new Sprite(this.x, this.y);

Bullet.prototype.move = function move() {
  this.x += this.xSpd;
  this.y += this.ySpd;
};

Bullet.prototype.die = function die() {
	for(var i = 0, ii = bulletList.length; i< ii; i++){
		if(bulletList[i] == this){
			bulletList.splice(i,1);			
			break;
		}
	}
};

Bullet.prototype.update = function update() {
	this.move();
	var alive = true;
	if(this.list){
		for(var j = 0; j< this.target.length; j++){
			if(distance(this.target[j].x, this.target[j].y, this.x, this.y)<this.target[j].size+this.size){
				this.target[j].life-=this.damage;
				if(this.target[j].life<=0){
					score+= this.target[j].score;
					spawnPowerUp(this.target[j]);
					killEnemy(this.target[j]);
					this.target.splice(j,1);
					if(this.target.length == 0 && totalEnemyCount == 0){
						win = true;
						paused = true;
						addEventListener("mousedown", oRetry);
					}
				}else{
					this.target[j].flash();
				}
				alive = false
				this.die();
				break;
			}
		}
		if(alive){
			if(this.x<0 || this.x>canvasWidth || this.y<0 || this.y>canvasHeight){
				this.die();
			}
		}
	}else{
		var alive = true;
		if(distance(ship.x, ship.y, this.x, this.y)<45){
			health-=this.damage;
			if(health<=0){
				health = 0;
				dead = true;
				paused = true;
				addEventListener("mousedown", oRetry);
			}
			hit = 5;
			this.die();
			alive = false;
		}
		if(alive){
			if(this.x<0 || this.x>canvasWidth || this.y<0 || this.y>canvasHeight){
				this.die();
			}
		}
	}
};

Bullet.prototype.draw = function draw() {
	Sprite.prototype.drawCircle.call(this, "#ffffff", this.size);
	Sprite.prototype.drawCircle.call(this, this.color, this.size-3);
};