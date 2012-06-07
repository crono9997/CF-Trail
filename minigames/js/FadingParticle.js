function FadingParticle(x,y,xSpd,ySpd,size,sizeChange,color,alpha,alphaChange) {
	this.x = x;
	this.y = y;
	this.xSpd = xSpd;
	this.ySpd = ySpd;
	this.size = size;
	this.color = color;
	this.alpha = alpha;
	this.alphaChange = alphaChange;
	this.sizeChange = sizeChange;
};

FadingParticle.prototype = new Particle(this.x, this.y,this.xSpd,this.ySpd,this.size,this.color,this.alpha);

FadingParticle.prototype.update = function update() {
	this.move();
	this.alpha-=this.alphaChange;
	this.size-=this.sizeChange;
	if(this.alpha<=0){
		this.die();
	}
};