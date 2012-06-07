function Squirm(special) {
	this.limit = 5;
	this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
	this.size = randomInt(10,20);
	this.colorChange = false;
	this.score = 1000;
	this.life = 1;
	if(special){
		this.colorChange = true;
		this.limit = 10;
		this.score = 1400;
		this.life = 5;
	}
	/* this.score = score;
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd; */
};

Squirm.prototype = new Enemy(Math.random()*canvasWidth,-50,randomInt(-5,5),randomInt(0,5),this.size,this.score, this.life);

// Adjusts Squirms xSpd and ySpd and moves the Squirm accordingly.
Squirm.prototype.move = function move() {
	particleList.push(new FadingParticle(this.x, this.y, 0,0, this.size, 0.2, this.color, 1, 0.05));

	this.xSpd+=randomInt(-2,2);
	this.xSpd = clamp(this.xSpd, this.limit*-1, this.limit);
	this.ySpd+=randomInt(-2,2);
	this.ySpd = clamp(this.ySpd, this.limit*-1, this.limit);
	
	Enemy.prototype.move.call(this);
	
	if(this.y<0)this.ySpd = Math.abs(this.ySpd);
	else if(this.y>canvasHeight-100)this.ySpd = Math.abs(this.ySpd)*-1;
	if(this.x<0)this.xSpd = Math.abs(this.xSpd);
	else if(this.x>canvasWidth)this.xSpd = Math.abs(this.xSpd)*-1;
	
};

Squirm.prototype.update = function update() {
	this.move();
	Enemy.prototype.update.call(this);
	
	if(randomInt(0,120) == 0)spawnEnemyBullet(this);
	if(this.score>50)this.score--;
	if(this.colorChange)this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
};

Squirm.prototype.draw = function draw() {
	if(this.hit>0)
		Sprite.prototype.drawCircle.call(this, this.hitColor, this.size);
	else
		Sprite.prototype.drawCircle.call(this, this.color, this.size);
};