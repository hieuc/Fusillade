class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;

        this.main = ASSET_MANAGER.getAsset("./sprites/mainmenu.png");
        this.title = ASSET_MANAGER.getAsset("./sprites/Fusillade.png");
        this.panel = ASSET_MANAGER.getAsset("./sprites/GUI.png");

        this.ruthericon = ASSET_MANAGER.getAsset("./sprites/ruthericon.png");
        this.avaanimation = new Animator(this.ruthericon, 0, 0, 172, 45, 4, 0.35, 28, false, true);

        this.animations = new Animator(this.main, 0, 0, 1280, 720, 15, 0.1, 0, false, true);

        this.buttonanimations = new Animator(this.panel, 113, 81, 32, 16, 1, 1, 0, false, true);

        this.minimap = new Minimap(game, 0, 0);
        this.inventory = new Inventory(game, PARAMS.canvas_width/15, PARAMS.canvas_height/15);
        this.playonce = true;

        this.x = 0;
        this.y = 0;
        this.offsetx = 0;
        this.offsety = 0;
        this.rotation = 0;
        this.char = null;
        this.camlock = true;
        this.debug = false;  // for map layout debug
        this.rooms = null;
        this.map = null; // map of terrain: 0 = obstacles, 1 = open space
        this.tempObstacles = null;
        this.locked = false;
        this.level = 1;
        this.stage = 1; // stage 1 = start, stage 2 = miniboss, stage 3 = boss
        this.gameover = true;
        this.merchant = null;

        if (this.debug) {
            var t = createLevel2(100, 100);
            this.test = t[0];
            this.rooms = t[1];
            console.log(this.rooms);
        } else {
            //this.loadSandbox();
        }
    };
    
    /**
     * Load Level 1.
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadLevel1() {
        this.game.entities = [];
        this.game.background = [];
        this.gameover = false;
        this.stage = 1;
        this.tempObstacles = null;
        this.locked = false;
        this.level = 1;

        var w = 100;
        var h = 75;
        //var m = this.createPerlinMap(w, h);
        //var threshold = 0.3;

        var rooms = createLevel1(w, h);
        var m = rooms[0];
        rooms = rooms[1];
        this.rooms = rooms;
        this.map = m;
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
                    if ((m[i-1] !== undefined && m[i-1][j] === 1) ||
                            (m[i+1] !== undefined && m[i+1][j] === 1) ||
                            (m[i] !== undefined && m[i][j-1] === 1) ||
                            (m[i] !== undefined && m[i][j+1] === 1)) {
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
        var character = new Rutherford(this.game, (startRoom.x + startRoom.w/2) * 32 * scale,  (startRoom.y + startRoom.h/2) * 32 * scale, false); 
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
                    this.boss = new Buck(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(this.boss);
                }
            });
        });
        
        // spawn barrels and bunnies
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
                    // spawn barrels
                    var base = 0.01; // 1%
                    if (Math.random() < base * count) {
                        var pool = ["red", "sred", "blue", "sblue", "fayere", "onecoin", "threecoin"];
                        this.game.addEntity(new Barrel(this.game, j*32*scale, i*32*scale, pool[randomInt(pool.length)]));
                    }
                    // spawn bunnies
                    base = 0.001;
                    if (Math.random() < base * count) {
                        this.game.addEntity(new Bunny(this.game, j*32*scale, i*32*scale));
                    }
                }
            }
        } 

        this.merchant = new Merchant(this.game, 840, 4100, 1);
        this.game.addEntity(new Wormito(this.game, character.x, character.y));
        this.game.addEntity(new Wols(this.game, character.x - 200, character.y));
        this.game.addEntity(this.merchant);
        this.game.addEntity(character);

        // lock the boss room from the beginning
        this.tempObstacles = lockRoom(this.game, this.rooms[8], this.map, p);
        
        //this.game.addEntity(new Slippey(this.game, character.x- 500, character.y));
        ASSET_MANAGER.pauseBackgroundMusic();
        ASSET_MANAGER.playAsset("./sounds/music/greenpath-ambient.mp3");
        ASSET_MANAGER.autoRepeat("./sounds/music/greenpath-ambient.mp3");
    };

    /**
     * Load Level 2.
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadLevel2() {
        this.game.entities = [];
        this.game.background = [];
        this.gameover = false;
        this.stage = 1;
        this.tempObstacles = null;
        this.locked = false;
        this.level = 2;

        var w = 120;
        var h = 120;
        //var m = this.createPerlinMap(w, h);
        //var threshold = 0.3;

        var rooms = createLevel2(w, h);
        var m = rooms[0];
        rooms = rooms[1];

        this.rooms = rooms;
        this.map = m;
        
        // right now this is just an empty space
        var scale = 2;
        
        // ground
        var gp = [{ spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 29, sy: 108, width: 16, height: 16, scale: scale / (16/32)},
                { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 16, sy: 160, width: 16, height: 16, scale: scale / (16/32)},
                { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 32, sy: 160, width: 16, height: 16, scale: scale / (16/32)},
                { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 48, sy: 160, width: 16, height: 16, scale: scale / (16/32)}];
        // moss ground
        var mg = [{ spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 16, sy: 144, width: 16, height: 16, scale: scale / (16/32)},
                { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 32, sy: 144, width: 16, height: 16, scale: scale / (16/32)}, 
                { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 48, sy: 144, width: 16, height: 16, scale: scale / (16/32)}];

        for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[0].length; j++) {
                if (m[i][j] === 1) {
                    var bg;
                    if (m[i-1] !== undefined && m[i-1][j] === 0) {
                        bg = new Ground(this.game, j * 32 * scale, i * 32 * scale, mg[randomInt(3)]);
                    } else {
                        if (Math.random() < 0.15) {
                            bg = new Ground(this.game, j * 32 * scale, i * 32 * scale, gp[randomInt(3)+1]);
                        } else {
                            bg = new Ground(this.game, j * 32 * scale, i * 32 * scale, gp[0]);
                        }
                    }
                    this.game.addBg(bg);
                }
                else {
                    // choose sprite for room's edge here

                    // property for the obstacles
                    var wall = { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 16, sy: 12, width: 16, height: 16, scale: scale/ (16/32), 
                        bound: {x: 0, y: 0, w: 1, h: 1}};
                    var bwall = { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 48, sy: 128, width: 16, height: 16, scale: scale/ (16/32), 
                        bound: {x: 0, y: 0, w: 1, h: 1}};
                    var empty = { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 16, sy: 128, width: 16, height: 16, scale: scale/ (16/32), 
                        bound: {x: 0, y: 0, w: 1, h: 1}};
                    
                    // check surround, only assign bound if reachable to player:
                    // a space is a block if 1 of 4 neighbors is empty
                    if ((m[i-1] !== undefined && m[i-1][j] === 1) ||
                            (m[i+1] !== undefined && m[i+1][j] === 1) ||
                            (m[i] !== undefined && m[i][j-1] === 1) ||
                            (m[i] !== undefined && m[i][j+1] === 1)) {
                        var space;
                        if (m[i+1] !== undefined && m[i+1][j] === 1) {
                            space = new Obstacle(this.game, j * 32 * scale, i * 32 * scale, wall);
                        } else if (m[i-1] !== undefined && m[i-1][j] === 1) {
                            space = new Obstacle(this.game, j * 32 * scale, i * 32 * scale, bwall);
                        } else {
                            space = new Obstacle(this.game, j * 32 * scale, i * 32 * scale, empty);
                        }
                        
                        this.game.addEntity(space);
                    } else {
                        this.game.addBg(new Ground(this.game, j * 32 * scale, i * 32 * scale, empty));
                    }
                    
                }
            }
        }
        // spawn main character and enemiessss
        var start;
        var end;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].key === "start") {
                start = rooms[i];
            } else if (rooms[i].key === "end") {
                end = rooms[i];
            }
        }

        var character = new Rutherford(this.game, (start.x + start.w/2) * 32 * scale,  (start.y + start.h/2) * 32 * scale, false); 
        this.char = character;
        

        /*
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
                    this.boss = new Drumbuck(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(this.boss);
                }
            });
        });
        */
        // spawn barrels and bunnies
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
                    // spawn barrels
                    var base = 0.01; // 1%
                    if (Math.random() < base * count) {
                        var pool = ["red", "sred", "blue", "sblue", "fayere", "onecoin", "threecoin"];
                        this.game.addEntity(new Barrel(this.game, j*32*scale, i*32*scale, pool[randomInt(pool.length)]));
                    }
                    /*
                    // spawn bunnies
                    base = 0.001;
                    if (Math.random() < base * count) {
                        this.game.addEntity(new Bunny(this.game, j*32*scale, i*32*scale));
                    }
                    */
                }
            }
        } 
        
        //this.merchant = new Merchant(this.game, character.x, character.y, 1);
        //this.game.addEntity(this.merchant);
        //var worm = new Wormy(this.game, 1050,  7700);
        //this.game.addEntity(worm);

        this.game.addEntity(character);

        this.game.addEntity(new Doublops(this.game, character.x, character.y));
        
        //this.game.addEntity(new Dummy(this.game, character.x, character.y, start));
        //this.game.addEntity(new Polnariff(this.game, character.x, character.y, start));
        ASSET_MANAGER.pauseBackgroundMusic();
        ASSET_MANAGER.playAsset("./sounds/music/greenpath-ambient.mp3");
        ASSET_MANAGER.autoRepeat("./sounds/music/greenpath-ambient.mp3");
    }

    loadLevel3() {
        this.game.entities = [];
        this.game.background = [];
        this.gameover = false;
        this.stage = 1;
        this.tempObstacles = null;
        this.locked = false;
        this.level = 3;

        var b = 8;  // unit size
        var scale = 4;
        var ss = ASSET_MANAGER.getAsset("./sprites/background.png");
        
        // 0 = none, 1 = block
        // ! = ground, $ = carpet 
        // % = oryx logo, ^ = path intersection
        // t = carpet edge top, b = carpet edge bottom
        // l = carpet edge left, r = carpet edge right
        // q = carpet tl corner, w = carpet tr corner
        // e = carpet bl corner, a = carpet br corner
        // s = vertical path, d = horizontal path
        var keys = {
            "1" : {x: 0, y: 35},
            "!" : {x: 0, y: 74},
            "$" : {x: 1, y: 3},
            "%" : {x: 1, y: 1},
            "^" : {x: 0, y: 72},
            "t" : {x: 1, y: 0},
            "b" : {x: 1, y: 4},
            "l" : {x: 0, y: 1},
            "r" : {x: 6, y: 1},
            "q" : {x: 0, y: 0},
            "w" : {x: 6, y: 0},
            "e" : {x: 0, y: 4},
            "a" : {x: 6, y: 4},
            "d" : {x: 1, y: 72},
            "s" : {x: 8, y: 72}
        }

        var map = 
            "000000000000000111111111000000000000000" +
            "000000000000111!!sl$rs!!111000000000000" +
            "000000000011!!!!!sl$rs!!!!!110000000000" + 
            "0000000001ddddddd^l$r^ddddddd1000000000" +
            "000000001s!!!!!!!sl$rs!!!!!!!s100000000" +
            "00000001!s!!!!!!!sl$rs!!!!!!!s!10000000" +
            "0000001!!s!!!!!!!sl$rs!!!!!!!s!!1000000" +
            "000001!!!s!!!!!!!sl$rs!!!!!!!s!!!100000" +
            "00001!!!!s!!!!!!!sl$rs!!!!!!!s!!!!10000" +
            "0001!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!1000" +
            "001!!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!!100" +
            "001dddddd^ddddddd^l$r^ddddddd^dddddd100" +
            "01!!!!!!!s!!!!!!!q$$$w!!!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!qt$$$$$tw!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!q$$$$$$$$$w!!!!s!!!!!!!10" +
            "1s!!!!!!!s!!!q$$$$$$$$$$$w!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!l$$$$$$$$$$$r!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!q$$$$$$$$$$$$$w!!s!!!!!!!s1" +
            "1ttttttttttt$$$$$%0000$$$$$ttttttttttt1" +
            "1$$$$$$$$$$$$$$$$00000$$$$$$$$$$$$$$$$1" +
            "1bbbbbbbbbbb$$$$$00000$$$$$bbbbbbbbbbb1" +
            "1s!!!!!!!s!!e$$$$$$$$$$$$$a!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!l$$$$$$$$$$$r!!!s!!!!!!!s1" +
            "1s!!!!!!!s!!!e$$$$$$$$$$$a!!!s!!!!!!!s1" +
            "01!!!!!!!s!!!!e$$$$$$$$$a!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!eb$$$$$ba!!!!!s!!!!!!!10" +
            "01!!!!!!!s!!!!!!!e$$$a!!!!!!!s!!!!!!!10" +
            "001dddddd^ddddddd^l$r^ddddddd^dddddd100" +
            "001!!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!!100" +
            "0001!!!!!s!!!!!!!sl$rs!!!!!!!s!!!!!1000" +
            "00001!!!!s!!!!!!!sl$rs!!!!!!!s!!!!10000" +
            "000001!!!s!!!!!!!sl$rs!!!!!!!s!!!100000" +
            "0000001!!s!!!!!!!sl$rs!!!!!!!s!!1000000" +
            "00000001!s!!!!!!!sl$rs!!!!!!!s!10000000" +
            "000000001s!!!!!!!sl$rs!!!!!!!s100000000" +
            "0000000001ddddddd^l$r^ddddddd1000000000" +
            "000000000011!!!!!sl$rs!!!!!110000000000" +
            "000000000000111!!sl$rs!!111000000000000" +
            "000000000000000111111111000000000000000";

        for (var i = 0; i < 39; i++) {
            for (var j = 0; j < 39; j++) {
                var ch = map[i * 39 + j];
                if (ch === "0")
                    continue;

                var bg = null;
                if (ch === "%")
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch].x * b, sy: keys[ch].y * b, width: b * 5, height: b * 3, scale: scale});
                else if (ch === "!") {
                    var r = randomInt(26);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: (keys[ch].x + r % 15) * b, sy: (keys[ch].y + Math.floor(r / 15)) * b, width: b, height: b, scale: scale});
                } else if (ch === "1") {
                    bg = new Obstacle(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch].x * b, sy: keys[ch].y * b, width: b, height: b, scale: scale, bound: {x: 0, y: 0, w: 1, h: 1}});
                    this.game.addEntity(bg);
                } else if (ch === "s" || ch === "d") {
                    var r = randomInt(7);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: (keys[ch].x + r) * b, sy: keys[ch].y * b, width: b, height: b, scale: scale});
                } else     
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch].x * b, sy: keys[ch].y * b, width: b, height: b, scale: scale});
                
                if (bg)
                    this.game.addBg(bg);
            }  
        }

        var character = new Rutherford(this.game, 500,  500, false); 
        this.char = character;
        this.game.addEntity(character);
    }

    update() {
        if (this.game.started && !this.game.extra) {
            // update camera
            if (!this.debug) {
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

            
            if (this.level === 1) {
                // check if rutherford enters miniboss room
                if (this.stage === 1 && this.isInRoom(this.rooms[0])) {
                    ASSET_MANAGER.pauseBackgroundMusic();
                    ASSET_MANAGER.playAsset("./sounds/music/greenpath-action.mp3");
                    ASSET_MANAGER.autoRepeat("./sounds/music/greenpath-action.mp3");
                    this.stage = 2;
                    this.releaseLock();
                }
                // check if rutherford is in boss room
                else if (this.stage === 2 && this.isInRoom(this.rooms[8])) {
                    // sprite for tree
                    var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/forest_tiles.png"), sx: 0, sy: 192, width: 64, height: 64, scale: 1, 
                                bound: {x: 0, y: 0, w: 1, h: 1}};
                    this.tempObstacles = lockRoom(this.game, this.rooms[8], this.map, p);
                    this.locked = true;
                    ASSET_MANAGER.pauseBackgroundMusic();
                    ASSET_MANAGER.playAsset("./sounds/music/buck.mp3");
                    ASSET_MANAGER.autoRepeat("./sounds/music/buck.mp3");
                } else if (this.boss && this.boss.removeFromWorld && this.char.hp.current > 0) {
                    this.boss = null;
                    ASSET_MANAGER.pauseBackgroundMusic();
                    ASSET_MANAGER.playAsset("./sounds/music/greenpath-ambient.mp3");
                    ASSET_MANAGER.autoRepeat("./sounds/music/greenpath-ambient.mp3");
                    this.releaseLock();
                    this.stage = 3;
                }
            } else if (this.level === 2) {
                // level 2 interaction here
            } 
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
            for (var i = 0; i < this.rooms.length; i++) {
                ctx.fillStyle = "red";
                ctx.lineWidth = 10;
                ctx.fillText(i, this.rooms[i].x * scale, this.rooms[i].y * scale);
            }
        } else if (!this.game.started && !this.game.extra) {
            let starthover = false;
            let extrahover = false;
            if(this.playonce)
                ASSET_MANAGER.playAsset("./sounds/music/maintheme.mp3");
                ASSET_MANAGER.autoRepeat("./sounds/music/maintheme.mp3");
                this.playonce = false;
            ctx.font = "BOLD 40px Comic Sans";
            this.animations.drawFrame(this.game.clockTick, this.game.ctx, 0, 0, 1);
            //START BUTTON
            this.buttonanimations.drawFrame(this.game.clockTick, this.game.ctx, PARAMS.canvas_width *0.32, PARAMS.canvas_height*0.75, 6);
            //EXTRA BUTTON
            this.buttonanimations.drawFrame(this.game.clockTick, this.game.ctx, PARAMS.canvas_width *0.52, PARAMS.canvas_height*0.75, 6);
            ctx.drawImage(this.title, PARAMS.canvas_width*0.355, PARAMS.canvas_height*0.07, 354, 145);
            ctx.fillStyle = "#A9A9A9";
            //If our mouse has come on canvas
            if(this.game.hover != null) {
                //If we are hovering over button.
                if(this.game.hover.x >= PARAMS.canvas_width*0.32 && this.game.hover.x < PARAMS.canvas_width*0.45) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.75 && this.game.hover.y < PARAMS.canvas_height*0.91) {
                        starthover = true;
                    }
                }
                if(this.game.hover.x >= PARAMS.canvas_width*0.515 && this.game.hover.x < PARAMS.canvas_width*0.64) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.75 && this.game.hover.y < PARAMS.canvas_height*0.91) {
                        extrahover = true;
                    }
                }
            }
            ctx.lineWidth = 10;
            if(starthover)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("START", PARAMS.canvas_width*0.34, PARAMS.canvas_height*0.82);

            ctx.fillStyle = "#A9A9A9";
            if(extrahover)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("EXTRA", PARAMS.canvas_width*0.535, PARAMS.canvas_height*0.82);
            ctx.fillStyle = "#A9A9A9";

            //If our mouse has clicked canvas
            if(this.game.click != null) {
                //If we are clicking in range load lvl 1.
                if(this.game.click.x >= PARAMS.canvas_width*0.32 && this.game.click.x < PARAMS.canvas_width * 0.45) {
                    if(this.game.click.y >= PARAMS.canvas_height * 0.75 && this.game.click.y < PARAMS.canvas_height*0.91) {
                        // resize canvas when game start
                        var canvas = document.getElementById("gameWorld");
                        canvas.getContext('2d').imageSmoothingEnabled = true;
                        canvas.height = 900;
                        PARAMS.canvas_height = 900;
                        canvas.getContext('2d').imageSmoothingEnabled = false;
                        
                        this.game.started = true;
                        this.game.leftclick = false;
                        this.game.click = null;
                        this.loadLevel3();
                        
                        
                        
                    }
                } else if(this.game.click.x >= PARAMS.canvas_width*0.515 && this.game.click.x < PARAMS.canvas_width * 0.64) {
                    if(this.game.click.y >= PARAMS.canvas_height * 0.75 && this.game.click.y < PARAMS.canvas_height*0.91) {
                        this.game.extra = true;
                        this.game.started = true;
                        this.game.click = null; //reset click
                        this.game.addEntity(new Extras(this.game, 0, 0));
                    }
                }
            }
        }

        if(this.game.started && !this.game.extra) {
            if (this.level === 1 || this.level === 2) 
                this.minimap.draw(ctx);
            this.inventory.draw(ctx);

                // -----------------draw hp bar section:
            // draw gui
            ctx.drawImage(this.panel, 95, 36, 27, 25, -5, PARAMS.canvas_height*0.885, 27*4, 25*4);
            ctx.drawImage(this.panel, 135, 20, 50, 8, PARAMS.canvas_width*0.08, PARAMS.canvas_height*0.92, 50*9, 8*9);
            this.avaanimation.drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width*0.008 - 20, PARAMS.canvas_height*0.911, 1.4);
            // fetch hp bar from rutherford then draw
            var hp = this.char.hp;
            var percentage = hp.current / hp.maxHealth;
            ctx.font = `bold 18px Comic Sans MS`;
            
        
            // draw hp
            if (percentage < 0) percentage = 0;
            ctx.fillStyle = hp.getColor(percentage);
            ctx.fillRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.92 + 10, 405*percentage, 21);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.92 + 10, 405, 21);
            // give text
            ctx.fillStyle = "white";
            ctx.fillText(`${Math.round(hp.current)}/${hp.maxHealth}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.92 + 27);
            
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeText(`${Math.round(hp.current)}/${hp.maxHealth}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.92 + 27); 

            //draw mp
            var percentageMana = hp.currMana / hp.maxMana;
            if (percentageMana < 0) percentageMana = 0;
            ctx.fillStyle = "rgb(30, 100, 255)";
            ctx.fillRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.92 + 32, 405*percentageMana, 21);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(PARAMS.canvas_width*0.08 + 9,  PARAMS.canvas_height*0.92 + 32, 405, 21);
            // give text
            ctx.fillStyle = "white";
            ctx.fillText(`${Math.round(hp.currMana)}/${hp.maxMana}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.92 + 49);
            ctx.strokeStyle = "black";
            ctx.strokeText(`${Math.round(hp.currMana)}/${hp.maxMana}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.92 + 49);
            ctx.lineWidth = 1;
        }
    }

    releaseLock() {
        this.tempObstacles.forEach(e => {
            e.removeFromWorld = true;
        });
        this.locked = false;
    }

    isInRoom(room) {
        return (this.char !== undefined && room !== undefined &&
            this.char.x / 64 > room.x && this.char.x/64 < room.x + room.w &&
            this.char.y / 64 > room.y && this.char.y/64 < room.y + room.h &&
            !this.locked);
    }
};


