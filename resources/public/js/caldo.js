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
var AddNewBrickInterval = 3000;
var GameSize = {X:600,Y:400};
var num_words_at_a_time = 20;
var total_bricks = num_words_at_a_time;
var logging_level = INFO;
var BrickSize = { Y: 49 };
var BrickScale = { X: 0.28, Y: 0.8 };
var BrickAtom = 45;
var BottomOfScreen = 345;
var RightOfScreen = 475;
var Mortar = 5; // space between bricks
var HighestBrick = {Y: 25};

// global variables
var words;
var word;
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
            url: "/caldo/say"}).done(function(content) {
		roots = content.roots;
		if (roots == undefined) {
		    log(INFO,"server returned no roots for input: '"
			+ $("#userinput").val());
		} else {
		    if (roots.length === 0) {
			log(INFO,"parsing error");
			var animationName = "animated shake bad";
			$("#userinput").addClass(animationName).one('animationend',
								    function() {
									$(this).removeClass(animationName);
								    });
		    } else {
			var animationName = "animated flash good";
			$("#userinput").addClass(animationName).one('animationend',
								    function() {
									$("#userinput").val("");
									$(this).removeClass(animationName);
								    });

			log(INFO,"response from server: found: " +
			    roots.length + " roots:" +
			    roots.join());
		    }
		}

		remove_from_blocks(roots,wordbricks);

		$("#userinput").focus();
	    });
    }
}

function remove_from_blocks(roots,wordbricks) {
    num_roots = roots.length;
    num_blocks = wordbricks.length;

    // remove one block for each root in roots.
    for (i = 0; i < num_roots; i++) {
	root = roots[i];
        // find the first block whose text === root.

	for (c = 0; c < num_blocks; c++) {
	    brick = wordbricks[c].brick;
	    if (brick.alive == true) {
		// TODO: check if this best practices
		// per Phaser docs to access "_" fields?
		var text_object = wordbricks[c].text;
		if (text_object._text === root) {
		    killBrick(brick,text_object);
		    break; // only kill one block that matches
		    // the text; otherwise game is too easy.
		}
	    }
	}
    }
}

function updateScore(increment) {
    score += increment;
    scoreText.setText('Points: ' + score);
}

function killBrick(brick,text) {
    updateScore(10);
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0.25,y:0.25},250,Phaser.Easing.Linear.Out,true,10);
    killTween.onComplete.addOnce(function() {
	brick.kill();
	checkBricks = true;
	text.kill();
    }, this);
    killTween.start();
}

function caldo() {
    $.get('/mst/caldo.mst', function(body_template) {
	view = {
	    "caldo": {
		"message": "Caldo"
	    }
	}

	// 1. populate page with HTML:
	$("#caldo").html(Mustache.render(body_template,view));

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
			 i % 4,wordbricks);
		i++;
	    } else {
		alert("You lost, game over!");
		location.reload();
	    }
	}, AddNewBrickInterval);
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
		if (brick.initialDescent === false) {
		    updateScore(1);
		}
		log(DEBUG,"we should do a tween for brick with text:" +
		    text._text);
		var tween = game.add.tween(brick);
		tween.to({ x: [brick.x], y: [brick_bottom] },
			 500, function (k) {
			     return tweenMove(brick,text,k);
			 },
			 true);
		tween.start();
	    } else {
		brick.initialDescent = false;
	    }
	    updateText(brick,text);
	}
    }
}

function randomWord(wordclass) {
    var root;
    $.ajax({
	async: false, // wait for a response before returning.
	cache: false,
	type: "GET",
	data: {class: wordclass},
	dataType: "json",
	url: "/caldo/randomroot"}).done(function(content) {
	    root = content.root;
	});
    return root;
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
    /* find all bricks directly under _brick_ */
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
