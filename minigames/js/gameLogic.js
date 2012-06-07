//Get Canvas object, store canvas width and height, and fill screen black.
var canvas = document.getElementById('canvas');
var canvasWidth  = canvas.width;
var canvasHeight = canvas.height;
var starBgCtx = canvas.getContext('2d');
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';
ctx.fillRect(0,  0, canvasWidth, canvasHeight);
var blankImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

require([
			"js/commonActions",
			"js/Sprite",
			"js/Particle",
			"js/StarParticle",
			"js/FadingParticle",
			"js/Bullet",
			"js/Enemy",
            		"js/UFO",
            		"js/Diver",
			"js/Squirm"
			
        ], function(){
           filesLoaded();
        });

//Set FPS and initialize FPS vars
var fps = 60;
var curFps = 0;
var lastTime = new Date();
var frameCount = 0;

var mouseDown = false;


//Load textures
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
	shipReady = true;
};
shipImage.src = "img/ssv_cf2.png";

var shipImageHit = new Image();
shipImageHit.src = "img/ssv_cf2.png";

var bulletImage = new Image();
bulletImage.src = "img/bullet.png";

var enemyBulletImage = new Image();
enemyBulletImage.src = "img/eBullet.png";

//Powerups
var healthPowerUpImage = new Image();
healthPowerUpImage.src = "img/pUp_health.png";
var autoPowerUpImage = new Image();
autoPowerUpImage.src = "img/pUp_auto.png";
var spreadPowerUpImage = new Image();
spreadPowerUpImage.src = "img/pUp_spread.png";
var bSizePowerUpImage = new Image();
bSizePowerUpImage.src = "img/pUp_bSizeIncrease.png";

//Create variables
var dead = false;
var win = false;
var paused = false;
var score = 0;
var health = 100;
var hit = 0;
var retryPos;

var bulletList = [];
var enemyList = [];
var particleList = [];
var powerUpList = [];

var spread = 1;
var spreadArray = [
	[[0,-10]],
	[[-1,-9],[1,-9]],
	[[-2,-8],[0,-10],[2,-8]],
	[[-2,-8],[-1,-9],[1,-9],[2,-8]],
	[[-2,-8],[-1,-9],[0,-10],[1,-9],[2,-8]]
];

var auto = false;
var autoRate = 10;
var curRate = 0;

var bSize = 6;

var enemyPhase = 1;
var enemyPhaseLimit = 30;
var enemyPhaseFrames = 0;
var enemyPhaseFramesChange = 60;
var totalEnemyCount = 100;

var user = "";
var blinking = 10;

var mousePos = {x:0, y:0};

var ship = {
	x: 100,
	y: canvasHeight-72
}

//Create multi layer background
var starList = [];
var starSizeRange = [3,5];
var starSpeeds = [{ spd:1, count: 1000, size:0.4 },
				{ spd:3, count: 100, size:0.4 },
				{ spd:6, count: 50, size:0.6 },
				{ spd:10, count: 50, size:1 }
];
var starLayers = [];
var starImage = new Image();
var bgY = canvasHeight*-1;
var lastPos = {x:0, y:0};
var shootFrame = 0;

function createStars(){
	for(var i = 0; i< starSpeeds.length; i++){
		for(var j = 0; j< starSpeeds[i].count; j++){
			if(i>0){
				starList.push(new StarParticle(Math.random()*canvasWidth, Math.random()*canvasHeight,0,starSpeeds[i].spd,randomInt(starSizeRange[0], starSizeRange[1])*starSpeeds[i].size,getHex(255,255,Math.random()*255),Math.random()/2));				
			}else{
				var star = { x: Math.random()*canvasWidth, y: Math.random()*canvasHeight, spd: starSpeeds[i].spd, size: randomInt(starSizeRange[0],starSizeRange[1])*starSpeeds[i].size, spd: starSpeeds[i].spd, alpha: Math.random()/2, color: getHex(255,255,Math.random()*255) };
				
				ctx.fillStyle = star.color;
				ctx.globalAlpha = star.alpha;
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.size, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill(); /**/
			}
		}
		if(i==0){	
			starImage.src = canvas.toDataURL();
		}
	}
}


var shipChange = 0;
var shipFrame = 0;

//Set Event Listeners
canvas.addEventListener('mousemove', function(evt){
		lastPos = mousePos;
        mousePos = getMousePos(canvas, evt);
		if(!paused && Math.abs(lastPos.x-mousePos.x)>2){
			if(lastPos.x<mousePos.x)shipFrame =1;
			else if(lastPos.x>mousePos.x)shipFrame =2;
			shipChange = 5;
		} 
    }, false);
	
canvas.addEventListener('mousedown', oMD, false);
canvas.addEventListener('mouseup', oMU, false);
addEventListener('keydown', oKD, false);

function oMD(){
	mouseDown = true;
}

function oMU(){
	mouseDown = false;
	curRate = 0;
}

function filesLoaded(){

	getScores();
	createStars();
	//Set startFrame to run at framerate
	setInterval(startFrame, 1000/fps);
	init();
}

