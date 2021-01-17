var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./sprites/");

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	//character = new Character(gameEngine, 50, 50); 
	//character.loadAnimations();

	gameEngine.init(ctx);

	//gameEngine.addEntity(character);
	
	gameEngine.start();
});
