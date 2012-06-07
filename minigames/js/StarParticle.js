function StarParticle(x,y,xSpd,ySpd,size,color,alpha) {
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd;
	this.size = size;
	this.color = color;
	this.alpha = alpha;
};

StarParticle.prototype = new Particle(this.x, this.y,this.xSpd,this.ySpd,this.size,this.color,this.alpha);

StarParticle.prototype.update = function update() {
	this.move();
	if(this.y>canvasHeight)this.y = -20;
};