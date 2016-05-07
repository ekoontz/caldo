// welcome to caldo!
// Note that all of:
//
// - jquery{.min}.js
// - mustachephaser{.min}.js
// - phaser{.min}.js 
//
// must be loaded for caldo.js to work.

var game;
function caldo() {
    $.get('/mst/caldo.mst', function(template) {
	view = {
	    "caldo": [
		{}
	    ],
	    "caldo": [
		{}
	    ],
	    "name": function () {
		return "caldo";
	    }
	}

	// 1. populate page with HTML:
	output = Mustache.render(template,view);
	$("body").html(output);

	// 2. connect input element to game.
	$("#userinput").keypress(function() {
	    console.log("got here.");
	});


	// 3. initialize input elements
	$("#userinput").val("");
	$("#userinput").focus();
    
	// 4. start game
	game = new Phaser.Game(
	    600,400,
	    Phaser.AUTO,
	    "gamecontainer", {
		preload: preload,
		create: create,
		update: update
	    });

	var intervalID = window.setInterval(function() {newWord(0);},
					    newWordInterval);
    });
}

// global constants
var num_words_at_a_time = 3;
var num_shelves = 3;
var newWordInterval = 4000;

// globals variables
var words;
var word;
var shelves;
var text;

var shelf_words = [
    ["io","tu","voi","noi"],
    ["parlare","controllare","sprecare","fermatare","scrivere"],
    ["si","lo","la",]];

// methods

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#ede";
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
	shelf.body.bounce.set(0.5);
	shelf.body.collideWorldBounds = true;
	shelf.body.immovable = true;
	shelves.add(shelf);
    }
    
    words = game.add.group();
    newWord(0);
    newWord(1);
    newWord(2);
}


function wordHitShelf(word,shelf) {
    foo = 32;
}

function update() {
    game.physics.arcade.collide(words,shelves,wordHitShelf);
    game.physics.arcade.collide(words,words,wordHitShelf);
}

function randomWord(shelf) {
    var random_integer = Math.floor(Math.random() * shelf_words[shelf].length);
    return shelf_words[shelf][random_integer];
}

function newWord(shelf) {
    if (words.length < num_words_at_a_time) {
	style = { font: "32px Arial",
		  fill: "#0055ee",
		  wordWrap: true,
		  align: "center",
		  backgroundColor: "#ffffef" };
	
	text = game.add.text( (150*shelf) + 125, 0, randomWord(shelf), style);
	text.anchor.set(0.5);
	
	game.physics.arcade.enable([text]);
	text.body.velocity.setTo(0,0);
	text.body.gravity.y = 500;
	text.body.collideWorldBounds = true;
	text.body.bounce.set(Math.random());
	words.add(text);
    }
}
    
