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
        this.checkpoint = null;

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
        this.resetState();
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
        if (!this.char)
            this.char =  new Rutherford(this.game, (startRoom.x + startRoom.w/2) * 32 * scale,  (startRoom.y + startRoom.h/2) * 32 * scale, false); 
        this.char.x = (startRoom.x + startRoom.w/2) * 32 * scale;
        this.char.y = (startRoom.y + startRoom.h/2) * 32 * scale;
        this.char.hp.current = this.char.hp.maxHealth;
        this.checkpoint = { x: this.char.x, y: this.char.y, audio: "./sounds/music/greenpath-ambient.mp3", stage: 1};
        
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
                } else if (e[0] === "wormy") {
                    for (var i = 0; i < e[1]; i ++) {
                        var sx = 0;
                        var sy = 0;
                        while (m[sy][sx] === 0) {
                            sx = r.x + randomInt(Math.floor(r.w * 0.6)) + Math.floor(r.w * 0.2);
                            sy = r.y + randomInt(Math.floor(r.h * 0.6)) + Math.floor(r.h * 0.2);
                        }
                        this.game.addEntity(new Wormy(this.game, sx * 32 * scale, sy * 32 * scale));
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

        //840, 4100
        this.merchant = new Merchant(this.game, 840, 4100, 1);
        this.game.addEntity(this.merchant);
        this.game.addEntity(this.char);

        //var fk = new Fernight(this.game, 6100, 7200);
        //this.game.addEntity(fk);

        // lock the boss room from the beginning
        this.tempObstacles = lockRoom(this.game, this.rooms[8], this.map, p);
        
        //this.game.addEntity(new Slippey(this.game, character.x- 500, character.y));
        this.playTheme("./sounds/music/greenpath-ambient.mp3");
    };

    /**
     * Load Level 2.
     * 
     * @param {*} x starting point of main char 
     * @param {*} y starting point of main char
     */
    loadLevel2() {
        this.resetState();
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
        
        // scale from normal 32x32 sprite
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
            } else if (rooms[i].key === "final") {
                end = rooms[i];
            }
        }
        if (!this.char)
            this.char = new Rutherford(this.game, (start.x + start.w/2) * 32 * scale,  (start.y + start.h/2) * 32 * scale, false); 
        
        this.char.x = (start.x + start.w/2) * 32 * scale;
        this.char.y = (start.y + start.h/2) * 32 * scale;
        this.char.hp.current = this.char.hp.maxHealth;
        this.checkpoint = { x: this.char.x, y: this.char.y, audio: "./sounds/music/level2-stage1.mp3", stage: 1};

        
        // fill enemies
        rooms.forEach(r => {
            r.enemies.forEach(e => { 
                if (e[0] === "slimee") {
                    var enemy = new Slime(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale, 5);
                    this.game.addEntity(enemy);
                } else if (e[0] === "slippey") {
                    var enemy = new Slippey(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(enemy);
                } else if (e[0] === "wormito") {
                    var enemy = new Wormito(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(enemy);
                }  else if (e[0] === "doublops") {
                    var enemy = new Doublops(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(enemy);
                } else if (e[0] === "fernight") {
                    this.game.addEntity(new Fernight(this.game, r.x * 64, r.y * 64, r));
                    this.game.addEntity(new Fernight(this.game, (r.x + randomInt(5)+1) * 64, r.y * 64 + (r.h -1.1)*64, r));
                } else if (e[0] === "drumbuck") {
                    this.bossroom = r;
                    this.boss = new Drumbuck(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale);
                    this.game.addEntity(this.boss);
                } else if (e[0] === "merchant") {
                    this.merchant = new Merchant(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale, 2);
                    this.game.addEntity(this.merchant);
                }  else if (e[0] === "polnariff") {
                    this.boss2 = new Polnariff(this.game, Math.floor(r.x + r.w/2) * 32 * scale, Math.floor(r.y + r.h/2) * 32 * scale, end);
                    this.game.addEntity(this.boss2);
                }
            });
        });

        
        // spawn barrels 
        // barrels will only spawn next to walls
        // the more trees, the higher chance
        // the total will be purely random
        for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[0].length; j++) {
                // i is y, j is x
                if (m[i][j] === 1) {
                    // count awalls surround
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
                }
            }
        } 

        this.game.addEntity(this.char);


        this.playTheme("./sounds/music/level2-stage1.mp3");
    }

    loadLevel3() {
        this.resetState();
        this.level = 3;

        var b = 8;  // unit size
        var scale = 4;
        var ss = ASSET_MANAGER.getAsset("./sprites/background.png");

        // add pre background
        for (var i = 0; i < 69; i++) {
            for (var j = 0; j< 69; j++) {
                if (Math.random() < 0.1)
                    this.game.addBg(new Ground(this.game, (j-15) * b * scale, (i-15) * b * scale, {spritesheet: ss, sx: (6 + randomInt(5))*b, sy: 67 * b, width: b, height: b, scale: scale}));
            }
        }
        
        // 0 = none, 1 = block
        // ! = ground, $ = carpet 
        // % = logo, ^ = path intersection
        // t = carpet edge top, b = carpet edge bottom
        // l = carpet edge left, r = carpet edge right
        // q = carpet tl corner, w = carpet tr corner
        // e = carpet bl corner, a = carpet br corner
        // s = vertical path, d = horizontal path
        var keys = {
            "1" : {x: 0, y: 35},
            "!" : {x: 0, y: 74},
            "$" : {x: 1, y: 3},
            "%" : [{x: 1, y: 1}, {x: 10, y: 1}, {x: 1, y: 10}, {x: 10, y: 10}, {x: 1, y: 15}],
            "^" : {x: 0, y: 72},
            "t" : [{x: 1, y: 0}, {x: 10, y: 0}, {x: 1, y: 9}, {x: 10, y: 9}, {x: 1, y: 14}],
            "b" : [{x: 1, y: 4}, {x: 10, y: 4}, {x: 1, y: 13}, {x: 10, y: 13}, {x: 1, y: 18}],
            "l" : [{x: 0, y: 1}, {x: 9, y: 1}, {x: 0, y: 10}, {x: 9, y: 10}, {x: 0, y: 15}],
            "r" : [{x: 6, y: 1}, {x: 15, y: 1}, {x: 6, y: 10}, {x: 15, y: 10}, {x: 6, y: 15}],
            "q" : [{x: 0, y: 0}, {x: 9, y: 0}, {x: 0, y: 9}, {x: 9, y: 9},{x: 0, y: 14}],
            "w" : [{x: 6, y: 0}, {x: 15, y: 0}, {x: 6, y: 9}, {x: 15, y: 9}, {x: 6, y: 14}],
            "e" : [{x: 0, y: 4}, {x: 9, y: 4}, {x: 0, y: 13}, {x: 9, y: 13}, {x: 0, y: 18}],
            "a" : [{x: 6, y: 4}, {x: 15, y: 4}, {x: 6, y: 13}, {x: 15, y: 13}, {x: 6, y: 18}],
            "d" : {x: 1, y: 72},
            "s" : {x: 8, y: 72}
        }

        var logo = randomInt(5);

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
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch][logo].x * b, sy: keys[ch][logo].y * b, width: b * 5, height: b * 3, scale: scale});
                else if (ch === "!") {
                    var r = randomInt(26);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: (keys[ch].x + r % 15) * b, sy: (keys[ch].y + Math.floor(r / 15)) * b, width: b, height: b, scale: scale});
                } else if (ch === "1") {
                    bg = new Obstacle(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch].x * b, sy: keys[ch].y * b, width: b, height: b, scale: scale, bound: {x: 0, y: 0, w: 1, h: 1}});
                    this.game.addEntity(bg);
                } else if (ch === "s" || ch === "d") {
                    var r = randomInt(7);
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: (keys[ch].x + r) * b, sy: keys[ch].y * b, width: b, height: b, scale: scale});
                } else   {
                    if (keys[ch][logo])  
                        bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch][logo].x * b, sy: keys[ch][logo].y * b, width: b, height: b, scale: scale});
                    else 
                    bg = new Ground(this.game, j * b * scale, i * b * scale, {spritesheet: ss, sx: keys[ch].x * b, sy: keys[ch].y * b, width: b, height: b, scale: scale});
                }
                if (bg)
                    this.game.addBg(bg);
            }  
        }
        if (!this.char)
            this.char = new Rutherford(this.game, 500,  500, false); 

        this.char.x = 500;
        this.char.y = 500;
        this.char.hp.current = this.char.hp.maxHealth;
        
        
        this.boss = new Raven(this.game, 575, 550);
        this.game.addEntity(this.boss); 
        


        // add planets
        this.planets = [];
        for (var i = 0; i < 8; i++) {
            this.planets.push(new Planet(this.game, 500, 500, 8-i, 700+i*50, i));
            this.game.addEntity(this.planets[i]);
        }

        this.game.addEntity(this.char);
        ASSET_MANAGER.pauseBackgroundMusic();
        ASSET_MANAGER.playAsset("./sounds/music/Ignotus.mp3", 0.8);
        ASSET_MANAGER.autoRepeat("./sounds/music/Ignotus.mp3");
    }

    loadCredits() {
        this.resetState();
        this.level = 4;

        var b = 8;  // unit size
        var scale = 4;
        var ss = ASSET_MANAGER.getAsset("./sprites/background.png");

        // add pre background
        for (var i = 0; i < 250; i++) {
            for (var j = 0; j< 40; j++) {
                if (Math.random() < 0.01)
                    this.game.addBg(new Ground(this.game, 50+ (j-15) * b * scale, (i-15) * b * scale, {spritesheet: ss, sx: (6 + randomInt(5))*b, sy: 67 * b, width: b, height: b, scale: scale}));
            }
        }
        

        if (!this.char)
            this.char = new Rutherford(this.game, 200, -700, false);
        
        this.char.x = 200;
        this.char.y = -700;
        this.char.hpregen = 5;
        this.char.hp.maxHealth = 99999;
        this.char.hp.maxMana = 99999;
        this.char.hp.current = this.char.hp.maxHealth;
        this.char.hp.currMana = this.char.hp.maxMana;

        var models = [];
        models.push(new Fayere(this.game, -50, 600));
        models.push(new Bunny(this.game, 250, 600));
        models.push(new Ais(this.game, 500, 600));

        models.push(new Cyclops(this.game, -100, 1000));
        models.push(new Doublops(this.game, 450, 1000));

        models.push(new Wormy(this.game, -100, 1600));
        models.push(new Wormito(this.game, 450, 1600));

        models.push(new Slime(this.game, -50, 2200, 5));
        models.push(new Slippey(this.game, 500, 2300));

        models.push(new Buck(this.game, -50, 3200));
        models.push(new Drumbuck(this.game, 500, 3200));

        models.push(new Polnariff(this.game, 260, 4200));
        models[models.length-1].state = 1;
        models.push(new SunPortal(this.game, 570, 4250));
        models.push(new KnifePortal(this.game, 420, 4220));
        models.push(new MiasmaPortal(this.game, 420, 4300, {x:0, y:0}, 0, 0, 0));
        models.push(new Barrel(this.game, -80, 4250, "sred"));
        models.push(new Barrel(this.game, 120, 4250, "red"));
        models.push(new Barrel(this.game, -30, 4200, "sblue"));
        models.push(new Barrel(this.game, 70, 4200, "blue"));
        models.push(new Barrel(this.game, -30, 4300, "fayere"));
        models.push(new Barrel(this.game, 70, 4300, "threecoin"));
        var coins = new BunchofCoins(this.game, 30, 4270, 100);
        coins.special = true;
        models.push(coins);

        models.push(new Raven(this.game, 270, 5000));
        models[models.length-1].active = false;
        models.push(new Jojoeffect(this.game, 110, 4980));
        models.push(new Jojoeffect(this.game, 170, 4980));
        var beam = new Beam(this.game, 440, 5080);
        beam.animation.loop = true;
        models.push(beam);
        

        for (var i = 0; i < models.length; i++) {
            models[i].speed = 0;
            models[i].triggerrange = 350;
            if (models[i] instanceof Buck || models[i] instanceof Drumbuck)
                models[i].triggerrange = 200;

            this.game.addEntity(models[i]);
        }

        this.shootphrase("fusillade", 3.5, -180, -350);
        this.shootphrase("a game by", 1, 120, -250, 0);
        this.shootphrase("hieu (victor) chau", 2, -275, -100, 11);
        this.shootphrase("ali iftakhar", 2, -105, -10, 9);
        this.shootphrase("askhdeep cheema", 2, -190, 80, 10);
        this.shootphrase("fayere", 0.5, -70, 590, 2);
        this.shootphrase("ali", 0.5, -50, 650, 9);
        this.shootphrase("ais", 0.5, 505, 590, 2);
        this.shootphrase("ali", 0.5, 505, 650, 9);
        this.shootphrase("bunny", 0.5, 232, 590, 2);
        this.shootphrase("victor", 0.5, 225, 650, 11);
        this.shootphrase("cyclops", 0.5, -80, 1030, 2);
        this.shootphrase("askhdeep", 0.5, -90, 1150, 10);
        this.shootphrase("ali", 0.5, -50, 1170, 9);
        this.shootphrase("victor", 0.5, -73, 1190, 11);
        this.shootphrase("doublops", 0.5, 462, 1030, 2);
        this.shootphrase("ali", 0.5, 505, 1150, 9);
        this.shootphrase("wormy", 0.5, -35, 1620, 2);
        this.shootphrase("askhdeep", 0.5, -60, 1745, 10);
        this.shootphrase("ali", 0.5, -22, 1765, 9);
        this.shootphrase("wormito", 0.5, 490, 1620, 2);
        this.shootphrase("ali", 0.5, 525, 1745, 9);
        this.shootphrase("slimee", 0.5, -8, 2305, 2);
        this.shootphrase("victor", 0.5, -8, 2380, 11);
        this.shootphrase("slippey", 0.5, 495, 2305, 2);
        this.shootphrase("ali", 0.5, 525, 2390, 9);
        this.shootphrase("buck", 0.5, 30, 3235, 2);
        this.shootphrase("ali", 0.5, 38, 3355, 9);
        this.shootphrase("drumbuck", 0.5, 550, 3235, 2);
        this.shootphrase("ali", 0.5, 590, 3355, 9);
        this.shootphrase("merchan", 0.5, 10, 4180, 2);
        this.shootphrase("ali", 0.5, 40, 4380, 9);
        this.shootphrase("polnariff", 0.5, 455, 4180, 2);
        this.shootphrase("victor", 0.5, 480, 4380, 11);
        this.shootphrase("raven", 0.5, 294, 4980, 2);
        this.shootphrase("ali", 0.5, 185, 5150, 9);
        this.shootphrase("victor", 0.5, 405, 5150, 11);

        this.shootphrase("rutherford", 0.5, 270, 5500, 2);
        this.shootphrase("ali", 0.5, 325, 5640, 9);
        this.shootphrase("victor", 0.5, 300, 5660, 11);

        this.shootphrase("core functionalities", 0.5, 190, 5900, 2);
        this.shootphrase("victor", 0.5, 310, 5930, 11);
        this.shootphrase("prof. chris marriot", 0.5, 205, 5955, 6);

        this.shootphrase("maps implementation", 0.5, 200, 6120, 2);  
        this.shootphrase("victor", 0.5, 310, 6150, 11);

        this.shootphrase("music & art scouting", 0.5, 195, 6300, 2);  
        this.shootphrase("ali", 0.5, 335, 6330, 9);
        this.shootphrase("askhdeep", 0.5, 295, 6355, 10); 
        
        this.shootphrase("thanks for playing!", 1, 100, 6500, 4); 

        for (var i = 0; i < 20; i++) {
            this.game.addEntity(new Bunny(this.game, 220, 6900+420));
        }

        this.game.addEntity(this.char);
        this.playTheme("./sounds/music/fortnite.mp3");
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
                    this.playTheme("./sounds/music/greenpath-action.mp3");
                    this.stage = 2;
                    this.releaseLock();
                }
                // check if rutherford is in boss room
                else if (this.stage === 2 && this.boss && this.isInRoom(this.rooms[8])) {
                    this.checkpoint = {x: this.merchant.x, y: this.merchant.y, audio: "./sounds/music/greenpath-action.mp3", stage: 2};
                    // sprite for tree
                    var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/forest_tiles.png"), sx: 0, sy: 192, width: 64, height: 64, scale: 1, 
                                bound: {x: 0, y: 0, w: 1, h: 1}};
                    this.tempObstacles = lockRoom(this.game, this.rooms[8], this.map, p);
                    this.locked = true;
                    this.playTheme("./sounds/music/buck.mp3");
                } else if (this.stage === 2 && this.boss && this.boss.removeFromWorld && this.char.hp.current > 0) {
                    // after defeating buck
                    this.playTheme("./sounds/music/greenpath-ambient.mp3");
                    this.releaseLock();
                    this.stage = 3;
                    this.timestamp = Date.now();
                } else if (this.stage === 3 && this.boss && Date.now() - this.timestamp >= 2000) {
                    // spawn level 2 portal
                    var x = this.boss.x +64;
                    var y = this.boss.y;
                    this.boss = null;
                    var pp = {spritesheet: ASSET_MANAGER.getAsset("./sprites/forest_tiles.png"), sx: 32, sy: 96, width: 32, height: 32, scale: 2};
                    for (var i = 0; i < 10; i++) {
                        this.game.addBg(new Ground(this.game, x, y - 64*i, pp));
                    }
                    pp = { spritesheet: ASSET_MANAGER.getAsset("./sprites/dungeon.png"), sx: 64, sy: 128, width: 16, height: 16, scale: 4, 
                                bound: {x: 0, y: 0, w: 1, h: 1}};
                    this.game.addEntity(new Obstacle(this.game, x, y - 64*10, pp, "ye"));
                    this.stage = 4;
                }
            } else if (this.level === 2) {
                // level 2 interaction here
                
                // check if rutherford enters miniboss room
                if (this.stage === 1 && this.isInRoom(this.bossroom)) {
                    var b = this.rooms[this.rooms.path[Math.floor(this.rooms.path.length/2) - 1]];
                    this.checkpoint = {x: (b.x + b.w/2)*64, y: (b.y + b.h/2)*64, audio: "./sounds/music/level2-stage1.mp3", stage: 1};

                    this.playTheme("./sounds/music/drumbuck.mp3");
                    this.stage = 2;

                    var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/background.png"), sx: 16, sy: 344, width: 8, height: 8, scale: 8, 
                                bound: {x: 0, y: 0, w: 1, h: 1}};
                    this.tempObstacles = lockRoom(this.game, this.bossroom, this.map, p);
                    this.locked = true;
                    this.boss.active = true;
                }
                // check if drumbuck is defeated 
                else if (this.stage === 2 && this.boss.removeFromWorld && this.char.hp.current > 0) {
                    this.checkpoint = {x: this.merchant.x, y: this.merchant.y, audio: "./sounds/music/level2-stage2.mp3", stage: 3};
                    this.releaseLock();
                    this.stage = 3;

                    this.playTheme("./sounds/music/level2-stage2.mp3");
                }
                // check if rutherford is in boss room
                else if (this.stage === 3 && this.isInRoom(this.boss2.room)) {
                    // polnariff encounter
                    var b = this.rooms[this.rooms.path[this.rooms.path.length - 2]];
                    this.checkpoint = {x: (b.x + b.w/2)*64, y: (b.y + b.h/2)*64, audio: "./sounds/music/level2-stage2.mp3", stage: 3};

                    // sprite for blocking block
                    var p = { spritesheet: ASSET_MANAGER.getAsset("./sprites/background.png"), sx: 16, sy: 344, width: 8, height: 8, scale: 8, 
                                bound: {x: 0, y: 0, w: 1, h: 1}};
                    this.tempObstacles = lockRoom(this.game, this.boss2.room, this.map, p);
                    this.locked = true;
                    this.stage = 4;

                    this.boss2.active = true;
                    this.boss2.generaltimestamp = Date.now();
                    this.playTheme("./sounds/music/polnariff.mp3");
                } else if (this.stage === 4 && this.boss2.hp.current <= 0 && this.boss2.state === 0 && this.char.hp.current > 0) {
                    // after polnariff defeated 
                    this.releaseLock();
                    this.stage = 5;
                    this.merchant.removeFromWorld = true;
                    this.merchant = new Merchant(this.game, this.boss2.x, this.boss2.y, 3);
                    this.game.addEntity(this.merchant);
                    this.boss2.removeFromWorld = true;
                    ASSET_MANAGER.pauseBackgroundMusic();
                    this.char.coins+= 50;
                }
            } else if (this.level === 3) {
                // level 3 interactions
                if (this.boss && this.boss.hp)
                    this.planets.forEach(e => {
                        var mul;
                        if (this.boss.hp.current > 0) {
                            mul = 1/Math.sqrt(this.boss.hp.current/this.boss.hp.maxHealth);
                            if (mul > 30) mul = 30;
                            e.spdmul = mul;
                        } else {
                            e.spdmul = 1;
                        }
                        
                    });
            } else if (this.level === 4) {
                // credits level interaction
                if (this.char.bound.x >= 320 && this.char.bound.x <= 350
                        && this.char.bound.y >= 5540 && this.char.bound.y <= 5580) {

                    if (this.char.coins < 999) {
                        this.char.coins++;
                    } else {
                        this.char.coins = 0;
                    }
                }
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
            let lvl1hover = false;
            let lvl2hover = false;
            let lvl3hover = false;
            let credits = false;

            if(this.playonce) {
                this.playTheme("./sounds/music/maintheme.mp3");
                this.playonce = false;
            }
            ctx.font = "BOLD 40px Comic Sans";
            this.animations.drawFrame(this.game.clockTick, this.game.ctx, 0, 0, 1);
            //Select Level Background
            ctx.drawImage(this.panel, 2, 33, 43, 43, PARAMS.canvas_width*0.01 - 17, PARAMS.canvas_height*0.65+9, 120, 240);
            //Level 1 Button
            ctx.drawImage(this.panel, 113, 81, 32, 16, PARAMS.canvas_width*0.01-2.5, PARAMS.canvas_height*0.69+9, 100, 60);
            //Level 2 Button
            ctx.drawImage(this.panel, 113, 81, 32, 16, PARAMS.canvas_width*0.01-2.5, PARAMS.canvas_height*0.76+9, 100, 60);
            //Level 3 Button
            ctx.drawImage(this.panel, 113, 81, 32, 16, PARAMS.canvas_width*0.01-2.5, PARAMS.canvas_height*0.83+9, 100, 60);
            //Credits Button
            ctx.drawImage(this.panel, 113, 81, 32, 16, PARAMS.canvas_width*0.01-2.5, PARAMS.canvas_height*0.9+9, 100, 60);
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
                if(this.game.hover.x >= PARAMS.canvas_width*0.01 && this.game.hover.x < PARAMS.canvas_width*0.08) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.7 && this.game.hover.y < PARAMS.canvas_height*0.76) {
                        lvl1hover = true;
                    }
                }
                if(this.game.hover.x >= PARAMS.canvas_width*0.01 && this.game.hover.x < PARAMS.canvas_width*0.08) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.77 && this.game.hover.y < PARAMS.canvas_height*0.83) {
                        lvl2hover = true;
                    }
                }
                if(this.game.hover.x >= PARAMS.canvas_width*0.01 && this.game.hover.x < PARAMS.canvas_width*0.08) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.84 && this.game.hover.y < PARAMS.canvas_height*0.91) {
                        lvl3hover = true;
                    }
                }
                if(this.game.hover.x >= PARAMS.canvas_width*0.01 && this.game.hover.x < PARAMS.canvas_width*0.08) {
                    if(this.game.hover.y >= PARAMS.canvas_height*0.91 && this.game.hover.y < PARAMS.canvas_height*0.98) {
                        credits = true;
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

            ctx.font = "BOLD 25px Comic Sans";
            if(lvl1hover)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("Level 1", PARAMS.canvas_width*0.01+5, PARAMS.canvas_height*0.745);
            ctx.fillStyle = "#A9A9A9";

            if(lvl2hover)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("Level 2", PARAMS.canvas_width*0.01+5, PARAMS.canvas_height*0.815);
            ctx.fillStyle = "#A9A9A9";

            if(lvl3hover)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("Level 3", PARAMS.canvas_width*0.01+5, PARAMS.canvas_height*0.885);
            ctx.fillStyle = "#A9A9A9";

            if(credits)
                ctx.fillStyle = "#ffffff";
            ctx.fillText("Credits", PARAMS.canvas_width*0.01+5, PARAMS.canvas_height*0.955);
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
                        this.loadLevel1();
                    }
                } else if(this.game.click.x >= PARAMS.canvas_width*0.515 && this.game.click.x < PARAMS.canvas_width * 0.64) {
                    if(this.game.click.y >= PARAMS.canvas_height * 0.75 && this.game.click.y < PARAMS.canvas_height*0.91) {
                        this.game.extra = true;
                        this.game.started = true;
                        this.game.click = null; //reset click
                        this.game.addEntity(new Extras(this.game, 0, 0));
                    }
                } else if(this.game.click.x >= PARAMS.canvas_width*0.01 && this.game.click.x < PARAMS.canvas_width*0.08) {
                    if(this.game.click.y >= PARAMS.canvas_height*0.7 && this.game.click.y < PARAMS.canvas_height*0.76) {
                        // resize canvas when game start
                        var canvas = document.getElementById("gameWorld");
                        canvas.getContext('2d').imageSmoothingEnabled = true;
                        canvas.height = 900;
                        PARAMS.canvas_height = 900;
                        canvas.getContext('2d').imageSmoothingEnabled = false;
                                                
                        this.game.started = true;
                        this.game.leftclick = false;
                        this.game.click = null;
                        this.loadLevel1();
                    } else if(this.game.click.y >= PARAMS.canvas_height*0.77 && this.game.click.y < PARAMS.canvas_height*0.83) {
                        // resize canvas when game start
                        var canvas = document.getElementById("gameWorld");
                        canvas.getContext('2d').imageSmoothingEnabled = true;
                        canvas.height = 900;
                        PARAMS.canvas_height = 900;
                        canvas.getContext('2d').imageSmoothingEnabled = false;
                                                
                        this.game.started = true;
                        this.game.leftclick = false;
                        this.game.click = null;
                        this.loadLevel2();
                    } else if(this.game.click.y >= PARAMS.canvas_height*0.84 && this.game.click.y < PARAMS.canvas_height*0.91) {
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
                    } else if(this.game.click.y >= PARAMS.canvas_height*0.92 && this.game.click.y < PARAMS.canvas_height*0.99) {
                        //CREDITS GO HERE
                        // resize canvas when game start
                        var canvas = document.getElementById("gameWorld");
                        canvas.getContext('2d').imageSmoothingEnabled = true;
                        canvas.height = 900;
                        PARAMS.canvas_height = 900;
                        canvas.getContext('2d').imageSmoothingEnabled = false;
                                                
                        this.game.started = true;
                        this.game.leftclick = false;
                        this.game.click = null;
                        this.loadCredits();
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
            ctx.drawImage(this.panel, 135, 20, 50, 8, PARAMS.canvas_width*0.08, PARAMS.canvas_height*0.885, 50*9, 8*9);
            ctx.drawImage(this.panel, 122, 48, 26, 12, PARAMS.canvas_width*0.08, PARAMS.canvas_height*0.885 + 60, 26*3, 12*3);
            this.avaanimation.drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width*0.008 - 20, PARAMS.canvas_height*0.911, 1.4);
            // fetch hp bar from rutherford then draw
            var hp = this.char.hp;
            var percentage = hp.current / hp.maxHealth;
            ctx.font = `bold 18px Comic Sans MS`;
            
        
            // draw hp
            if (percentage < 0) percentage = 0;
            ctx.fillStyle = hp.getColor(percentage);
            ctx.fillRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.885 + 10, 405*percentage, 21);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.885 + 10, 405, 21);
            // give text
            ctx.fillStyle = "white";
            ctx.fillText(`${Math.round(hp.current)}/${hp.maxHealth}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.885 + 27);
            
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeText(`${Math.round(hp.current)}/${hp.maxHealth}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.885 + 27); 

            //draw mp
            var percentageMana = hp.currMana / hp.maxMana;
            if (percentageMana < 0) percentageMana = 0;
            ctx.fillStyle = "rgb(30, 100, 255)";
            ctx.fillRect(PARAMS.canvas_width*0.08 + 9, PARAMS.canvas_height*0.885 + 32, 405*percentageMana, 21);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(PARAMS.canvas_width*0.08 + 9,  PARAMS.canvas_height*0.885 + 32, 405, 21);
            // give text
            ctx.fillStyle = "white";
            ctx.fillText(`${Math.round(hp.currMana)}/${hp.maxMana}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.885 + 49);
            ctx.strokeStyle = "black";
            ctx.strokeText(`${Math.round(hp.currMana)}/${hp.maxMana}`, PARAMS.canvas_width*0.08 + 192, PARAMS.canvas_height*0.885 + 49);
            
            // draw amount of coins
            // give text
            ctx.fillStyle = "white";
            ctx.fillText(this.char.coins, PARAMS.canvas_width*0.08 + 25, PARAMS.canvas_height*0.885 + 84);

            ctx.lineWidth = 1;
        }
    }

    playTheme(path) {
        ASSET_MANAGER.pauseBackgroundMusic();
        ASSET_MANAGER.playAsset(path);
        ASSET_MANAGER.autoRepeat(path);
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

    resetState() {
        this.game.entities = [];
        this.game.background = [];
        this.gameover = false;
        this.stage = 1;
        this.boss = null;
        this.bossroom = null;
        this.boss2 = null;
        this.tempObstacles = [];
        this.checkpoint = null;
        this.locked = false;
    }

    restoreCheckpoint() {
        this.char.x = this.checkpoint.x;
        this.char.y = this.checkpoint.y;
        this.releaseLock();
        this.stage = this.checkpoint.stage;
        this.playTheme(this.checkpoint.audio);
        if (this.level === 2) {
            if (this.stage === 1)
                this.boss.active = false;
            else if (this.stage === 3) {
                this.boss2.active = false;
                this.boss2.despawnObjects();
                var r = this.boss2.room;
                this.boss2.removeFromWorld = true;
                this.boss2 = new Polnariff(this.game, Math.floor(r.x + r.w/2) * 64, Math.floor(r.y + r.h/2) * 64, r)
                this.game.addEntity(this.boss2);
            }
        }
    }

    shootLetter(letter, scale, sx, sy, color) {
        var pp = { spritesheet: ASSET_MANAGER.getAsset("./sprites/skittles.png"), 
                    sx: 8*color, sy: 0, size: 8, scale: scale};
        
        for (var i = 0; i < ALPHABET[letter].length; i++) {
            var x = 4-ALPHABET[letter][i] % 5;  
            var y = 4-Math.floor(ALPHABET[letter][i] / 5);
            var p = new Chasingprojectile(this.game, true, sx - (x*0.7)*pp.scale*pp.size, sy - (y*0.7)*pp.scale*pp.size, // 0.7 is the spacing between pixels
                {x:0, y:0}, 10, 120000, 10 + randomInt(10), pp);

            this.game.addEntity(p);
        }
    }

    shootphrase(phrase, scale, sx, sy, color) {
        for (var i = 0; i < phrase.length; i++) {
            if (phrase[i] !== " ") {
                if (color === undefined)
                    this.shootLetter(phrase[i], scale, sx + scale*8*4*i, sy, randomInt(12));
                else 
                    this.shootLetter(phrase[i], scale, sx + scale*8*4*i, sy, color);
            }
        }
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