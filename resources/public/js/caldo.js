// welcome to caldo!
// note that phaser{.min}.js must be loaded for caldo.js to work.

var game =
    new Phaser.Game(
	600,400,
	Phaser.AUTO,
	"gamecontainer", {
	    preload: preload,
	    create: create,
	    update: update
	});

// globals
var word;
var shelf;

// methods

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
    game.load.image('word','img/ball.png');
    game.load.image('shelf','img/brick.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    word = game.add.sprite(20,5,'word')
    shelf = game.add.sprite(20,250,'shelf')

    game.physics.enable(word,Phaser.Physics.ARCADE);
    word.body.gravity.y = 100.0; // word is falling.
    word.body.bounce.set(0.5);
    word.body.collideWorldBounds = true;

    game.physics.enable(shelf,Phaser.Physics.ARCADE);
    shelf.body.gravity.y = 0; // shelf is floating in the air.
    shelf.body.bounce.set(0.5);
    shelf.body.collideWorldBounds = true;
    shelf.body.immovable = true;

}

function wordHitShelf(word,shelf) {
    foo = 32;
}

function update() {
    game.physics.arcade.collide(word,shelf,wordHitShelf);
}

