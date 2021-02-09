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
        this.camlock = false;

        this.loadSandbox(50, 50);
    };
    
    /**
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadSandbox(x, y) {
        this.game.entities = [];

        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 7; j++) {
                var bg = new Ground(this.game, i * 96, j * 96);
                this.game.addEntity(bg);
            }
        }
        

        var character = new Rutherford(this.game, x, y); 
        this.char = character;
        var fayereCharacter = new Fayere(this.game, 900, 600);
        var theBarrel = new Barrel(this.game, -50, -50, "Red");
        var theBarrel2 = new Barrel(this.game, -50, 300, "Blue");
        var theBarrel3 = new Barrel(this.game, 50, 550, "SRed");
        var theBarrel4 = new Barrel(this.game, 50, 800, "SBlue");
        var aisCharacter = new Ais(this.game, 900, 200);
        var buckCharacter = new Buck(this.game, 400, 300);
        
        
        
        //this.game.addEntity(new Dummy(this.game, 400, 200));
        this.game.addEntity(theBarrel);
        this.game.addEntity(theBarrel2);
        this.game.addEntity(theBarrel3);
        this.game.addEntity(theBarrel4);
        this.game.addEntity(aisCharacter);
        this.game.addEntity(buckCharacter);
        this.game.addEntity(fayereCharacter);
        this.game.addEntity(new Propportal(this.game, 100, 0, "Cyclops"));
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