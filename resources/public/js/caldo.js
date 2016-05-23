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
var hang_shelves = false;
var bricksize = { x:100, y: 51 };
// TODO: load from server.
var shelf_words = [
    ["io","tu","lui","lei","noi","voi","loro"],
    ["avere","fare","lavorare","leggere","mangiare",
     "studiare","suonare","tornare"],
    ["si","lo","la"]];

// global variables
var words;
var word;
var shelves;
var text;
var game;
var scoreText;
var score = 0;

var wordbricks = [];

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

    // remove one block for each root in roots.
    for (i = 0; i < num_roots; i++) {
	root = roots[i];
        // find the first block whose text === root.

	for (c = 0; c < num_blocks; c++) {
	    block = words.children[c];
	    if (block.alive == true) {
		// TODO: check if this best practices per Phaser docs to access "_" fields?
		block_text = block._text; 
		if (block_text === root) {
		    kill_block(block);
		    break; // only kill one block that matches the text; otherwise game is too easy.
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
    score += 10;
    scoreText.setText('Points: ' + score);

}

function caldo() {
    $.get('/mst/caldo.mst', function(template) {
	view = {
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

	var total_bricks = 4;
	var i = 0;
	window.setInterval(function() {
	    if (i < 4) {
		add_brick((125 * i) + 25, i % 2,wordbricks);
		i++;
	    }
	}, 1000);
    });
}

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#a8e";
    game.load.image('word','img/ball.png');
    game.load.image('shelf','img/brick.png');
    game.load.image('tile','img/tile.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    scoreTextStyle = { font: '18px Arial', fill: '#eeffDD' };
    scoreText = game.add.text(5,5,'Points: 0',scoreTextStyle);

}

function update() {
    for (var i = 0; i < wordbricks.length; i++) {
	var brick = wordbricks[i].brick;
	var text =  wordbricks[i].text;
	do_one_tween(brick,text);
	text.x = Math.floor(brick.x + brick.width / 2);
	text.y = Math.floor(brick.y + brick.height / 2);
    }
}

function randomWord(shelf) {
    var random_integer = Math.floor(Math.random() * shelf_words[shelf].length);
    return shelf_words[shelf][random_integer];
}

function add_brick(x,wordclass,wordbricks) {
    var style = { font: '18px Arial', fill: '#000' };
    var sprite = game.add.sprite(x,0,'tile');
    var text = game.add.text(x,0, randomWord(wordclass), style);
    text.anchor.set(0.5,0.55);
    wordbricks.push({"brick": sprite,
		     "text": text});
    sprite.tween_needed = true;

    sprite.inputEnabled = true;
    
    // mouse support:
    sprite.input.enableDrag();
    sprite.events.onInputUp.add(function(sprite) {
	onMouseUp(this,wordbricks);},
				this);
}

function onMouseUp(sprite,wordbricks) {
    log(DEBUG,"reactivating brick tweens.");
    for (var i = 0; i < wordbricks.length; i++) {
	wordbricks[i].brick.tween_needed = true;
    }
}

function do_one_tween(brick,text) {
    if (brick.tween_needed === true) {
	brick.tween_needed = false;
	var brick_bottom = find_bottom_for(brick,wordbricks);
	log(DEBUG,"brick_bottom for brick with y= " + brick.y + " = " + brick_bottom);
	log(DEBUG,"brick's tween_needed: " + brick.tween_needed);
	if (brick.y < brick_bottom) {

	    log(DEBUG,"we should do a tween for brick with y=" + brick.y);
	    var tween = game.add.tween(brick);
	    tween.to({ x: [brick.x], y: [brick_bottom] }, 1000, Phaser.Easing.Bounce.Out,true);
	    tween.start();
	}
    }
}

function find_bottom_for(brick,wordbricks) {
    var retval = 330;
    var overlapping_bricks = find_overlapping_bricks(brick,wordbricks);
    if (overlapping_bricks.length > 0) {
	for (var i = 0; i < overlapping_bricks.length; i++) {
	    var this_brick = overlapping_bricks[i];
	    if (this_brick.y < retval) {
		retval = this_brick.y - bricksize.y;
	    }
	}
    }
    return retval;
}

function find_overlapping_bricks(brick,wordbricks) {
    /* find all bricks which overlap with this one */
    var l1 = brick.x;
    var r1 = l1 + bricksize.x;
    var retval = [];
    for (var i = 0; i < wordbricks.length; i++) {
	var this_brick = wordbricks[i].brick;
	if (brick === this_brick) {
	    continue;
	}
	var l2 = this_brick.x;
	var r2 = r2 + bricksize.x;

	if ((r2 => l1) &&
	    (l2 <= r1)) {
	    retval.push(this_brick);
	}
    }
    return retval;
}
