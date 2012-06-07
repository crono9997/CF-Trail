function Sprite(x,y) {
	this.x = x;
	this.y = y;
	
};

Sprite.prototype.setTexture = function setTexture(texture, offsetX, offsetY){
	this.texture = texture;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
};

Sprite.prototype.setTextureAnimation = function setTexture(texture, offsetX, offsetY, frameW, frameH, frame){
	this.texture = texture;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.frameW = frameW;
	this.frameH = frameH;
	this.frame = frame;
};

Sprite.prototype.drawImage = function draw() {
	ctx.drawImage(this.texture, this.x-this.offsetX, this.y-this.offsetY);
};

Sprite.prototype.drawAnim = function drawAnim() {
	var xPos = this.frame*this.frameW;
	var yPos = 0;
	if(xPos>this.texture.width){
		xPos = xPos%this.texture.width;
		xPos = Math.floor(xPos/this.texture.width)*this.frameH;
	}
	ctx.drawImage(this.texture, xPos, yPos, this.frameW, this.frameH, this.x-this.offsetX, this.y-this.offsetY, this.frameW, this.frameH);
};

Sprite.prototype.drawCircle = function drawCircle(color, size) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(this.x, this.y, size, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
};

Sprite.prototype.drawSquare = function drawSquare(color, size) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.rect(this.x-size/2, this.y-size/2, this.size, this.size);
	ctx.closePath();
	ctx.fill();
};

Sprite.prototype.drawRectangle = function drawRectangle(color, recX, recY, recW, recH) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.rect(recX, recY, recW, recH);
	ctx.closePath();
	ctx.fill();
};