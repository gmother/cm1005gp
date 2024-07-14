/*

The Game Project

Alexander Mavrin

*/

var acceleration = 3;
var jumpStartVelocity = 25;
var lrSpeed = 3;
var borderLimit = 20;
var topLimit = 100;

var bodyColor = "#8A2BE2";
var faceColor = "#FFE4C4";

var gameChar_x;
var gameChar_y;
var jumpVelocity = 0;
var floorPos_y;
var canyonPos_y;
var leftLimit;
var rightLimit;
var isLeft;
var isRight;
var isJump;
var isInCanyon;
var isFalling;
var isPlummeting;
var isDead;
var isReached;
var isRaised;

var isDialogOpened;
var isGameOverDialog;
var isNextLevelDialog;
var isDiedDialog;

var scores = 0;

var borderLeft = -512;
var borderRight = 1536;
var flagpole_x = 1480;
var collectable;

var trees_x = [];
var clouds = [];
var mountains = [];
var collectables = [];
var canyons = [];
var collectableNum = 3;
var curCanyon = 0;


var keyCodes = {left: 65, right: 68, jump: 32}; // top: 87, bottom: 83

function setup() {
	createCanvas(1024, 576);
    startGame();
}

function startGame() {
    scores = 0;
    lives = 3;
    resetScene();
}

function resetScene() {
	floorPos_y = height * 3/4;
    canyonPos_y = height - 10;
	gameChar_x = width/2;
	gameChar_y = floorPos_y - 50;
    leftLimit = borderLeft + borderLimit;
    rightLimit = borderRight - borderLimit;
    topLimit = 100;
    
    generateRandomCollectables();
    
    initTrees();
    initClouds();
    initMountains();
    initCanyons();

    isLeft = false;
    isRight = false;
    isJump = false;
    isInCanyon = false;
    isFalling = true;
    isPlummeting = false;
    isDead = false;
    isReached = false;
    isRaised = false;
}

function draw()
{
	background(100,155,255); //fill the sky blue
    
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height - floorPos_y); //draw some green ground
    
    push()
    translate(getCameraX(), 0)
    
	//draw the canyon
    drawCanyons();
    drawClouds();
    drawMountains();
    drawTrees();
    renderFlagpole();

    isInCanyon = isCharInCanyon();
    isPlummeting = isCharPlummeting();
    isDead = isCharDead();

	//the game character
	if(isDead)
    {
        drawCharDead();
    }
    else if (isRaised) {
        gameChar_y = floorPos_y;
		drawCharFF();
    }
    else if(isLeft && (isFalling || isPlummeting))
	{
        moveCharJump();
        moveCharLeft();
		drawCharJumpLeft();
    }
	else if(isRight && (isFalling || isPlummeting))
	{
        moveCharJump();
        moveCharRight();
		drawCharJumpRight();

	}
	else if(isLeft)
	{
        moveCharLeft();
		drawCharLeft();
	}
	else if(isRight)
	{
        moveCharRight();
		drawCharRight();

	}
	else if(isFalling || isPlummeting)
	{
        moveCharJump();
		drawCharJumpFF();
	}
	else
	{
		drawCharFF();
	}
    
    processAndDrawCollectables();
    
    pop();

    if(isDead)
    {
        if (lives > 0) {
            renderDiedDialog();
        } else {
            renderGameOverDialog();
        }
    }
    else if (isRaised) {
        renderNextLevelDialog();
    }
    
    drawButtons();
    drawLives();
    drawScores();
}

// Camera X coordinate related to character position and borders
function getCameraX()
{
    return max(min(floor(width / 2) - gameChar_x, borderRight - width), borderLeft);
    
}

function initTrees() {
    trees_x = [];
    start = floor(random(borderLeft, borderLeft + 200))
    for (i = start; i < borderRight+300; i += floor(random(200, 500))) {
        trees_x.push(i)
    }
}

function initClouds() {
    clouds = [];
    start = borderLeft - 200
    for (i = start; i < borderRight+200; i += floor(random(150, 300))) {
        clouds.push({x: i, y: floor(random(50, 300)), size: floor(random(80, 140))})
    }
}

function initMountains() {
    mountains = [];
    start = floor(random(borderLeft, borderLeft + 500))
    for (i = start; i < borderRight+400; i += floor(random(900, 1500))) {
        mountains.push({x: i, size: floor(random(150, 250))})
    }
}

