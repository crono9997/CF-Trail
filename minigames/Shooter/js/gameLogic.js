//Get Canvas object, store canvas width and height, and fill screen black.
var canvas = document.getElementById('canvas');
var canvasWidth  = canvas.width;
var canvasHeight = canvas.height;
var starBgCtx = canvas.getContext('2d');
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';
ctx.fillRect(0,  0, canvasWidth, canvasHeight);
var blankImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

//Set FPS and initialize FPS vars
var fps = 60;
var curFps = 0;
var lastTime = new Date();
var frameCount = 0;

var mouseDown = false;

getScores();

//Set startFrame to run at framerate
setInterval(startFrame, 1000/fps);

//Load textures
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
	shipReady = true;
};
shipImage.src = "img/spaceShip.png";

var shipImageHit = new Image();
shipImageHit.src = "img/spaceShipHit.png";

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

var enemyBulletList = [];
var bulletList = [];
var enemyList = [];
var enemyBodyList = [];
var enemyDeathList = [];
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
var autoRate = 30;
var curRate = 0;

var bSize = 6;

var enemyPhase = 1;
var enemyPhaseLimit = 30;
var enemyPhaseFrames = 0;
var enemyPhaseFramesChange = 180;
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
				{ spd:10, count: 50, size:1 },
];
var starLayers = [];
var starImage = new Image();
var bgY = canvasHeight*-1;

