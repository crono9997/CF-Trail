function Particle(x,y,xSpd,ySpd,size,color,alpha) {
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd;
	this.size = size;
	this.color = color;
	this.alpha = alpha;
};

Particle.prototype = new Sprite(this.x, this.y);

Particle.prototype.move = function move() {
  this.x += this.xSpd;
  this.y += this.ySpd;
};

Particle.prototype.die = function die() {
	for(var i = 0, ii = particleList.length; i< ii; i++){
		if(particleList[i] == this){
			particleList.splice(i,1);			
			break;
		}
	}
};

Particle.prototype.update = function update() {
	this.move();
};

Particle.prototype.draw = function draw() {
	ctx.globalAlpha = this.alpha;	
	Sprite.prototype.drawCircle.call(this, this.color, this.size);
};