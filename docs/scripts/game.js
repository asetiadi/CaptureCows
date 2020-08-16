// Game constants
var MAX_COWS = 6;
var MAX_ESCAPED = 5;
var MIN_SPAWN = 500;
var MIN_DESPAWN = 1000;
var REDUCE_DESPAWN = .001;
var REDUCE_SPAWN = .001;

// Important
var despawnTime = 7500;
var spawnDelay = 5000;

var isMobile = 
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ?
	 		true : false;

var VIDEOINTERVAL = 100,
	BUTTON_VIDEO = document.getElementById("enableVideo"),
	IMG_LEFT = new Image(),
	IMG_RIGHT = new Image(),
	FRAME_COWS = 7,
	WIDTH_COWS = 71,
	HEIGHT_COWS = 44,
	DELAY_ANIM = 100,
	SCREEN_START = document.getElementById("gridContainer"),
	SCREEN_VIDEO = document.getElementById("videoOverlay"),
	SCREEN_GAME = document.getElementById("gameScreen"),
	TEXT_SCORE = document.getElementById("score"),
	TEXT_ESCAPED = document.getElementById("escaped"),
	AUDIO_MOO = new Audio("assets/moo.wav");

IMG_RIGHT.src = "assets/cow_new_right.png";
IMG_LEFT.src = "assets/cow_new_left.png";

function HandBox() {
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 1;
	this.y2 = 1;
	this.width = 1;
	this.height = 1;
}

var video = document.getElementById("myvideo"),
	hand = new HandBox(),
	isVideo = false,
	modelParams = {
	    flipHorizontal : true, // flip e.g for video  
	    maxNumBoxes : 1, // maximum number of boxes to detect
	    iouThreshold : 0.5, // ioU threshold for non-max suppression
	    scoreThreshold : 0.6 // confidence threshold for predictions.
	},
	model = null;

// Blueprint for cow objects
function Cow(x1, x2, y1, y2, active, width, height){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.active = active;
	this.width = -1;
	this.height = -1;
	this.spawned = Date.now();
	this.left = false;
	this.lastAnim = -1;
	this.frame = 0;
}

// Game variables
var cows = [];
var numActiveCows = 0;
var canv = document.getElementById("gameCanvas");
var ctx = null;
var lastVideoUpdate = -1;

var WIDTH = 1024;
var HEIGHT = 768;
var gameWidth = 1024;
var gameHeight = 768;
var modelLoaded = false;
var score = 0;
var escaped = 0;
if( ( WIDTH / window.screen.width ) <= ( HEIGHT / window.screen.height ) ) {
	gameWidth = WIDTH;
	gameHeight = ( window.screen.height * ( WIDTH / window.screen.width ) ) | 0;
} else {
	gameHeight = HEIGHT;
	gameWidth = ( window.screen.width * ( WIDTH / window.screen.height ) ) | 0;
}


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

function toggleOverlay() {
	if(SCREEN_VIDEO.getAttribute("class") == "hide") {
		SCREEN_VIDEO.setAttribute("class", "show");
	} else {
		SCREEN_VIDEO.setAttribute("class", "hide");
	}
}

// Spawns a cow in the game
function spawnCows(time){
	if (numActiveCows == MAX_COWS){
		return;
	}
	var active_index = getActiveCows();
	var cow = cows[active_index];
	if(cows[active_index] == undefined || cows[active_index] == null) console.log(active_index);
	var cont = true;
	cow.active = true;
	while( cont ) {
		cont = false;
		cow.x1 = randValue(WIDTH_COWS, gameWidth - WIDTH_COWS * 2);
		cow.y1 = randValue(HEIGHT_COWS, gameHeight - HEIGHT_COWS * 2);
		cow.x2 = randValue(cow.x1 + WIDTH_COWS, ( gameWidth - WIDTH_COWS ) - Math.floor(0.5 * ((gameWidth- WIDTH_COWS) - (cow.x1 + WIDTH_COWS))));
		cow.y2 = randValue(cow.y1 + HEIGHT_COWS, (gameHeight- HEIGHT_COWS) - Math.floor(0.5 * ((gameHeight- HEIGHT_COWS)- (cow.y1 + HEIGHT_COWS))));
		if( cow.y2 > gameHeight || cow.x2 > gameWidth ) cont = true;
		cow.width = cow.x2 - cow.x1;
		cow.height = cow.y2 - cow.y1;
		for(i = 0; i < MAX_COWS; i++){
			if(cows[i].active == true && cow != cows[i]){
				if(overlapCows(cows[i],cow)) {
					cont = true;
				}
			}
		}
		console.log("huh");
	}
	cow.lastAnim = -1;
	cow.frame = 0;
	cow.left = ( ( Math.random() * 2 ) | 0 ) == 0;
	cow.spawned = time;
	numActiveCows++;
}