function createStars(){

	for(var i = 0; i< starSpeeds.length; i++){
		for(var j = 0; j< starSpeeds[i].count; j++){
			if(i>0){
				starList.push( { x: Math.random()*canvasWidth, y: Math.random()*canvasHeight, spd: starSpeeds[i].spd, size: randomInt(starSizeRange[0], starSizeRange[1])*starSpeeds[i].size, spd: starSpeeds[i].spd, alpha: Math.random()/2, color: getHex(255,255,Math.random()*255) }); 
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
createStars();

//Set Event Listeners
canvas.addEventListener('mousemove', function(evt){
        mousePos = getMousePos(canvas, evt);
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

//Initialize
init();
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
	autoRate = 30;

	enemyBulletList = [];
	bulletList = [];
	enemyList = [];
	enemyBodyList = [];
	enemyDeathList = [];
	powerUpList = [];
	
	enemyPhase = 1;
	enemyPhaseLimit = 30;
	enemyPhaseFrames = 180;
	enemyPhaseFramesChange = 360;
	totalEnemyCount = 100;
	
	spawnEnemy();
}

function startFrame(){
	if(!paused)update();
	draw();
	
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
		starList[i].y+=starList[i].spd;
		if(starList[i].y>canvasHeight)starList[i].y = -20;
		
	} 
	bgY++;
	if(bgY>0)
	bgY -= canvasHeight;
	for(i = 0; i< bulletList.length; i++){
		bulletList[i].x+=bulletList[i].xSpd;
		bulletList[i].y+=bulletList[i].ySpd;
		var alive = true;
		for(var j = 0; j< enemyList.length; j++){
			if(distance(enemyList[j].x, enemyList[j].y, bulletList[i].x, bulletList[i].y)<enemyList[j].size+bSize){
				score+= enemyList[j].score;
				spawnPowerUp(enemyList[j]);
				killEnemy(enemyList[j]);
				enemyList.splice(j,1);
				if(enemyList.length == 0 && totalEnemyCount == 0){
					win = true;
					paused = true;
					addEventListener("mousedown", oRetry);
				}
				bulletList.splice(i,1);
				alive = false
				i--;
				break;
			}
		}
		if(alive)
			if(bulletList[i].x<0 || bulletList[i].x>canvasWidth || bulletList[i].y<0 || bulletList[i].y>canvasHeight){
				bulletList.splice(i,1);
				i--;
			}
	}
	for(i = 0; i< enemyBulletList.length; i++){
		enemyBulletList[i].x+=enemyBulletList[i].xSpd;
		enemyBulletList[i].y+=enemyBulletList[i].ySpd;
		var alive = true;
		if(distance(ship.x, ship.y, enemyBulletList[i].x, enemyBulletList[i].y)<32){
			health-=enemyBulletList[i].damage;
			if(health<=0){
				health = 0;
				dead = true;
				paused = true;
				addEventListener("mousedown", oRetry);
			}
			hit = 5;
			enemyBulletList.splice(i,1);
			i--;
			alive = false;
		}
		if(alive)
			if(enemyBulletList[i].x<0 || enemyBulletList[i].x>canvasWidth || enemyBulletList[i].y<0 || enemyBulletList[i].y>canvasHeight){
				enemyBulletList.splice(i,1);
				i--;
			}
	}
	for(i = 0; i< powerUpList.length; i++){
		powerUpList[i].x+=powerUpList[i].xSpd;
		powerUpList[i].y+=powerUpList[i].ySpd;
		var alive = true;
		if(distance(ship.x, ship.y, powerUpList[i].x, powerUpList[i].y)<32){
			if(powerUpList[i].type == "health"){
				health+=powerUpList[i].value;
				if(health>100)health = 100;
			}else if(powerUpList[i].type == "spread"){
				if(spread<5)spread++;
			}else if(powerUpList[i].type == "auto"){
				if(auto){
					if(autoRate>10)autoRate-=powerUpList[i].value;
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
	for(i = 0; i< enemyBodyList.length; i++){
		enemyBodyList[i].alpha-=0.05;
		enemyBodyList[i].size-=0.2;
		if(enemyBodyList[i].alpha<=0){
			enemyBodyList.splice(i,1);
			i--;
		}
	}
	for(i = 0; i< enemyDeathList.length; i++){
		enemyDeathList[i].x+=enemyDeathList[i].xSpd;
		enemyDeathList[i].y+=enemyDeathList[i].ySpd;
		enemyDeathList[i].alpha-=0.02;
		if(enemyDeathList[i].alpha<=0){
			enemyDeathList.splice(i,1);
			i--;
		}
	}
	for(i = 0; i< enemyList.length; i++){
		enemyList[i].xSpd+= randomInt(-2,2);
		enemyList[i].ySpd+= randomInt(-2,2);
		
		if(enemyList[i].xSpd>enemyList[i].limit)enemyList[i].xSpd=enemyList[i].limit;
		else if(enemyList[i].xSpd<enemyList[i].limit*-1)enemyList[i].xSpd=enemyList[i].limit*-1;
		if(enemyList[i].ySpd>enemyList[i].limit)enemyList[i].ySpd=enemyList[i].limit;
		else if(enemyList[i].ySpd<enemyList[i].limit*-1)enemyList[i].ySpd=enemyList[i].limit*-1;
		
		enemyList[i].x+=enemyList[i].xSpd;
		enemyList[i].y+=enemyList[i].ySpd;
		if(enemyList[i].y<0)enemyList[i].ySpd = Math.abs(enemyList[i].ySpd);
		if(enemyList[i].y>canvasHeight-100)enemyList[i].ySpd = Math.abs(enemyList[i].ySpd)*-1;
		if(enemyList[i].x<0)enemyList[i].xSpd = Math.abs(enemyList[i].xSpd);
		if(enemyList[i].x>canvasWidth)enemyList[i].xSpd = Math.abs(enemyList[i].xSpd)*-1;
		
		enemyBodyList.push({ x: enemyList[i].x, y: enemyList[i].y, color: enemyList[i].color, size: enemyList[i].size, alpha: 1 }); 
		
		if(randomInt(0,120) == 0)spawnEnemyBullet(enemyList[i]);
		if(enemyList[i].score>50)enemyList[i].score--;
	}
	 if(enemyPhase<enemyPhaseLimit){
		enemyPhaseFrames--;
		if(enemyPhaseFrames<=0){
			enemyPhase++;
			enemyPhaseFrames = enemyPhaseFramesChange;
		}
	}
	if(enemyList.length<enemyPhase && totalEnemyCount>0&& randomInt(0,180) == 0){
		spawnEnemy();
	}
	
	if(mouseDown){
		//console.log(curRate);
		if(curRate<=0){
			spawnBullet();
			curRate = autoRate;
		}else curRate--;
	}
	if(!auto){
		mouseDown = false;
		curRate = 0;
	}
	
	ship.x = mousePos.x;
	
}
function draw(){	
	ctx.drawImage(starImage, 0, bgY+canvasHeight);
	ctx.drawImage(starImage, 0, bgY);
	
	var i = 0;
	for(i = 0; i< starList.length; i++){
		ctx.fillStyle = starList[i].color;
		ctx.globalAlpha = starList[i].alpha;
		ctx.beginPath();
		ctx.arc(starList[i].x, starList[i].y, starList[i].size, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	} 
	if (shipReady) {
		ctx.globalAlpha = 1;
		if(hit)	
			ctx.drawImage(shipImageHit, ship.x-32, ship.y);
		else
			ctx.drawImage(shipImage, ship.x-32, ship.y);
	}
	for(i = 0; i< enemyBodyList.length; i++){
		ctx.fillStyle = enemyBodyList[i].color;
		ctx.globalAlpha = enemyBodyList[i].alpha;
		ctx.beginPath();
		ctx.arc(enemyBodyList[i].x, enemyBodyList[i].y, enemyBodyList[i].size, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	ctx.globalAlpha = 1;		
	for(i = 0; i< enemyDeathList.length; i++){
		ctx.fillStyle = enemyDeathList[i].color;
		ctx.globalAlpha = enemyDeathList[i].alpha;
		ctx.beginPath();
		ctx.arc(enemyDeathList[i].x, enemyDeathList[i].y, enemyDeathList[i].size, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	
	ctx.globalAlpha = 1;	
	for(i = 0; i< enemyList.length; i++){
		ctx.fillStyle = enemyList[i].color;
		ctx.beginPath();
		ctx.arc(enemyList[i].x, enemyList[i].y, enemyList[i].size, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	for(var i = 0; i< bulletList.length; i++){
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(bulletList[i].x, bulletList[i].y, bSize, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(bulletList[i].x, bulletList[i].y, bSize-3, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	
	for(var i = 0; i< enemyBulletList.length; i++){
		ctx.drawImage(enemyBulletImage, enemyBulletList[i].x-8, enemyBulletList[i].y-8);
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
		bulletList.push({x: ship.x, y: ship.y, xSpd:arr[i][0], ySpd:arr[i][1]});
	}
}	

function spawnEnemyBullet(enemy){
	enemyBulletList.push({x: enemy.x, y: enemy.y, xSpd:0, ySpd:5, damage: 10});
}	

function spawnEnemy(){
	enemyList.push({x: Math.random()*canvasWidth, y: -50, xSpd:randomInt(-5,5), ySpd:randomInt(0,5), limit:5, color: '#'+Math.floor(Math.random()*16777215).toString(16), size:randomInt(10,20), score: 1000});
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
		enemyDeathList.push({ x: enemy.x, y: enemy.y, size:enemy.size/4, color:enemy.color, alpha: 1, xSpd: randomInt(-10,10), ySpd: randomInt(-10,10) });
	}
}

function oRetry(){
	if(user!="")sendScore();
	if(mousePos.x>retryPos.x && mousePos.x<retryPos.x+retryPos.w && mousePos.y<retryPos.y+12 && mousePos.y>retryPos.y-retryPos.h)
		init();
}

function getScores(){
	 if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			document.getElementById("scoreBoard").innerHTML=xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET","../db/Leaderboards.php?op=getGameScores&gameID=1",true);
	xmlhttp.send(); /**/
}

function sendScore(){
	 if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			getScores();
			//document.getElementById("scoreBoard").innerHTML=xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET","../db/Leaderboards.php?op=setScore&username="+user+"&gameID=1&score="+score,true);
	xmlhttp.send(); /**/
}

function preventBackspaceHandler(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 8) {
        return false;
    }
}

document.onkeydown = preventBackspaceHandler;
