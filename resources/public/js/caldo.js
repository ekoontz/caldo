// welcome to caldo!
// note that phaser{.min}.js must be loaded for caldo.js to work.

var game =
    new Phaser.Game(
	480,320,
	Phaser.AUTO,
	null, {
	    preload: preload,
	    create: create,
	    update: update
	});

// globals
var word;

// methods

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
    game.load.image('word','img/brick.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    word = game.add.sprite(5,5,'word')
    game.physics.enable(word,Phaser.Physics.ARCADE);
    word.body.gravity.y = 100.0;
    word.body.bounce.set(0.5);
    word.body.collideWorldBounds = true;

}

function update() {
}