function initCanyons() {
    canyons = [];
    start = floor(random(borderLeft+100, borderLeft + 500))
    for (i = start; i < borderRight-100; i += floor(random(500, 700))) {
        if (abs(i - gameChar_x) < 100) continue;
        canyons.push({x: i, width: floor(random(30, 40))})
    }
}

function moveCharLeft() 
{
    limit = isInCanyon ? canyons[curCanyon].x - canyons[curCanyon].width / 2 : leftLimit;
    gameChar_x = Math.max(gameChar_x - lrSpeed, limit);
}

function moveCharRight() 
{
    limit = isInCanyon ? canyons[curCanyon].x + canyons[curCanyon].width / 2 : rightLimit;
    gameChar_x = Math.min(gameChar_x + lrSpeed, limit);
}

function moveCharJump() 
{
    if (isInCanyon) {
        topLimit = floorPos_y + 1;
    }
    gameChar_y = Math.max(gameChar_y - jumpVelocity, topLimit);
    limit = getFloor();
    
    if (gameChar_y > limit) {
        gameChar_y = limit;
        isFalling = false;
        isPlummeting = false;
        jumpVelocity = 0;
    } else {
        jumpVelocity -= acceleration;
    }
}

function isCanyon() {
    for (i = 0; i < canyons.length; i++) {
        canyon = canyons[i];
        if (gameChar_x >= canyon.x - canyon.width / 2 && gameChar_x <= canyon.x + canyon.width / 2) {
            curCanyon = i
            return true;
        }
    }
    return false;
}

function isCharInCanyon()
{
    return isCanyon() && gameChar_y >= floorPos_y;
}

function isCharPlummeting() 
{
    return isCharInCanyon() && gameChar_y < canyonPos_y;
}

function isCharDead() 
{
    return isCharInCanyon() && gameChar_y == canyonPos_y;
}

function isCollectableReached(collectable)
{
    return gameChar_x > collectable.x - collectable.size / 2 - 10 &&
        gameChar_x < collectable.x + collectable.size / 2 + 10 &&
        gameChar_y < collectable.y + collectable.size / 2 + 70 &&
        gameChar_y > collectable.y - collectable.size / 2
}

function processAndDrawCollectables()
{
    for (var i = 0; i < collectables.length; i++) {
        
        if (isCollectableReached(collectables[i])) {
            scores = scores + collectables[i].score;
            collectables[i] = generateRandomCollectable();
        }
        drawCollectable(collectables[i]);
    }
}

function getFloor() {
    return isCanyon() ? canyonPos_y : floorPos_y
}

function generateRandomCollectables() {
    collectables = [];
    for (var i = 0; i < collectableNum; i++) {
        collectables.push(generateRandomCollectable())
    }
}

function generateRandomCollectable() {
    var maxJumpHeight = jumpStartVelocity * jumpStartVelocity / 2 / acceleration;
    var randomScore = floor(random(1, 6))
    
    return {
        x: floor(random(-300, width + 600)), 
        y: floorPos_y - 30 - floor(random(maxJumpHeight + 50)), 
        size: randomScore * 5 + 5,
        score: randomScore
    };
}

function keyPressed()
{
    if (keyCode == keyCodes.left) {
        isLeft = true;
    }
    if (keyCode == keyCodes.right) {
        isRight = true;
    }
    
    if (keyCode == keyCodes.jump) {
        if (isDead) {
            if (lives > 0) {
                lives--;
                resetScene();
                return;
            } else {
                startGame();
                return;
            }
        }

        if (isRaised) {
            resetScene();
            return;
        }


        isJump = true;
        if (!isFalling && !isPlummeting) {
            isFalling = true;
            jumpVelocity = jumpStartVelocity;
        }
    }
}

function keyReleased()
{
    if (keyCode == keyCodes.left) {
        isLeft = false;
    }
    if (keyCode == keyCodes.right) {
        isRight = false;
    }
    if (keyCode == keyCodes.jump) {
        isJump = false;
    }
}

function drawCharFF() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x - 2, gameChar_y - 68, gameChar_x - 5, gameChar_y - 68);
    line(gameChar_x + 2, gameChar_y - 68, gameChar_x + 5, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x - 11, gameChar_y - 16);
    vertex(gameChar_x - 8, gameChar_y - 1);
    vertex(gameChar_x - 12, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x + 11, gameChar_y - 16);
    vertex(gameChar_x + 8, gameChar_y - 1);
    vertex(gameChar_x + 12, gameChar_y - 1);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 17, gameChar_y - 43);
    vertex(gameChar_x - 14, gameChar_y - 29);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 17, gameChar_y - 43);
    vertex(gameChar_x + 14, gameChar_y - 29);
    endShape();
}

