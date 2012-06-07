//Converts RGB values to hex
function getHex(red, green, blue){
	var rgb = blue | (green << 8) | (red << 16);
    return '#' + rgb.toString(16);
}

var direction8Way = [
	[0,1],
	[1,0],
	[0,-1],
	[-1,0],
	[1,1],
	[-1,-1],
	[1,-1],
	[-1,1]
];

//Generates a random int between low and high including both.
function randomInt(low, high){
	if (low >= high) low = 0;
	return Math.floor(Math.random() * (1+high-low)) + low; 
}

//Gets mouse relative position to canvas.
function getMousePos(canvas, evt){
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj && obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
 
    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
        x: mouseX,
        y: mouseY
    };
}

//Restricts a variable to a low and high limit
function clamp(val,low,high){
	if(val<low)val = low;
	else if(val>high)val = high;
	return val;
}

//Returns distance betweem two points
function distance(x1, y1, x2, y2){
	return Math.sqrt(((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1)));
}

//Creates an ouline around text by drawing the text with an offset in 8 different directions first.
function outLineText(message, x, y, lineWidth, outlineColor, color){
	ctx.fillStyle = outlineColor;
	for(var i = 0; i< direction8Way.length; i++){
		ctx.fillText(message, x+lineWidth*direction8Way[i][0], y+lineWidth*direction8Way[i][1]);	
	}
	ctx.fillStyle = color;		
	ctx.fillText(message, x, y);	
}