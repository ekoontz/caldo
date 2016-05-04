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
	    row: 3,
	    col: 7
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
		(r*(brickInfo.width+brickInfo.padding)) +
		brickInfo.offset.left;
	    var brickY =
		(c*(brickInfo.height+brickInfo.padding)) +
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
    
}

function update() {
    game.physics.arcade.collide(ball,paddle);
    paddle.x = game.input.x || game.world.width*0.5;
}
