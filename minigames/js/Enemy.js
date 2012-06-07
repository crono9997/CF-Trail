function Enemy(x,y,xSpd,ySpd,size,score,life) {
	this.score = score;
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd;
	this.size = size;
	this.alive = true;
	this.life = life;
	this.hitColor = "#ffffff";
	this.hit = 0;
};

Enemy.prototype = new Sprite(this.x, this.y);

// Define a sync method
Enemy.prototype.move = function move() {
  this.x += this.xSpd;
  this.y += this.ySpd;
};

Enemy.prototype.die = function die() {
	for(var i = 0, ii = enemyList.length; i< ii; i++){
		if(enemyList[i] == this){
			enemyList.splice(i,1);
			break;
		}
	}
};

Enemy.prototype.update = function update() {
	if(this.hit>0)this.hit--;
};

Enemy.prototype.flash = function flash() {
	this.hit = 10;
};