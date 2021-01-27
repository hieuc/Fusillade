class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;

        this.loadSandbox(50, 50);
    };
    
    /**
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadSandbox(x, y) {
        this.game.entityies = [];

        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 7; j++) {
                var bg = new Ground(this.game, i * 96, j * 96);
                this.game.addEntity(bg);
            }
        }
        

        var character = new Rutherford(this.game, x, y); 
        var fayereCharacter = new Fayere(this.game, 900, 600);
        var buckCharacter = new Buck(this.game, 850, 100);
        
        this.game.addEntity(new Dummy(this.game, 400, 200));
        this.game.addEntity(new Dummy(this.game, 300, 300));
        this.game.addEntity(new Dummy(this.game, 500, 300));
        this.game.addEntity(buckCharacter);
        this.game.addEntity(fayereCharacter);
        this.game.addEntity(character);
    };

    update() {

        let midpoint = PARAMS.CANVAS_WIDTH/2 - PARAMS.BLOCKWIDTH / 2;

        if (this.x < this.mario.x - midpoint) this.x = this.mario.x - midpoint;
    
        if (this.mario.dead && this.mario.y > PARAMS.BLOCKWIDTH * 16) {
            this.mario.dead = false;
            this.loadLevelOne(2.5 * PARAMS.BLOCKWIDTH, 0 * PARAMS.BLOCKWIDTH);
        };
    };

    draw(ctx) {

    };
};

/*
class Minimap {
    constructor(game, x, y, w) {
        Object.assign(this, { game, x, y, w });
    };

    update() {

    };

    draw(ctx) {
        ctx.strokeStyle = "Black";
        ctx.strokeRect(this.x, this.y, this.w, PARAMS.BLOCKWIDTH);
        for (var i = 0; i < this.game.entities.length; i++) {
            this.game.entities[i].drawMinimap(ctx, this.x, this.y);
        }
    };
};*/