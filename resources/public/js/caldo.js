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

var scoreText;
var score = 0;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
    game.load.image('ball','img/ball.png');
    game.load.image('paddle','img/paddle.png');
    game.load.image('brick','img/brick.png');
}

function initBricks() {
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
	}
    }

}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    ball = game.add.sprite(game.world.width*0.5,
			   game.world.height-25,'ball');
    paddle = game.add.sprite(game.world.width*0.5,
			     game.world.height-5,
			     'paddle');
    game.physics.enable(ball,Phaser.Physics.ARCADE);
    game.physics.enable(paddle,Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.velocity.set(125,-250);
    ball.body.bounce.set(1);
    ball.body.gravity.y = 15;
    game.physics.arcade.checkCollision.down = false;

    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(function() {
	alert('game over!');
	location.reload();
    },this);
    
    paddle.anchor.set(0.5,1);
    paddle.body.immovable = true;

    initBricks();

    scoreText = game.add.text(5,5,'Points: 0',
			      {font: '18px Arial',
			       fill: '#0095dd'});
    
}

function ballHitBrick(ball,brick) {
    brick.kill();
    score += 10;
    scoreText.setText('Points: ' + score);
}

function update() {
    game.physics.arcade.collide(ball,paddle);
    game.physics.arcade.collide(ball,bricks,ballHitBrick);
    paddle.x = game.input.x || game.world.width*0.5;
}