//Initialize

function init(){
	removeEventListener("mousedown", oRetry);
	win = false;
	dead = false;
	paused = false;
	score = 0;
	health = 100;
	hit = 0;
	
	spread = 1;
	auto = true;
	bSize = 6;
	autoRate = 10;

	bulletList = [];
	enemyList = [];
	powerUpList = [];
	
	enemyPhase = 1;
	enemyPhaseLimit = 60;
	enemyPhaseFrames = 60;
	enemyPhaseFramesChange = 60;
	totalEnemyCount = 200;
	
	spawnEnemy();
}

function startFrame(){
	if(!paused)update();
	draw();
	/* if(!paused)update();
	draw();
	if(!paused)update();
	draw();
	if(!paused)update();
	draw();
	if(!paused)update();
	draw(); */
	
}

function update(){
	var nowTime = new Date();
	var diffTime = Math.ceil((nowTime.getTime() - lastTime.getTime()));
	
	if (diffTime >= 1000) {
		curFps = frameCount;
		frameCount = 0.0;
		lastTime = nowTime;
	}
	frameCount++;
	
	if(hit>0)hit--;
	
	var i = 0;
	for(i = 0; i< starList.length; i++){
		starList[i].update();		
	} 
	bgY++;
	if(bgY>0)
	bgY -= canvasHeight;
	for(i = 0; i< bulletList.length; i++){
		bulletList[i].update();		
	}
	for(i = 0; i< powerUpList.length; i++){
		powerUpList[i].x+=powerUpList[i].xSpd;
		powerUpList[i].y+=powerUpList[i].ySpd;
		var alive = true;
		if(distance(ship.x, ship.y, powerUpList[i].x, powerUpList[i].y)<60){
			if(powerUpList[i].type == "health"){
				health+=powerUpList[i].value;
				if(health>100)health = 100;
			}else if(powerUpList[i].type == "spread"){
				if(spread<5)spread++;
			}else if(powerUpList[i].type == "auto"){
				if(auto){
					if(autoRate>5)autoRate-=powerUpList[i].value;
				}else auto = true;
			}else if(powerUpList[i].type == "bSize"){
				if(bSize<10)bSize+=powerUpList[i].value;
			}
			powerUpList.splice(i,1);
			i--;
			alive = false;
		}
		if(alive)
			if(powerUpList[i].x<0 || powerUpList[i].x>canvasWidth || powerUpList[i].y<0 || powerUpList[i].y>canvasHeight){
				powerUpList.splice(i,1);
				i--;
			}
	}
	for(i = 0; i< particleList.length; i++){
		particleList[i].update();
	}
	for(i = 0; i< enemyList.length; i++){
		enemyList[i].update();
	}
	 if(enemyPhase<enemyPhaseLimit){
		enemyPhaseFrames--;
		if(enemyPhaseFrames<=0){
			enemyPhase++;
			enemyPhaseFrames = enemyPhaseFramesChange;
		}
	}
	if(enemyList.length<enemyPhase && totalEnemyCount>0&& randomInt(0,60) == 0){
		spawnEnemy();
	}
	
	if(mouseDown){
		if(curRate<=0){
			shootFrame = 3;
			spawnBullet();
			curRate = autoRate;
		}else curRate--;
	}
	if(!auto){
		mouseDown = false;
		curRate = 0;
	}
	if(shipChange>0)shipChange--;
	else{
		shipFrame = 0;
	}
	
	ship.x = mousePos.x;
	if(ship.x<50)ship.x = 50;
	else if(ship.x>canvasWidth-50)ship.x = canvasWidth-50;
	
}
function draw(){	
	ctx.drawImage(starImage, 0, bgY+canvasHeight);
	ctx.drawImage(starImage, 0, bgY);
	
	var i = 0;
	for(i = 0; i< starList.length; i++){
		starList[i].draw();		
	} 
	ctx.globalAlpha = 1;	
	for(i = 0; i< particleList.length; i++){
		particleList[i].draw();
	}	
	ctx.globalAlpha = 1;	
	for(i = 0; i< enemyList.length; i++){
		enemyList[i].draw();
	}
	for(var i = 0; i< bulletList.length; i++){
		bulletList[i].draw();
	}
	
	if (shipReady) {
		ctx.globalAlpha = 1;
		var yFrame = 0;
		if(shootFrame!=0){
			shootFrame--;
			yFrame = 1;
		}
		ctx.drawImage(shipImage, 90*shipFrame, 90*yFrame, 90, 90, ship.x-45, ship.y-20, 90, 90);
		/* if(hit)	
			ctx.drawImage(shipImageHit, ship.x-32, ship.y);
		else
			ctx.drawImage(shipImage, ship.x-32, ship.y); */
	}
	
	for(var i = 0; i< powerUpList.length; i++){
		ctx.drawImage(powerUpList[i].img, powerUpList[i].x-24, powerUpList[i].y-24);
	}
	
	ctx.save();
    
	ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px sans-serif';
	ctx.fillText('FPS: ' + curFps, 4, canvasHeight - 4);
	
	ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px sans-serif';
	ctx.fillText('Score: ' + score, canvasWidth-100, canvasHeight - 4);
	
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(8,  8, 204, 14);
	ctx.fillStyle = '#000000';
	ctx.fillRect(10,  10, 200, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillRect(10,  10, health*2, 10);
	
	if(paused){
		var message = "PAUSED";
		var tWidth;
		if(dead || win){
			ctx.font = 'bold 68px sans-serif';
			message = user;
			blinking--;
			if(blinking<=-20)blinking = 20;		
			if(blinking>0)message+="_";
			tWidth = ctx.measureText(user+"_");	
			outLineText(message, (canvasWidth/2)-(tWidth.width/2), canvasHeight/2+100, 2, '#FFFFFF', '#0000FF');
		
			ctx.font = 'bold 32px sans-serif';
			tWidth = ctx.measureText("Retry");
			retryPos = { x: (canvasWidth/2)-(tWidth.width/2), y: canvasHeight/2+170, w: tWidth.width, h: 32 };
			if(mousePos.x>retryPos.x && mousePos.x<retryPos.x+retryPos.w && mousePos.y<retryPos.y+12 && mousePos.y>retryPos.y-retryPos.h)
				outLineText("Retry", retryPos.x, retryPos.y, 2, '#FFFFFF', '#FF0000');	
			else
				outLineText("Retry", retryPos.x, retryPos.y, 1, '#FFFFFF', '#FF0000');
			
			if(dead) message = "GAME OVER";
			else message = "YOU WON!!!";	

		}
		ctx.font = 'bold 72px sans-serif';
		tWidth = ctx.measureText(message);		
		outLineText(message, (canvasWidth/2)-(tWidth.width/2), canvasHeight/2, 2, '#FFFFFF', '#FF0000');	
		
	}
    ctx.restore();
}

function oKD(event){
	if(win||dead){
		if(event.keyCode == 8 && user.length>0)user = user.slice(0, -1)
		else user+=String.fromCharCode(event.keyCode);
	}else
		if(event.keyCode == 80)paused = !paused;
		
}
	
function spawnBullet(){
	if(paused)return;
	for(var i = 0; i< spread; i++){
		var arr = spreadArray[spread-1];
		bulletList.push(new Bullet(ship.x, ship.y, arr[i][0], arr[i][1], bSize, "#ff0000", 1, enemyList));
	}
}	

function spawnEnemyBullet(enemy){
	bulletList.push(new Bullet(enemy.x, enemy.y, 0, 5, 6, "#00ff00", 10, ship));
}	

function spawnEnemy(){
	var ran = randomInt(0,8);
	if(ran == 0){
		enemyList.push(new Squirm(true));
	}else if(ran < 2){
		enemyList.push(new Diver());
	}else if(ran < 4){
		enemyList.push(new UFO());
	}else{
		enemyList.push(new Squirm(false));
	}
		
	totalEnemyCount--;
}

function spawnPowerUp(enemy){
	if(randomInt(0,4) == 0){
		var ran = randomInt(1,100);
		if(ran<30)powerUpList.push({x: enemy.x, y: enemy.y, xSpd:0, ySpd:5, value: 35, type: "health", img: healthPowerUpImage});
		else if(ran<50)powerUpList.push({x: enemy.x, y: enemy.y, xSpd:0, ySpd:5, value: 3, type: "auto", img: autoPowerUpImage});
		else if(ran<80)powerUpList.push({x: enemy.x, y: enemy.y, xSpd:0, ySpd:5, value: 1, type: "spread", img: spreadPowerUpImage});
		else powerUpList.push({x: enemy.x, y: enemy.y, xSpd:0, ySpd:5, value: 1, type: "bSize", img: bSizePowerUpImage});
	}
}

function killEnemy(enemy){
	for(var i = 0; i<12; i++){
		particleList.push(new FadingParticle(enemy.x, enemy.y, randomInt(-10,10), randomInt(-10,10), enemy.size/4, 0, enemy.color, 1, 0.02));
	}
}

function oRetry(){
	if(user!="")sendScore();
	if(mousePos.x>retryPos.x && mousePos.x<retryPos.x+retryPos.w && mousePos.y<retryPos.y+12 && mousePos.y>retryPos.y-retryPos.h)
		init();
}

function getScores(){
	/*if (window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}else{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			document.getElementById("scoreBoard").innerHTML=xmlhttp.responseText+"test";
		}
	}
	var params = "op=getGameScores&gameID=1";
	xmlhttp.open("POST","db/Leaderboards.php?op=getGameScores&gameID=1",true);
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(params);*/
}

function sendScore(){
	/*if (window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}else{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			getScores();
		}
	}
	var params = "op=setScore&username="+user+"&gameID=1&score="+score;
	xmlhttp.open("POST","db/Leaderboards.php",true);

	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(params);*/
}

function preventBackspaceHandler(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 8) {
        return false;
    }
}

document.onkeydown = preventBackspaceHandler;