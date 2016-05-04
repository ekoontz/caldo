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

// global constants
var num_words_at_a_time = 3;
var num_shelves = 3;
var newWordInterval = 2000;

// globals variables
var words;
var word;
var shelves;
var text;

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
	shelf = game.add.sprite((150*c)+100,game.world.height*0.9,'shelf')
	game.physics.enable(shelf,Phaser.Physics.ARCADE);
	shelf.body.gravity.y = 0; // shelf is floating in the air.
	shelf.body.bounce.set(0.9);
	shelf.body.collideWorldBounds = true;
	shelf.body.immovable = true;
	shelves.add(shelf);
    }
    
    words = game.add.group();
}

function wordHitShelf(word,shelf) {
    foo = 32;
}

function update() {
    game.physics.arcade.collide(words,shelves,wordHitShelf);
    game.physics.arcade.collide(words,words,wordHitShelf);
}

var intervalID = window.setInterval(function() {newWord(0);},
				    newWordInterval);
var intervalID = window.setInterval(function() {newWord(1);},
				    newWordInterval*2);
var intervalID = window.setInterval(function() {newWord(2);},
				    newWordInterval*3);

var shelf_words = [
    ["io","tu","voi","noi"],
    ["parlare","controllare","sprecare","fermatare","scrivere"],
    ["lui","lo","la","loro"]];

function randomWord(shelf) {
    var random_integer = Math.floor(Math.random() * shelf_words[shelf].length);
    return shelf_words[shelf][random_integer];
}

function newWord(shelf) {
    style = { font: "32px Arial",
	      fill: "#ff0044",
	      wordWrap: true,
	      align: "center",
	      backgroundColor: "#ffff00" };
	
    text = game.add.text( (150*shelf) + 125, 0, randomWord(shelf), style);
    text.anchor.set(0.5);
    
    game.physics.arcade.enable([text]);
    text.body.velocity.setTo(0,0);
    text.body.gravity.y = 100;
    text.body.collideWorldBounds = true;
    text.body.bounce.set(0.5);
    words.add(text);
}
