var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/rutherford.png");
ASSET_MANAGER.queueDownload("./sprites/rutherford-main.png");
ASSET_MANAGER.queueDownload("./sprites/Fayere.png");
ASSET_MANAGER.queueDownload("./sprites/Ais.png");
ASSET_MANAGER.queueDownload("./sprites/forest_tiles.png");
ASSET_MANAGER.queueDownload("./sprites/projectiles.png");
ASSET_MANAGER.queueDownload("./sprites/Buck.png");
ASSET_MANAGER.queueDownload("./sprites/Buck.png");
ASSET_MANAGER.queueDownload("./sprites/Drumbuck.png");
ASSET_MANAGER.queueDownload("./sprites/dummy.png");
ASSET_MANAGER.queueDownload("./sprites/Portal.png");
ASSET_MANAGER.queueDownload("./sprites/Cyclops.png");
ASSET_MANAGER.queueDownload("./sprites/Crate.png");
ASSET_MANAGER.queueDownload("./sprites/Meat.png");
ASSET_MANAGER.queueDownload("./sprites/star.png");
ASSET_MANAGER.queueDownload("./sprites/Thunder.png");
ASSET_MANAGER.queueDownload("./sprites/Shine.png");
ASSET_MANAGER.queueDownload("./sprites/Burn.png");
ASSET_MANAGER.queueDownload("./sprites/ThunEffect.png");
ASSET_MANAGER.queueDownload("./sprites/BBeam.png");
ASSET_MANAGER.queueDownload("./sprites/RBeam.png");
ASSET_MANAGER.queueDownload("./sprites/Slime.png");
ASSET_MANAGER.queueDownload("./sprites/SlimeRuther.png");
ASSET_MANAGER.queueDownload("./sprites/GUI.png");
ASSET_MANAGER.queueDownload("./sprites/minimap.png");
ASSET_MANAGER.queueDownload("./sprites/merchan.png");
ASSET_MANAGER.queueDownload("./sprites/Dine-O.png");

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	PARAMS.canvas_width = canvas.width;
	PARAMS.canvas_height = canvas.height;
	PARAMS.debug = document.getElementById("debug").checked;
	PARAMS.default_p_sheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
	PARAMS.default_projectile = {spritesheet: PARAMS.default_p_sheet, sx : 96, sy : 96, size: 16}

	new SceneManager(gameEngine);

	gameEngine.init(ctx);	

	gameEngine.start();
});