canv.width = gameWidth;
canv.height = gameHeight;
ctx = canv.getContext("2d");
ctx.imageSmoothingEnabled = false;

function drawCows(time){
	// clears the canvas
	ctx.clearRect(0, 0, canv.width, canv.height);
	for(i = 0; i < MAX_COWS; i++){
		if(cows[i].active == true){
			if(cows[i].lastAnim == -1) cows[i].lastAnim = time;
			if(time - cows[i].lastAnim > DELAY_ANIM) {
				cows[i].frame = (cows[i].frame + 1) % FRAME_COWS;
				cows[i].lastAnim = time;
			}
			ctx.drawImage(cows[i].left ? IMG_LEFT : IMG_RIGHT, cows[i].frame * WIDTH_COWS, 0, WIDTH_COWS, HEIGHT_COWS, cows[i].x1, cows[i].y1, cows[i].width, cows[i].height);
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

var lastSpawn = -1;
function game_loop( time ) {
	if(lastSpawn == -1) {
		spawnCows(time);
		lastSpawn = time;
	}
	var contained = 0,
		kill = null;
	for(i = 0; i < MAX_COWS; i++){
		if(cows[i].active == true){
			if(time - cows[i].spawned >= despawnTime) {
				numActiveCows--;
				cows[i].active = false;
				TEXT_ESCAPED.innerHTML = (++escaped);
				continue;
			}
			if(containCows(hand, cows[i])) {
				++contained;
				kill = cows[i];
			}
		}
	}
	if( contained == 1 ) {
		kill.active = false;
		numActiveCows--;
		AUDIO_MOO.play();
		TEXT_SCORE.innerHTML = (++score).toString();
	}
	if(time - lastSpawn >= spawnDelay && numActiveCows < MAX_COWS) {
		spawnCows(time);
		lastSpawn = time;
	}
    drawCows(time);
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 5;
    ctx.strokeRect(hand.x1 - 3, hand.y1 - 3, hand.width + 3, hand.height + 3);
    if( isVideo ) {
    	if( lastVideoUpdate == -1 ) lastVideoUpdate = time;
    	if( time - lastVideoUpdate >= VIDEOINTERVAL ) {
    		model.detect(video).then(parsePredictions);
    	}
    }
    spawnDelay -= REDUCE_SPAWN;
    despawnTime -= REDUCE_DESPAWN;
    if(spawnDelay < MIN_SPAWN) spawnDelay = MIN_SPAWN;
    if(despawnTime < MIN_DESPAWN) spawnDelay = MIN_DESPAWN;
    if(escaped<MAX_ESCAPED) {
	    window.requestAnimationFrame( game_loop );
	} else {
		firebase.database().ref("/scores").push().set({
			score : score
		}, function(err) {
			if( err ) return;
			firebase.database().ref("/scores").orderByChild( "score" ).limitToLast(1).once( "value" ).then( function( snapshot ) {
				snapshot.forEach( function( snap ) {
					var s = snap.val().score;
					if( s == score ) {
						alert( "You lost! But you set the all-time record!" );
					} else {
						alert( "You lost! The highest score ever is " + ss );
					}
				} );
			} );
		});
	}
}

function onVideoStart(status) {
    console.log("video started", status);
    if (status) {
        isVideo = true
        model.detect(video).then(parsePredictions);
        window.requestAnimationFrame( game_loop );
    } else {
        
    }
}

function onButtonVideoPress() {
	AUDIO_MOO.play();
	if(window.matchMedia("(orientation:landscape)").matches) {
		SCREEN_START.setAttribute( "class", "hide" );
		SCREEN_GAME.setAttribute( "class", "show" );
		toggleOverlay();
		SCREEN_GAME.addEventListener(isMobile ? "touchend" : "click", toggleOverlay);
		SCREEN_VIDEO.addEventListener(isMobile ? "touchend" : "click", toggleOverlay)
    	handTrack.startVideo(video).then(onVideoStart);
	} else {
		alert("Please play in landscape mode");
	}
}

function parsePredictions( predictions ) {
    var p = predictions[0];
    var vwidth = video.width;
    var vheight = video.height;
    var xScale = gameWidth / vwidth;
    var yScale = gameHeight / vheight;
    if (p) {
    	console.log( p.bbox );
    	hand.x1 = p.bbox[0] * xScale;
    	hand.y1 = p.bbox[1] * yScale;
    	hand.width = p.bbox[2] * xScale;
    	hand.height = p.bbox[3] * yScale;
    	hand.x2 = hand.x1 + hand.width;
    	hand.y2 = hand.y1 + hand.height;
    	
    }
}

function onHandTrackLoad( lmodel ) {
	console.log("loaded");
    model = lmodel;
    modelLoaded = true;
    BUTTON_VIDEO.innerHTML = "Start Game";
    BUTTON_VIDEO.addEventListener("click", onButtonVideoPress);
}

handTrack.load(modelParams).then(onHandTrackLoad);