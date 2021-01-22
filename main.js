var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/rutherford-main.png");
ASSET_MANAGER.queueDownload("./sprites/Fayere.png");
ASSET_MANAGER.queueDownload("./sprites/forest.png");


ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	new SceneManager(gameEngine);

	gameEngine.init(ctx);	

	gameEngine.start();
});
