// welcome to caldo!
// Note that all of:
//
// - jquery{.min}.js
// - mustache{.min}.js
// - phaser{.min}.js 
// - log4.js
//
// must be loaded for caldo.js to work.

// global constants
var GameSize = {X:600,Y:400};
var num_words_at_a_time = 20;
var total_bricks = num_words_at_a_time;
var num_shelves = 2;
var newWordInterval = [3000,4000];
var logging_level = INFO;
var hang_shelves = false;
var BrickSize = { Y: 49 };
var BrickScale = { X: 0.28, Y: 0.8 };
var BrickAtom = 45;
var BottomOfScreen = 335;
var RightOfScreen = 450;
var Mortar = 5;
var HighestBrick = {Y: 50};
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
var checkBricks = true;

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
		    log(INFO,"server returned no roots for input: '"
			+ $("#userinput").val());
		} else {
		    log(INFO,"response from server: found: " +
			roots.length + " roots.");
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
		// TODO: check if this best practices
		// per Phaser docs to access "_" fields?
		block_text = block._text; 
		if (block_text === root) {
		    killBrick(block);
		    break; // only kill one block that matches
		    // the text; otherwise game is too easy.
		}
	    }
	}
    }
}

function killBrick(brick,text) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0.25,y:0.25},250,Phaser.Easing.Linear.Out,true,10);
    killTween.onComplete.addOnce(function() {
	brick.kill();
	checkBricks = true;
	text.kill();
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
	    GameSize.X,GameSize.Y,
	    Phaser.AUTO,
	    "gamecontainer", {
		preload: preload,
		create: create,
		update: update
	    });

	var i = 0;
	window.setInterval(function() {
	    var highestBrick = findHighestBrick(wordbricks);
	    if (highestBrick > HighestBrick.Y) {
		var position = Math.floor(Math.random() *
					  ( RightOfScreen / BrickAtom));
		addBrick((BrickAtom * position),
			 i % 3,wordbricks);
		i++;
	    }
	}, 200);
    });
}

function findHighestBrick(wordbricks) {
    var retval = BottomOfScreen;
    for (var i = 0; i < wordbricks.length; i++) {
	var brick = wordbricks[i].brick;
	if (brick.alive === true) {
	    var bounds = brick.getBounds();
	    if (bounds.y < retval) {
		retval = bounds.y;
	    }
	}
    }
    return retval;
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
    if (checkBricks === true) {
	checkBricks = false;
	for (var i = 0; i < wordbricks.length; i++) {
	    var brick = wordbricks[i].brick;
	    var text =  wordbricks[i].text;
	    log(TRACE,"checking brick: " + text._text);
	    var brick_bottom = findBottom(brick,text._text,wordbricks);
	    log(TRACE,"brick_bottom for brick with y= " +
		brick.y + " = " + brick_bottom);
	    if (brick.y < brick_bottom) {
		// we are too high and must fall down to brick_bottom now.
		oneOrMoreBricksChanged = true;
		log(DEBUG,"we should do a tween for brick with text:" +
		    text._text);
		var tween = game.add.tween(brick);
		tween.to({ x: [brick.x], y: [brick_bottom] },
			 150, function (k) {
			     return tweenMove(brick,text,k);
			 },
			 true);
		tween.start();
	    }
	    updateText(brick,text);
	}
    }
}

function randomWord(shelf) {
    var random_integer = Math.floor(Math.random() * shelf_words[shelf].length);
    return shelf_words[shelf][random_integer];
}

function addBrick(x,wordclass,wordbricks) {
    var style = { font: '18px Arial', fill: '#000' };
    var sprite = game.add.sprite(x + Mortar,0,'tile');
    var word = randomWord(wordclass);
    var lengthInAtoms = Math.floor(word.length / 4.0) + 1;
    sprite.scale.setTo((BrickScale.X * lengthInAtoms),
		       BrickScale.Y);
    var text = game.add.text(x,0,word,style);
    text.anchor.set(0.5,0.55);
    wordbricks.push({"brick": sprite,
		     "text": text});
    checkBricks = true;

    // mouse support:
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(function() {
	killBrick(sprite,text);
    },this);


}

function onMouseUp(sprite,wordbricks) {
    log(DEBUG,"reactivating brick tweens.");
    checkBricks = true;
}

function updateText(brick,text) {
    text.x = Math.floor(brick.x + brick.width / 2);
    text.y = Math.floor(brick.y + brick.height / 2);
}

function tweenMove(brick,text,k) {
    if (k == 1) {
	checkBricks = true;
	log(TRACE,"reactivating checks post-tween.");
	for (var i = 0; i < wordbricks.length; i++) {
	    wordbricks[i].brick.doTweenCheck = true;
	}
    }
    updateText(brick,text);
    return Phaser.Easing.Bounce.Out(k);
}

function findBottom(brick,text,wordbricks) {
    var retval = BottomOfScreen;
    var bricksUnder = bricksUnderMe(brick,text,wordbricks);
    if (bricksUnder.length > 0) {
	log(DEBUG,"brick: " + text + " has " +
	    bricksUnder.length + " bricks under it.");
	for (var i = 0; i < bricksUnder.length; i++) {
	    var this_brick = bricksUnder[i];
	    if (this_brick.y <= retval) {
		retval = this_brick.y - BrickSize.Y;
	    }
	}
    }
    return retval;
}

function bricksUnderMe(brick,text,wordbricks) {
    /* find all bricks directly under us */
    var retval = [];
    var brickBounds = brick.getBounds();
    var l1 = brickBounds.x;
    var r1 = l1 + brickBounds.width;
    for (var i = 0; i < wordbricks.length; i++) {
	var other_brick = wordbricks[i].brick;
	if ((brick === other_brick) ||
	    (other_brick.alive === false)) {
	    continue;
	}

	var otherBrickBounds = other_brick.getBounds();
	var l2 = otherBrickBounds.x;
	var r2 = l2 + otherBrickBounds.width;
	// [ l1 <- --- -> r1]
	//       [ l2 <- --- -> r2 ]
	
	if ((r2 >= l1) &&
	    (l2 <= r1) &&
	    (brick.y < other_brick.y)) {
	    log(DEBUG,"brick: " + text +
		"(l1=" + l1 + ",r1=" + r1 + ")" +
		" has a brick below it:" +
		wordbricks[i].text._text + 
		"(l2=" + l2 + ",r2=" + r2 + ")");

	    retval.push(other_brick);
	}
	
    }
    return retval;
}
