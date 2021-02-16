class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;
        this.offsetx = 0;
        this.offsety = 0;
        this.rotation = 0;
        this.char;
        this.camlock = true;
        
        this.loadSandbox();
    };
    
    /**
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadSandbox() {
        this.game.entities = [];

        var w = 220;
        var h = 145;
        var m = this.createMap(w, h);
        var threshold = 0.25;
        // property for the stump
        var scale = 1;
        var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/forest.png"), sx: 416, sy: 192, width: 32, height: 32, scale: scale, 
                    bound: {x: 0, y: 0, w: 1, h: 1}};

        var first = {};
        
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                var bg = new Ground(this.game, j * 32 * scale, i * 32 * scale, scale /3);
                this.game.addBg(bg);
                if (m[i][j] > threshold || i < 2 || j < 2 || i > h - 3 || j > w - 3) {
                    var stump = new Obstacle(this.game, j * 32 * scale, i * 32 * scale, p);
                    this.game.addEntity(stump);
                } else if (!first.x && !first.y) {
                    first.x = j;
                    first.y = i;
                }
            }
        }
        

        var character = new Rutherford(this.game, first.x * 32 * scale,  first.y * 32 * scale); 
        this.char = character;
        var fayereCharacter = new Fayere(this.game, 900, 600);
        var theBarrel = new Barrel(this.game, -50, -50, "Red");
        var theBarrel2 = new Barrel(this.game, -50, 300, "SRed");
        var theBarrel3 = new Barrel(this.game, 550, 50, "SRed");
        var theBarrel4 = new Barrel(this.game, 50, 800, "SBlue");
        var aisCharacter = new Ais(this.game, 900, 200);
        var buckCharacter = new Buck(this.game, 400, 300);

        
        
        
        
        //this.game.addEntity(new Dummy(this.game, 400, 200));
        this.game.addEntity(theBarrel);
        this.game.addEntity(theBarrel2);
        this.game.addEntity(theBarrel3);
        this.game.addEntity(theBarrel4);
        //this.game.addEntity(buckCharacter);
        this.game.addEntity(aisCharacter);
        
        this.game.addEntity(fayereCharacter);
        /*
        this.game.addEntity(new Propportal(this.game, 100, 0, "Cyclops"));
        */
        this.game.addEntity(character);
    };

    update() {
        
        this.x = this.char.x - PARAMS.canvas_width/2 + 25;
        this.y = this.char.y - PARAMS.canvas_height/2 + 25;

        if (this.game.mouse && !this.camlock) {
            var dx = this.game.mouse.x - PARAMS.canvas_width/2;
            if (Math.abs(dx) / 100 > 1 && Math.abs(this.offsetx + dx / 100) < PARAMS.canvas_width / 5) {
                this.offsetx += dx / 100;
            }

            var dy = this.game.mouse.y - PARAMS.canvas_height/2;
            if (Math.abs(dy) / 100 > 1 && Math.abs(this.offsety + dy / 100) < PARAMS.canvas_height / 5) {
                this.offsety += dy / 100;
            }
        }
        this.x += this.offsetx;
        this.y += this.offsety;
    };

    draw(ctx) {

    };

    createMap(w, h) {
        var m = [];
        noise.seed(Math.random());
        for (var i = 0; i < h; i++) {
            m[i] = [];
            for (var j = 0; j < w; j++) {
                m[i][j] = Math.abs( noise.perlin2( i * 0.1 , j * 0.1) );
            }
        }
        return m;
    }
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