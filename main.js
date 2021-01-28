var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/rutherford-main.png");
ASSET_MANAGER.queueDownload("./sprites/Fayere.png");
ASSET_MANAGER.queueDownload("./sprites/forest.png");
ASSET_MANAGER.queueDownload("./sprites/projectiles.png");
ASSET_MANAGER.queueDownload("./sprites/Buck.png");
ASSET_MANAGER.queueDownload("./sprites/dummy.png");


ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	PARAMS.canvas_width = canvas.width;
	PARAMS.canvas_height = canvas.height;

	new SceneManager(gameEngine);

	gameEngine.init(ctx);	

	gameEngine.start();
});