class Minimap {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/minimap.png");
        this.scale = 1.5;
        // SHOULD ALWAYS BE AN ODD NUMBER
        this.size = 29*this.scale; // map pixel size, how many things gonna be on the screen
        this.psize = 7 / this.scale;  // size of each pixel

        this.x = Math.round(PARAMS.canvas_width * (1 - 1/20) - 29 * 7);
        this.y = Math.round(PARAMS.canvas_height / 20);
    };

    updateScale(value) {
        this.scale += value;

        if (this.scale > 2) this.scale = 2;
        if (this.scale < 1) this.scale = 1;

        this.size = 29*this.scale; // map pixel size, how many things gonna be on the screen
        this.psize = 7 / this.scale;  // size of each pixel
    };

    draw(ctx) {
        
        // calculate rutherford current coordinatea
        var cx = this.game.camera.char.x / 64;
        var cy = this.game.camera.char.y / 64;
        
        // use the generated map to draw the terrain first
        for(var i = Math.round(cy) - Math.round((this.size-1)/2); i <= Math.round(cy) + Math.round((this.size-1)/2); i++) {
            for (var j = Math.round(cx) - Math.round((this.size-1)/2); j <= Math.round(cx) + Math.round((this.size-1)/2); j++) {
                if (this.game.camera.map[i] !== undefined && this.game.camera.map[i][j] === 1) {
                    if (this.game.camera.level === 1) {
                        ctx.fillStyle = "#00b530";
                    } else if (this.game.camera.level === 2) {
                        ctx.fillStyle = "darkgrey";
                    }
                }
                else { 
                    if (this.game.camera.level === 1) {
                        ctx.fillStyle = "darkgreen";
                    } else if (this.game.camera.level === 2) {
                        ctx.fillStyle = "#454545";
                    }
                }
                ctx.fillRect(this.x + (j - cx + (this.size-1)/2) * this.psize, 
                    this.y + (i- cy + (this.size-1)/2) * this.psize, this.psize, this.psize);
            }
        }
        
        // draw entities
        this.game.entities.forEach(e => {
            if ((e instanceof Enemy) &&
                    this.isInMapRange(cx, cy, e.x, e.y)) {
                ctx.fillStyle = "red";
                ctx.fillRect(this.x + (e.x/64 - cx + (this.size-1)/2) * this.psize, 
                        this.y + (e.y/64 - cy + (this.size-1)/2) * this.psize, this.psize, this.psize);
            } else if (e instanceof Barrel && this.isInMapRange(cx, cy, e.x, e.y)) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(this.x + (e.x/64 - cx + (this.size-1)/2) * this.psize, 
                        this.y + (e.y/64 - cy + (this.size-1)/2) * this.psize, this.psize, this.psize);
            }
        });

        // draw rutherford
        ctx.fillStyle = "darkblue";

        ctx.fillRect(this.x + 28 * 7 / 2, 
                    this.y + 28 * 7 / 2, 7, 7);

        // draw map frame
        ctx.drawImage(this.spritesheet, 0, 0, 29 + 4, 29 + 4, this.x - this.psize * 2 * this.size /29, this.y - this.psize * 2 * this.size /29, (29+4) * this.psize * this.size /29, (29+4) * this.psize * this.size /29);
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 5; // to cover the map bug lmaooooooo
        ctx.strokeRect(this.x  , this.y , this.size * this.psize, this.size * this.psize);
        ctx.lineWidth = 1; // return the stroke size back
        
    }

    // check if entity is within rutherford range to draw in map
    isInMapRange(cx, cy, ex, ey) {
        var x = ex/64;
        var y = ey/64;
        return x >= cx - (this.size-1)/2 && x <= cx + (this.size-1)/2 &&
            y >= cy - (this.size-1)/2 && y <= cy + (this.size-1)/2;
    }
};

