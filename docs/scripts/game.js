// Blueprint for cow objects
function Cow(x1, x2, y1, y2, active){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.active = active;
}

// Game variables
var cows = [];
var numActiveCows = -1;

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
	cow.x2 = randValue(cow.x1, gameWidth);
	cow.y2 = randValue(0, cow.y1);
}