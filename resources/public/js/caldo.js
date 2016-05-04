// welcome to caldo!
// note that phaser{.min}.js must be loaded for caldo.js to work.

var game =
    new Phaser.Game(
	480, 320,
	Phaser.AUTO,
	null, {
	    preload: preload,
	    create: create,
	    update: update
	});

var ball;
var paddle;

var bricks;
var newBrick;
var brickInfo;
var liveBricks;

var scoreText;
var score = 0;

var lives = 3;
var livesText;
var lifeLostText;

var playing = false;
var startButton;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
    game.load.image('ball','img/ball.png');
    game.load.image('paddle','img/paddle.png');
    game.load.image('brick','img/brick.png');
    game.load.spritesheet('ball','img/wobble.png',20,20);
    game.load.spritesheet('button','img/button.png',120,40);
}

function initBricks() {
    liveBricks = 0;
    brickInfo = {
	width: 50,
	height: 20,
	count: {
	    col: 7,
	    row: 3
	},
	offset: {
	    top: 50,
	    left: 60
	},
	padding: 10
    }

    bricks = game.add.group();
    for (c = 0; c < brickInfo.count.col; c++) {
	for (r = 0; r < brickInfo.count.row; r++) {

	    // create new brick and add to the group
	    var brickX =
		(c*(brickInfo.width+brickInfo.padding)) +
		brickInfo.offset.left;
	    var brickY =
		(r*(brickInfo.height+brickInfo.padding)) +
		brickInfo.offset.top;
	    newBrick =
		game.add.sprite(brickX, brickY, 'brick');
	    game.physics.enable(newBrick, Phaser.Physics.ARCADE);
	    newBrick.body.immovable = true;
	    newBrick.anchor.set(0.5);
	    bricks.add(newBrick);
	    liveBricks++;
	}
    }
    brickText.setText('Bricks: ' + liveBricks);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    ball = game.add.sprite(50,250,'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    paddle = game.add.sprite(game.world.width*0.5,
			     game.world.height-5,
			     'paddle');
    game.physics.enable(ball,Phaser.Physics.ARCADE);
    game.physics.enable(paddle,Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.body.gravity.y = 0;
    game.physics.arcade.checkCollision.down = false;

    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen,this);
    
    paddle.anchor.set(0.5,1);
    paddle.body.immovable = true;

    textStyle = { font: '18px Arial', fill: '#0095DD' };
    
    scoreText = game.add.text(5,5,'Points: 0',textStyle);
    

    brickText = game.add.text(200,5,'Bricks: ',textStyle);

    initBricks();
    
    livesText = game.add.text(game.world.width-5, 5, 'Lives: ' + lives,
			      textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5,
				 game.world.height*0.5,
				 'Life lost, click to continue',
				 textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;
    startButton = game.add.button(game.world.width*0.5,
				  game.world.height*0.5,
				  'button',
				  startGame, this,
				  1,0,2);
}

function startGame() {
    startButton.destroy()
    ball.body.velocity.set(150,-150);
    playing = true;
}

function ballLeaveScreen() {
    lives--;
    if (lives) {
	livesText.setText('Lives:'+lives);
	lifeLostText.visible = true;
	ball.reset(game.world.width*0.5,game.world.height-25);
	paddle.reset(game.world.width*0.5,game.world.height-5);
	game.input.onDown.addOnce(function() {
	    lifeLostText.visible = false;
	    ball.body.velocity.set(150,-150);
	},this);
    } else {
	alert('You lost, game over!');
	location.reload();
    }
}

function ballHitPaddle(ball,paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x - ball.x);
}

function ballHitBrick(ball,brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0.25,y:0.25},150,Phaser.Easing.Linear.Out,true,10);
    killTween.onComplete.addOnce(function() {
	brick.kill();
    }, this);
    killTween.start();
    ball.animations.play('wobble');
    score += 10;
    scoreText.setText('Points: ' + score);
    liveBricks--;
    brickText.setText('Bricks: ' + liveBricks);
    if (liveBricks == 0) {
	alert('You won the game, congratulations!');
	location.reload();
    }
}

function update() {
    game.physics.arcade.collide(ball,paddle,ballHitPaddle);
    game.physics.arcade.collide(ball,bricks,ballHitBrick);
    if (playing) {
	paddle.x = game.input.x || game.world.width*0.5;
    }
}