function drawCharLeft() {
    if (floor(gameChar_x / 20) % 2 == 0) {
        drawCharLeft1()
    } else {
        drawCharLeft2()
    }
}

function drawCharLeft1() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x - 3, gameChar_y - 68, gameChar_x - 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x - 11, gameChar_y - 16);
    vertex(gameChar_x - 8, gameChar_y - 1);
    vertex(gameChar_x - 12, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x - 1, gameChar_y - 16);
    vertex(gameChar_x + 8, gameChar_y - 1);
    vertex(gameChar_x + 4, gameChar_y - 1);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 11, gameChar_y - 39);
    vertex(gameChar_x - 23, gameChar_y - 35);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 17, gameChar_y - 43);
    vertex(gameChar_x + 14, gameChar_y - 29);
    endShape();
}

function drawCharLeft2() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x - 3, gameChar_y - 68, gameChar_x - 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x - 11, gameChar_y - 16);
    vertex(gameChar_x - 0, gameChar_y - 1);
    vertex(gameChar_x - 4, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x - 1, gameChar_y - 16);
    vertex(gameChar_x + 0, gameChar_y - 1);
    vertex(gameChar_x - 4, gameChar_y - 1);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 11, gameChar_y - 39);
    vertex(gameChar_x - 23, gameChar_y - 35);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 17, gameChar_y - 43);
    vertex(gameChar_x + 14, gameChar_y - 29);
    endShape();
}

function drawCharRight() {
    if (floor(gameChar_x / 20) % 2 == 0) {
        drawCharRight1()
    } else {
        drawCharRight2()
    }
}

function drawCharRight1() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x + 3, gameChar_y - 68, gameChar_x + 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x + 1, gameChar_y - 16);
    vertex(gameChar_x - 8, gameChar_y - 1);
    vertex(gameChar_x - 4, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x + 11, gameChar_y - 16);
    vertex(gameChar_x + 8, gameChar_y - 1);
    vertex(gameChar_x + 12, gameChar_y - 1);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 17, gameChar_y - 43);
    vertex(gameChar_x - 14, gameChar_y - 29);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 11, gameChar_y - 39);
    vertex(gameChar_x + 23, gameChar_y - 35);
    endShape();
}

function drawCharRight2() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x + 3, gameChar_y - 68, gameChar_x + 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x + 1, gameChar_y - 16);
    vertex(gameChar_x - 0, gameChar_y - 1);
    vertex(gameChar_x + 4, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x + 11, gameChar_y - 16);
    vertex(gameChar_x + 0, gameChar_y - 1);
    vertex(gameChar_x + 4, gameChar_y - 1);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 17, gameChar_y - 43);
    vertex(gameChar_x - 14, gameChar_y - 29);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 11, gameChar_y - 39);
    vertex(gameChar_x + 23, gameChar_y - 35);
    endShape();
}

function drawCharJumpFF() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x - 2, gameChar_y - 68, gameChar_x - 5, gameChar_y - 68);
    line(gameChar_x + 2, gameChar_y - 68, gameChar_x + 5, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x - 19, gameChar_y - 26);
    vertex(gameChar_x - 7, gameChar_y - 16);
    vertex(gameChar_x - 10, gameChar_y - 13);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x + 19, gameChar_y - 26);
    vertex(gameChar_x + 7, gameChar_y - 16);
    vertex(gameChar_x + 10, gameChar_y - 13);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 19, gameChar_y - 55);
    vertex(gameChar_x - 16, gameChar_y - 41);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 19, gameChar_y - 55);
    vertex(gameChar_x + 16, gameChar_y - 41);
    endShape();
}

function drawCharJumpLeft() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    line(gameChar_x - 3, gameChar_y - 68, gameChar_x - 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x - 18, gameChar_y - 25);
    vertex(gameChar_x - 15, gameChar_y - 10);
    vertex(gameChar_x - 18, gameChar_y - 8);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x - 1, gameChar_y - 16);
    vertex(gameChar_x + 8, gameChar_y - 1);
    vertex(gameChar_x + 4, gameChar_y - 1);
    endShape();
     
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 11, gameChar_y - 39);
    vertex(gameChar_x - 23, gameChar_y - 35);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 17, gameChar_y - 43);
    vertex(gameChar_x + 14, gameChar_y - 29);
    endShape();
}

