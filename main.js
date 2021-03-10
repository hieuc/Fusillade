var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

// sprites
ASSET_MANAGER.queueDownload("./sprites/rutherford.png");
ASSET_MANAGER.queueDownload("./sprites/rutherford-main.png");
ASSET_MANAGER.queueDownload("./sprites/Fayere.png");
ASSET_MANAGER.queueDownload("./sprites/Ais.png");
ASSET_MANAGER.queueDownload("./sprites/Wormy.png");
ASSET_MANAGER.queueDownload("./sprites/shadow.png");
ASSET_MANAGER.queueDownload("./sprites/forest_tiles.png");
ASSET_MANAGER.queueDownload("./sprites/projectiles.png");
ASSET_MANAGER.queueDownload("./sprites/Buck.png");
ASSET_MANAGER.queueDownload("./sprites/Buck.png");
ASSET_MANAGER.queueDownload("./sprites/Drumbuck.png");
ASSET_MANAGER.queueDownload("./sprites/dummy.png");
ASSET_MANAGER.queueDownload("./sprites/Portal.png");
ASSET_MANAGER.queueDownload("./sprites/ruthericon.png");
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
ASSET_MANAGER.queueDownload("./sprites/Slippey.png");
ASSET_MANAGER.queueDownload("./sprites/SlimeRuther.png");
ASSET_MANAGER.queueDownload("./sprites/slimee.png");
ASSET_MANAGER.queueDownload("./sprites/polnariff.png");
ASSET_MANAGER.queueDownload("./sprites/GUI.png");
ASSET_MANAGER.queueDownload("./sprites/minimap.png");
ASSET_MANAGER.queueDownload("./sprites/merchan.png");
ASSET_MANAGER.queueDownload("./sprites/Dine-O.png");
ASSET_MANAGER.queueDownload("./sprites/p.png");
ASSET_MANAGER.queueDownload("./sprites/bunny.png");
ASSET_MANAGER.queueDownload("./sprites/Wormy.png");
ASSET_MANAGER.queueDownload("./sprites/Wormito.png");
ASSET_MANAGER.queueDownload("./sprites/fayerehit.png");
ASSET_MANAGER.queueDownload("./sprites/Aishit.png");
ASSET_MANAGER.queueDownload("./sprites/buckhit.png");
ASSET_MANAGER.queueDownload("./sprites/cyclopshit.png");
ASSET_MANAGER.queueDownload("./sprites/mainmenu.png");
ASSET_MANAGER.queueDownload("./sprites/dungeon.png");
ASSET_MANAGER.queueDownload("./sprites/Doublops.png");
ASSET_MANAGER.queueDownload("./sprites/Fernight.png");
ASSET_MANAGER.queueDownload("./sprites/mainmenu.png");
ASSET_MANAGER.queueDownload("./sprites/Fusillade.png");
ASSET_MANAGER.queueDownload("./sprites/Wols.png");
ASSET_MANAGER.queueDownload("./sprites/mirror.png");
ASSET_MANAGER.queueDownload("./sprites/background.png");
ASSET_MANAGER.queueDownload("./sprites/Raven.png");
ASSET_MANAGER.queueDownload("./sprites/menacing.png");


// sounds
ASSET_MANAGER.queueDownload("./sounds/music/buck.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/maintheme.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/greenpath-ambient.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/greenpath-action.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/Ignotus.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/level2-stage1.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/level2-stage2.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/polnariff.mp3");
ASSET_MANAGER.queueDownload("./sounds/music/drumbuck.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/Ascend.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/Barrelbreak.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/health.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/Hit.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/no_potion.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/ohmygod.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/slam.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/slide.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/use_potion.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/warpI.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/warpO.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/body-fall.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/coin.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/timestop.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/slimehit.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/merchantpop.mp3");
ASSET_MANAGER.queueDownload("./sounds/sfx/rutherfordpop.mp3");





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
