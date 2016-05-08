// welcome to caldo!
// Note that all of:
//
// - jquery{.min}.js
// - mustachephaser{.min}.js
// - phaser{.min}.js 
// - log4.js
//
// must be loaded for caldo.js to work.


// global constants
var num_words_at_a_time = 10;
var num_shelves = 2;
var newWordInterval = [3000,4000];
var logging_level = DEBUG;
// global variables
var words;
var word;
var shelves;
var text;
var game;
var shelf_words = [
    ["io","tu","lui","lei","noi","voi","loro"],
    ["avere","fare","lavorare","leggere","mangiare",
     "studiare","suonare","tornare"],
    ["si","lo","la"]];

// methods
function respond_to_user_input(event) {
    key_pressed = event.which;
    if (key_pressed == 13) {
	// send to language server:
	$.ajax({
	    cache: false,
	    type: "GET",
	    data: {expr: $("#userinput").val()},
            dataType: "json",
            url: "/say"}).done(function(content) {
		roots = content.roots;
		if (roots == undefined) {
		    log(INFO,"server returned no roots for input: '" + $("#userinput").val());
		} else {
		    log(INFO,"response from server: found: " + roots.length + " roots.");
		}

		remove_from_blocks(roots);

		$("#userinput").val("");
		$("#userinput").focus();
	    });
    }
}

function remove_from_blocks(roots) {
    num_roots = roots.length;
    num_blocks = words.children.length;
    for (i = 0; i < num_roots; i++) {
	root = roots[i];
	for (c = 0; c < num_blocks; c++) {
	    block = words.children[c];
	    if (block.alive == true) {
		block_text = block._text; // TODO: is this best practices per Phaser docs to access "_" fields?
		if (block_text === root) {
		    kill_block(block);
		}
	    }
	}
    }
}

function kill_block(brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0.25,y:0.25},150,Phaser.Easing.Linear.Out,true,10);
    killTween.onComplete.addOnce(function() {
	brick.kill();
    }, this);
    killTween.start();
}

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
	$("#userinput").keypress(respond_to_user_input);

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

	// TODO: loop over num_shelves
	window.setInterval(function() {newWord(0);},
			   newWordInterval[0]);
	window.setInterval(function() {newWord(1);},
			   newWordInterval[1]);
    });
}

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
    words = game.add.group();
    for (c = 0; c < num_shelves; c++) {
	shelf = game.add.sprite((150*c)+100,game.world.height*0.9,'shelf')
	game.physics.enable(shelf,Phaser.Physics.ARCADE);
	shelf.body.gravity.y = 0; // shelf is floating in the air.
	shelf.body.bounce.set(0.5);
	shelf.body.collideWorldBounds = true;
	shelf.body.immovable = true;
	shelves.add(shelf);
	newWord(c);
    }
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
    // count the number of alive words: TODO: do this with a global variable.
    alive_words = 0;
    num_blocks = words.children.length;
    for (c = 0; c < num_blocks; c++) {
	block = words.children[c];
	if (block.alive == true) {
	    alive_words++;
	}
    }

    if (alive_words < num_words_at_a_time) {
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
	text.body.bounce.set(0.5 + (.1 * (Math.random())));
	words.add(text);
    }
}
    