function drawCharJumpRight() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 40, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x, gameChar_y - 66, 18, 18);
    stroke(1);
    line(gameChar_x + 3, gameChar_y - 68, gameChar_x + 6, gameChar_y - 68);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 27);
    vertex(gameChar_x + 1, gameChar_y - 16);
    vertex(gameChar_x - 8, gameChar_y - 1);
    vertex(gameChar_x - 4, gameChar_y - 1);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 27);
    vertex(gameChar_x + 18, gameChar_y - 25);
    vertex(gameChar_x + 15, gameChar_y - 10);
    vertex(gameChar_x + 18, gameChar_y - 8);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 51);
    vertex(gameChar_x - 17, gameChar_y - 43);
    vertex(gameChar_x - 14, gameChar_y - 29);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 51);
    vertex(gameChar_x + 11, gameChar_y - 39);
    vertex(gameChar_x + 23, gameChar_y - 35);
    endShape();
}

function drawCharDead() {
    // body
    fill(bodyColor);
    ellipse(gameChar_x, gameChar_y - 17, 18, 34);
    
    // head
    fill(faceColor);
    ellipse(gameChar_x + 4, gameChar_y - 35, 18, 18);
    stroke(1);
    line(gameChar_x - 2, gameChar_y - 33, gameChar_x + 2, gameChar_y - 37);
    line(gameChar_x - 2, gameChar_y - 37, gameChar_x + 2, gameChar_y - 33);
    line(gameChar_x + 6, gameChar_y - 33, gameChar_x + 10, gameChar_y - 37);
    line(gameChar_x + 6, gameChar_y - 37, gameChar_x + 10, gameChar_y - 33);
    
    // legs
    stroke(0);
    noFill();
    // left leg
    beginShape();
    vertex(gameChar_x - 5, gameChar_y - 2);
    vertex(gameChar_x - 19, gameChar_y - 6);
    vertex(gameChar_x - 7, gameChar_y - 16);
    vertex(gameChar_x - 10, gameChar_y - 19);
    endShape();
    // right leg
    beginShape();
    vertex(gameChar_x + 5, gameChar_y - 2);
    vertex(gameChar_x + 11, gameChar_y - 14);
    vertex(gameChar_x + 21, gameChar_y - 7);
    vertex(gameChar_x + 15, gameChar_y - 4);
    endShape();
    
    // hands
    // left hand
    beginShape();
    vertex(gameChar_x - 7, gameChar_y - 24);
    vertex(gameChar_x - 19, gameChar_y - 13);
    vertex(gameChar_x - 16, gameChar_y - 2);
    endShape();
    // right hand
    beginShape();
    vertex(gameChar_x + 7, gameChar_y - 24);
    vertex(gameChar_x + 19, gameChar_y - 13);
    vertex(gameChar_x + 16, gameChar_y - 2);
    endShape();
}

function drawClouds()
{
    for (i = 0; i < clouds.length; i++) {
        drawCloud(clouds[i]);
        clouds[i].x += 0.3 + (300 - clouds[i].y) / 400;
        if (clouds[i].x > borderRight+200) {
            clouds[i].x = borderLeft-200;
        }
    }
}

function drawTrees()
{
    for (i = 0; i < trees_x.length; i++) {
        drawTree(trees_x[i], floorPos_y);
    }
}

function drawMountains()
{
    for (i = 0; i < mountains.length; i++) {
        drawMountain(mountains[i]);
    }
}

function drawCanyons()
{
    for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
    }
}

function drawTree(x, y)
{
	noStroke();
    fill(205, 133, 63);
    rect(x - 5, y - 200, 10, 200);
    fill(107, 142, 35);
    ellipse(x, y - 212, 60, 120);
    ellipse(x - 20, y - 132, 80, 140);
    ellipse(x + 20, y - 162, 80, 120);
}

function drawCanyon(canyon)
{
	noStroke();
    fill(47, 79, 79);
    canyonHeight = height - floorPos_y;
    beginShape();
    xl = canyon.x - canyon.width / 2;
    xr = canyon.x + canyon.width / 2;
    vertex(xl - 10, floorPos_y);
    vertex(xl - 30, floorPos_y + canyonHeight * 0.33);
    vertex(xl - 15, floorPos_y + canyonHeight * 0.66);
    vertex(xl - 25, height);
    vertex(xr + 20, height);
    vertex(xr + 13, floorPos_y + canyonHeight * 0.60);
    vertex(xr + 25, floorPos_y + canyonHeight * 0.25);
    vertex(xr + 10, floorPos_y);
    endShape();
}

