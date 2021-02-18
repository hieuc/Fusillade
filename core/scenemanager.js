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
        this.debug = false;

        if (this.debug) {
            var t = createDungeon(100, 75);
            this.test = t[0];
        } else {
            //this.loadSandbox();
        }
    };
    
    /**
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadLevel1() {
        this.game.entities = [];

        var w = 100;
        var h = 75;
        //var m = this.createPerlinMap(w, h);
        //var threshold = 0.3;

        var rooms = createDungeon(w, h);
        var m = rooms[0];
        rooms = rooms[1];
        // property for the trees
        var scale = 2;
        var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/forest_tiles.png"), sx: 0, sy: 192, width: 64, height: 64, scale: scale/ (64/32), 
                    bound: {x: 0, y: 0, w: 1, h: 1}};

        for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[0].length; j++) {
                // determine if flower (25%) 
                var sx = 0;
                var sy = 0;
                var grass = randomInt(4) === 1 ? true : false;
                if (grass) {
                    while (sx === 0 && sy === 0) {
                        sx = randomInt(5);
                        sy = randomInt(3);
                    }
                }
                // property for grasses
                var gp = { spritesheet: ASSET_MANAGER.getAsset("./sprites/forest_tiles.png"), sx: 32 * sx, sy: 32 * sy, width: 32, height: 32, scale: scale / (32/32)};
                var bg = new Ground(this.game, j * 32 * scale, i * 32 * scale, gp);
                this.game.addBg(bg);
                if (m[i][j] === 0) {
                    // check surround, only assign bound if reachable to player:
                    // a space is a block if 1 of 4 neighbors is empty
                    if ((m[i-1] !== undefined && m[i-1][j] !== undefined && m[i-1][j] === 1) ||
                            (m[i+1] !== undefined && m[i+1][j] !== undefined && m[i+1][j] === 1) ||
                            (m[i] !== undefined && m[i][j-1] !== undefined && m[i][j-1] === 1) ||
                            (m[i] !== undefined && m[i][j+1] !== undefined && m[i][j+1] === 1)) {
                        var tree = new Obstacle(this.game, j * 32 * scale, i * 32 * scale, p);
                        this.game.addEntity(tree);
                    } else {
                        var tree = new Ground(this.game, j * 32 * scale, i * 32 * scale, p);
                        this.game.addBg(tree);
                    }
                }
            }
        }
        // spawn main character and enemiessss
        var startRoom = rooms[7];
        var character = new Rutherford(this.game, (startRoom.x + startRoom.w/2) * 32 * scale,  (startRoom.y + startRoom.h/2) * 32 * scale); 
        this.char = character;

        rooms.forEach(r => {
            r.enemies.forEach(e => {
                if (e[0] === "ais") {
                    for (var i = 0; i < e[1]; i ++) {
                        var sx = 0;
                        var sy = 0;
                        while (m[sy][sx] === 0) {
                            sx = r.x + randomInt(Math.floor(r.w * 0.6)) + Math.floor(r.w * 0.2);
                            sy = r.y + randomInt(Math.floor(r.h * 0.6)) + Math.floor(r.h * 0.2);
                        }
                        this.game.addEntity(new Ais(this.game, sx * 32 * scale, sy * 32 * scale));
                    }
                } else if (e[0] === "fayere") {
                    for (var i = 0; i < e[1]; i ++) {
                        var sx = 0;
                        var sy = 0;
                        while (m[sy][sx] === 0) {
                            sx = r.x + randomInt(Math.floor(r.w * 0.6)) + Math.floor(r.w * 0.2);
                            sy = r.y + randomInt(Math.floor(r.h * 0.6)) + Math.floor(r.h * 0.2);
                        }
                        this.game.addEntity(new Fayere(this.game, sx * 32 * scale, sy * 32 * scale));
                    }
                } else if (e[0] === "cyclops") {
                    var enemy = new Cyclops(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(enemy);
                } else if (e[0] === "buck") {
                    this.game.addEntity(new Buck(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale));
                }
            });
        });

        // spawn barrels
        // barrels will only spawn next to trees
        // the more trees, the higher chance
        // the total will be purely random
        for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[0].length; j++) {
                // i is y, j is x
                if (m[i][j] === 1) {
                    // count trees surround
                    var count = 0;
                    for (var a = i - 1; a <= i + 1; a++) {
                        for (var b = j - 1; b <= j + 1; b++) {
                            if (m[a] !== undefined && m[a][b] !== undefined && m[a][b] === 0)
                                count++;
                        }
                    }
                    var base = 0.01; // 1%
                    if (Math.random() < base * count) {
                        var pool = ["red", "sred", "blue", "sblue", "fayere"];
                        this.game.addEntity(new Barrel(this.game, j*32*scale, i*32*scale, pool[randomInt(pool.length)]));
                    }

                }
            }
        } 

        /*
        var fayereCharacter = new Fayere(this.game, 900, 600);
        var theBarrel = new Barrel(this.game, -50, -50, "Red");
        var theBarrel2 = new Barrel(this.game, -50, 300, "SRed");
        var theBarrel3 = new Barrel(this.game, 550, 50, "SRed");
        var theBarrel4 = new Barrel(this.game, 50, 800, "SBlue");
        var aisCharacter = new Ais(this.game, 900, 200);
        var buckCharacter = new Buck(this.game, 400, 300);
        */
        
        
        
        
        //this.game.addEntity(new Dummy(this.game, 400, 200));
        //this.game.addEntity(theBarrel);
        //this.game.addEntity(theBarrel2);
        //this.game.addEntity(theBarrel3);
        //this.game.addEntity(theBarrel4);
        //this.game.addEntity(buckCharacter);
        //this.game.addEntity(aisCharacter);
        
        //this.game.addEntity(fayereCharacter);
        /*
        this.game.addEntity(new Propportal(this.game, 100, 0, "Cyclops"));
        */
        this.game.addEntity(character);

        this.audio = new Audio("./sounds/greenpath-ambient.mp3");
        this.audio.volume = 0.5;
        this.audio.loop = true;
        this.audio.play();
    };

    update() {
        if (!this.debug && this.game.started) {
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
        }
    };

    draw(ctx) {
        if(this.debug) {
            var scale = 5;
            for (var i=0; i < this.test.length; i++) {
                for (var j = 0; j < this.test[0].length; j++) {
                    if (this.test[i][j] === 1) {
                        ctx.fillStyle = "black";
                        ctx.fillRect(j * scale, i * scale , scale, scale);
                    } 
                }
            }
        } else if (!this.game.started) {
            ctx.font = "30px Comic Sans MS";
            ctx.fillStyle = "red";
            ctx.fillText("press any key to start", PARAMS.canvas_width/6, PARAMS.canvas_height/2);
        } 
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