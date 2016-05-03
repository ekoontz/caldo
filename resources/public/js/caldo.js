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

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
    game.load.image('ball','img/ball.png');
}


function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    ball = game.add.sprite(50,100,'ball');
    game.physics.enable(ball,Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.velocity.set(10,-100);
    ball.body.bounce.set(0.5);
    ball.body.gravity.y = 15;
}

function update() {
}
