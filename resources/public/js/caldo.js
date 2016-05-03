// welcome to caldo!

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// ball
var ballRadius = 10;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;

// paddle
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth)/2;
var rightPressed = false;
var leftPressed = false;

// bricks
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

// initialize bricks
var bricks = [];
for (c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (r=0; r < brickRowCount; r++) {
	bricks[c][r] = {x: 0,
			y: 0};
    }
}

function drawBricks() {
    for (c = 0; c < brickColumnCount; c++) {
	for (r = 0; r < brickRowCount; r++) {
	    var brickX =
		(c * (brickWidth + brickPadding)) +
		brickOffsetLeft;
	    var brickY =
		(r * (brickHeight + brickPadding)) +
		brickOffsetTop;
	    bricks[c][r].x = brickX;
	    bricks[c][r].y = brickY;
	    ctx.beginPath();
	    ctx.rect(brickX, brickY,
		     brickWidth,brickHeight);
	    ctx.fillStyle = "#0095dd";
	    ctx.fill();
	    ctx.closePath();
	}
    }
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095dd";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    x += dx;
    y += dy;

    if ((y + dy - ballRadius < 0)) {
	// hit the top: bounce
	dy = -dy;
    } else if (y + dy > (canvas.height - ballRadius)) {
	if ((x > paddleX) &&
	    (x < (paddleX + paddleWidth))) {
	    dy = -dy; // player saved the ball!
	} else {
	    // hit the bottom: game over.
	    alert("GAME OVER");
	    document.location.reload();
	}
    }

    
    if ((x + dx - ballRadius < 0) || (x + dx > canvas.width - ballRadius)) {
	dx= -dx;
    }

    if (rightPressed && (paddleX < canvas.width - paddleWidth)) {
	paddleX += 7;
    }
    else if (leftPressed && (paddleX > 0)) {
	paddleX -= 7;
    }
}

setInterval(draw,10);