/**
 * Inventory display on screen.
 */
class Inventory {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.uisheet = ASSET_MANAGER.getAsset("./sprites/GUI.png");
        this.itemsheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");
        this.scale = 1.75;
        
        // regen value for each potion
        this.regen = [200, 100, 200, 100]; //Coincides with "type" variable.

        // we have 4 slots on screen
        // 1 for hp
        // 2 for mini hp
        // 3 for mp 
        // 4 for mini mp
        // this array contains the number that we currently have
        this.slots = [2 ,2 ,2, 2];
        this.current = 2;
    }

    update() {

    }

    draw(ctx) {

        // custom properties for each item
        var p = [{sx: 32, ox: -5}, {sx: 64, ox: -2}, {sx: 48, ox: 1}, {sx: 80, ox: 4}];

        for (var i = 0; i < this.slots.length; i++) {
            var extrascale = 1; // scale when item is selected
            if (i+1 === this.current) {
                // change opacity
                ctx.globalAlpha = 0.9;
                extrascale = 1.15;
            } else {
                ctx.globalAlpha = 0.4;
            }
            // for current selecting item, offset to simulate enlarge from center
            var offset = 30 * this.scale * (extrascale-1)/2;
            // draw ui
            ctx.drawImage(this.uisheet, 81, 97, 30, 30, this.x  + 36*i*this.scale - offset, this.y - offset, 30 * this.scale * extrascale, 30 * this.scale * extrascale);

            // draw item
            ctx.drawImage(this.itemsheet, p[i].sx, 160, 16, 16, this.x + 38*i*this.scale - p[i].ox - offset, this.y - offset, 16 * this.scale * 1.5 * extrascale, 16 * this.scale * 1.5 * extrascale);

            // draw number
            ctx.globalAlpha = 1;
            ctx.fillStyle = "white";
            // item count
            ctx.font = `${10*extrascale}px Comic Sans MS`;
            ctx.fillText(this.slots[i], this.x + 38*i*this.scale - p[i].ox + 3 - offset/3, this.y + 25 * this.scale + offset/3);
            // item key
            ctx.font = `${14*extrascale}px Comic Sans MS`;
            ctx.fillText(i + 1, this.x + 38*i*this.scale - p[i].ox - 3 - offset, this.y + 8 * this.scale - offset);
        }
        
        ctx.globalAlpha = 1;
    }

    useItem() {
        var ruth = this.game.camera.char;
        if (ruth.action !== 7) {
            var current = this.current - 1;
            if (this.slots[current] > 0) {
                if(current === 0 || current === 1) {
                    // make sure potion dont overheal
                    var heal = ruth.hp.maxHealth - ruth.hp.current;
                    ruth.hp.current += (heal < this.regen[current] ? heal : this.regen[current]);
                    this.game.addEntity(new Score(this.game, ruth.bound.x + ruth.bound.w/2, ruth.bound.y, this.regen[current], 0));
                } else {
                    var heal = ruth.hp.maxMana - ruth.hp.currMana;
                    ruth.hp.currMana += (heal < this.regen[current] ? heal : this.regen[current]);
                    this.game.addEntity(new Score(this.game, ruth.bound.x + ruth.bound.w/2, ruth.bound.y, this.regen[current], 1));
                }
                this.slots[current]--;
                ASSET_MANAGER.playAsset("./sounds/sfx/use_potion.mp3");
            } else {
                ASSET_MANAGER.playAsset("./sounds/sfx/no_potion.mp3");
            }       
        }
    }
}