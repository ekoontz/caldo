// welcome to caldo!
// note that phaser{.min}.js must be loaded for caldo.js to work.

var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload, create: create, update: update
});

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#edc";
}


function create() {

}

function update() {

}
