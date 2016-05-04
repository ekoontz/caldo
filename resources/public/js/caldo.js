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
var words;
var word;
var shelves;
var num_words_at_a_time = 10;
var num_shelves = 5;

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

    shelves = game.add.group();
    for (c = 0; c < num_shelves; c++) {
	shelf = game.add.sprite((83*c)+9,game.world.height*0.9,'shelf')
	game.physics.enable(shelf,Phaser.Physics.ARCADE);
	shelf.body.gravity.y = 0; // shelf is floating in the air.
	shelf.body.bounce.set(0.9);
	shelf.body.collideWorldBounds = true;
	shelf.body.immovable = true;
	shelves.add(shelf);
    }
    
    words = game.add.group();
    for (c = 0; c < num_words_at_a_time; c++) {
	word = game.add.sprite((38*c)+10,5*c,'word')
	game.physics.enable(word,Phaser.Physics.ARCADE);
	word.body.gravity.y = 100.0; // word is falling.
	word.body.bounce.set(0.5);
	word.body.collideWorldBounds = true;
	words.add(word);
    }

    style = { font: "32px Arial",
		  fill: "#ff0044",
		  wordWrap: true,
		  align: "center",
		  backgroundColor: "#ffff00" };

    text = game.add.text(100, 100, "parlare", style);
    text.anchor.set(0.5);

    
}

function wordHitShelf(word,shelf) {
    foo = 32;
}

function update() {
    game.physics.arcade.collide(words,shelves,wordHitShelf);
}

