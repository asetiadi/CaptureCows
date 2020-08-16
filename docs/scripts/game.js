// Blueprint for cow objects
function Cow(x1, x2, y1, y2, active, width, height){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.active = active;
	this.width = -1;
	this.height = -1;
}

// Game variables
var cows = [];
var numActiveCows = -1;
var canv = document.getElementById("gameCanvas");
var ctx = null;

// Game constants
var MAX_COWS = 6;
var gameWidth = 1280;
var gameHeight = 720;

// Initialize cows
for (i = 0; i < MAX_COWS; i++){
	cows.push(new Cow(-1, -1, -1, -1, false));
}

// Randomly generate numbers
function randValue(lowerBound, upperBound){
	return Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);
}

// Gets the first non-active cow
function getActiveCows(){

	var firstActiveIndex = -1;

	for (i = 0; i < MAX_COWS; i++){
		if (cows[i].active == false){
			firstActiveIndex = i;
			return firstActiveIndex;
		}
	}
}

// Spawns a cow in the game
function spawnCows(){
	if (numActiveCows == MAX_COWS){
		return;
	}
	var active_index = getActiveCows();
	var cow = cows[active_index];
	cow.active = true;
	cow.x1 = randValue(0, gameWidth);
	cow.y1 = randValue(0, gameHeight);
	cow.x2 = randValue(cow.x1, gameWidth - Math.floor(0.5 * (gameWidth - cow.x1)));
	cow.y2 = randValue(cow.y1, gameHeight - Math.floor(0.5 * (gameHeight - cow.x1)));
	cow.width = cow.x2 - cow.x1;
	cow.height = cow.y2 - cow.y1;
	numActiveCows ++;
}

canv.width = gameWidth;
canv.height = gameHeight;
ctx = canv.getContext("2d");
ctx.fillStyle = "#000000";
// fills a rectangle
ctx.fillRect(0, 0, gameWidth, gameHeight);

function drawCows(){
	// clears the canvas
	ctx.clearRect(0, 0, canv.width, canv.height);
	for(i = 0; i < MAX_COWS; i++){
		if(cows[i].active == true){
			ctx.fillRect(cows[i].x1, cows[i].y1, cows[i].width, cows[i].height);
		}
	}
}

function overlapCows(cow1, cow2){
	if(cow1.x1 >= cow2.x2 || cow2.x1 >= cow1.x2){
		return false;
	}

	if(cow1.y1 >= cow2.y2 || cow2.y1 >= cow1.y2){
		return false;
	}
	return true;
}

function containCows(cow1, cow2){
	if((cow1.y1 <= cow2.y1 && cow2.y2 <= cow1.y2) && (cow1.x1 <= cow2.x1 && cow2.x2 <= cow1.x2)){
		return true;
	}
	else{
		return false;
	}
}

function game_loop( time ){
    drawCows();
    window.requestAnimationFrame( game_loop );
}

window.requestAnimationFrame( game_loop );