var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/rutherford-main.png");
ASSET_MANAGER.queueDownload("./sprites/Fayere.png");

var c = null;

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	var character = new Rutherford(gameEngine, 50, 50); 
	var kanesCharacter = new Fayere(gameEngine, 300, 300);

	c = character;
	
	character.loadAnimations();
	kanesCharacter.loadAnimations();

	gameEngine.addEntity(character);
	gameEngine.addEntity(kanesCharacter);


	gameEngine.init(ctx);

	gameEngine.start();
});