function drawCollectable(collectable)
{
	noStroke();
    fill(255, 165, 0);
    ellipse(collectable.x, collectable.y, collectable.size, collectable.size);
    fill(107, 142, 35);
    triangle(
        collectable.x, collectable.y - collectable.size / 2, 
        collectable.x, collectable.y - collectable.size / 2 - collectable.size / 3, 
        collectable.x + collectable.size / 3, collectable.y - collectable.size / 2 - collectable.size / 3
    );
}

function drawMountain(mountain)
{
	noStroke();
    fill(222, 184, 135);
    triangle(
        mountain.x, floorPos_y, 
        mountain.x + mountain.size * 3 / 4, floorPos_y, 
        mountain.x + mountain.size * 3 / 8, floorPos_y - mountain.size* 0.6
    );
    fill(160, 82, 45);
    triangle(
        mountain.x - mountain.size / 2, floorPos_y, 
        mountain.x + mountain.size / 2, floorPos_y, 
        mountain.x, floorPos_y - mountain.size * 0.8
    );
    fill(255, 250, 250);
    triangle(
        mountain.x - mountain.size * 0.15, floorPos_y - mountain.size * 0.8 + mountain.size * 0.24, 
        mountain.x + mountain.size * 0.15, floorPos_y - mountain.size * 0.8 + mountain.size * 0.24, 
        mountain.x, floorPos_y - mountain.size * 0.8
    );
}

function drawCloud(cloud)
{
	noStroke();
    fill(210, 210, 255);
    ellipse(cloud.x, cloud.y, cloud.size * 1.2, cloud.size * 0.6);
    ellipse(cloud.x + cloud.size * 0.4, cloud.y + cloud.size * 0.1, cloud.size * 0.8, cloud.size * 0.4);
    ellipse(cloud.x - cloud.size * 0.6, cloud.y + cloud.size * 0.2, cloud.size * 1.4, cloud.size * 0.5);
}

function renderFlagpole()
{
    checkReached();

    var flagTop = floorPos_y - 200;
    var flagBottom = floorPos_y - 50;

    if (isRaised) {
        flagY = flagTop;
    } else if (isReached) {
        flagY = max(flagTop, flagY - 5);
        if (flagY == flagTop) {
            isRaised = true;
        }
    } else {
        flagY = flagBottom;
    }

    stroke(160);
    strokeWeight(5);
    line(flagpole_x, floorPos_y, flagpole_x, floorPos_y - 200);
    noStroke();

    var raise = (flagBottom - flagY) / (flagBottom - flagTop);
    fill(160 * (1 - raise), 160 * raise, 0);
    triangle(
        flagpole_x, flagY, flagpole_x, flagY + 30, flagpole_x + 30, flagY + 15
    );
    strokeWeight(1);
}

function checkReached() 
{
    isReached = isReached || abs(gameChar_x - flagpole_x) < 20
}

function renderGameOverDialog()
{
    renderDialog("Game Over", "Press Space to restart game", "gray");
}

function renderNextLevelDialog()
{
    renderDialog("Next Level", "Press Space for next level", "green");
}

function renderDiedDialog()
{
    renderDialog("You Died", "Press Space to try again", "red");
}

function renderDialog(title, descr, color)
{
    stroke(color);
    strokeWeight(10);
    fill(0);
    rect(80, 80, width - 160, height - 160);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(150);
    noStroke();
    fill(color);
    text(title, width/2, 320);
    textSize(30);
    text(descr, width/2, 450);
}

function drawLives()
{
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(36);
    noStroke();
    fill("green");
    text("Lives: " + lives, 30, 40);
}

function drawScores()
{
    textAlign(RIGHT);
    textStyle(BOLD);
    textSize(36);
    noStroke();
    fill("gold");
    text("Scores: " + scores, width - 30, 40);
}

function drawButtons()
{
    textAlign(CENTER);
    textSize(24);
    textStyle(NORMAL)
    strokeWeight(2);
    noFill();
    stroke(isLeft ? "gold" : "gray");
    rect(10, height - 50, 40, 40);
    text("←", 30, height - 25);
    stroke(isJump ? "gold" : "gray");
    rect(55, height - 50, 40, 40);
    text("↑", 75, height - 25);
    stroke(isRight ? "gold" : "gray");
    rect(100, height - 50, 40, 40);
    text("→", 120, height - 25);
}
