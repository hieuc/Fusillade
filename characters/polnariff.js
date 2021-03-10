class Polnariff extends Enemy {
    constructor(game, x, y, room) {
        super(game, x, y);
        this.room = room;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/polnariff.png");
        this.state = 0; // 0 = idle, 1 = casting
        this.face = 0; // 0 = right, 1 = left
        this.scale = 2;
        this.speed = 2;

        this.hp = new HealthMpBar(this.game, this.x, this.y, 70, 3000);
        this.bound = new BoundingBox(this.game, this.x, this.y, 25 * this.scale, 50 * this.scale);

        this.started = false;
        this.animations = [];
        this.knife = false;
        this.miasma = false;
        this.loadAnimations();
        this.generaltimestamp = Date.now();
        this.generaldelay = 5000;
        this.lasthp = this.hp.current;
    }

    loadAnimations() {
        for (var i = 0; i < 2; i++) {
            this.animations[i] = [];
        }

        // idle
        this.animations[0][0] = new Animator(this.spritesheet, 16, 88, 64, 64, 2, 0.5, 16, false, true);
        this.animations[0][1] = new Animator(this.spritesheet, 2416, 8, 64, 64, 2, 0.5, 16, true, true);

        // casting
        this.animations[1][0] = new Animator(this.spritesheet, 496, 88, 64, 64, 4, 0.25, 16, false, true);
        this.animations[1][1] = new Animator(this.spritesheet, 1776, 8, 64, 64, 4, 0.25, 16, true, true);
    }

    prepareAttack() {
        if (this.knife) {
            this.state = 1;
            this.x = (this.room.x + this.room.w/2)*64 - 40;
            this.y = (this.room.y)*64 - 80;
            this.knives = [];
            for (var i = 0; i < this.room.w*2; i++) {
                var k = new KnifePortal(this.game, this.room.x * 64 + 32 * i, this.room.y * 64);
                this.game.addEntity(k);
                this.knives.push(k);
            }

            this.timestamp = Date.now();
            this.timestamp2 = Date.now();
            this.delay = 1000 + (this.room.w - 10) * 10;  // wider room, more room to breathe
        } else if (this.miasma) {
            this.state = 1;
            this.x = (this.room.x + this.room.w/2)*64 - 40;
            this.y = (this.room.y + this.room.h/2)*64 - 44;

            this.miasmaportals = [];
            var w = this.room.w * 64;
            var h = this.room.h * 64;
            var t = 8000;
            // green portals
            for (var i = 0; i < 4; i++) {
                // top left portal
                var portal = new MiasmaPortal(this.game, this.room.x*64 + w*(i+1)/11 - 24, this.room.y*64 + h*(i+1)/11 - 24, {x:1, y:0}, (11-(i+1)*2)/11*w/t*60, (11-(i+1)*2)/11*h/t*60, t);
                this.miasmaportals.push(portal);
                this.game.addEntity(portal);
                // top right portal
                portal = new MiasmaPortal(this.game, this.room.x*64 + w*(10-i)/11 - 24, this.room.y*64 + h*(i+1)/11 - 24, {x:0, y:1}, (11-(i+1)*2)/11*w/t*60, (11-(i+1)*2)/11*h/t*60, t);
                this.miasmaportals.push(portal);
                this.game.addEntity(portal);
                // bottom right portal
                portal = new MiasmaPortal(this.game, this.room.x*64 + w*(10-i)/11 - 24, this.room.y*64 + h*(10-i)/11 - 24, {x:-1, y:0}, (11-(i+1)*2)/11*w/t*60, (11-(i+1)*2)/11*h/t*60, t);
                this.miasmaportals.push(portal);
                this.game.addEntity(portal);
                // bottom left portal
                portal = new MiasmaPortal(this.game, this.room.x*64 + w*(i+1)/11 - 24, this.room.y*64 + h*(10-i)/11 - 24, {x:0, y:-1}, (11-(i+1)*2)/11*w/t*60, (11-(i+1)*2)/11*h/t*60, t);
                this.miasmaportals.push(portal);
                this.game.addEntity(portal);
            }
            // red portals
            for (var i = 0; i < 2; i++) {
                for (var j = 1; j <= 4; j++) {
                    var portal = new SunPortal(this.game, this.room.x*64 + w/5*j, this.room.y*64 + (h-48)*i);
                    this.miasmaportals.push(portal);
                    this.game.addEntity(portal);
                    portal = new SunPortal(this.game, this.room.x*64 + (w -48)*i , this.room.y*64 + h/5*j);
                    this.miasmaportals.push(portal);
                    this.game.addEntity(portal);
                }
            }
            this.timestamp = Date.now();
            this.pp = { sx: 16, sy: 160, scale: 2, size: 16};
        }
    }

    update() {
        if (!this.started) {
            var enemy = this.game.camera.char;
            var triggerrange = 200;
            if (Math.abs(enemy.x - this.x) < triggerrange || Math.abs(enemy.y - this.y) < triggerrange)
                this.started = true;
        } else {
            if ((this.hp.current <= 0 && this.state === 1) || (this.miasma === null && this.knife === null) ) {
                // defeated 
                this.x = (this.room.x + this.room.w/2)*64 - 40;
                this.y = (this.room.y + this.room.h/2)*64 - 44;
                this.state = 0;
                this.despawnObjects();
            } else {
                // if attacking and got low enough
                if (this.state === 1 && (this.lasthp - this.hp.current >= this.hp.maxHealth / 2 || this.hp.current <= 0)) {
                    this.state = 0;
                    this.generaltimestamp = Date.now();
                    this.despawnObjects();
                    this.lasthp = this.hp.current;
                } else if (this.state === 1) {
                    // if attacking
                    this.attack();
                } 
                // if not attacking and rest enough 
                else if (this.state === 0 && Date.now() - this.generaltimestamp >= this.generaldelay && this.hp.current > 0) {
                    if (this.miasma !== null && this.knife !== null) {
                        var rand = randomInt(2);
                        if (rand === 1) {
                            this.knife = true;
                        } else {
                            this.miasma = true;
                        }
                    } else if (this.knife !== null) {
                        this.knife = true;
                    } else {
                        this.miasma = true;
                    }
                    this.prepareAttack();
                }
            }
            if (this.state === 1)
                this.checkCollision();
            this.updateBound();
        }
    }

    despawnObjects() {
        if (this.miasma) {
            this.miasma = null;
            this.miasmaportals.forEach(e => {
                e.state = 2;
            })
        } else {
            this.knife = null;
            this.knives.forEach(e => {
                e.state = 2;
            })
        }
    }

    updateBound() {
        this.bound.update(this.x + 27, this.y + 20);

        this.hp.x = this.bound.x - 4 * this.scale;
        this.hp.y = this.bound.y + 52 * this.scale;
    }

    calculateVel (angle) {
        var v = { x: Math.cos(angle),
                    y: Math.sin(angle)};
        
        return v;
    }

    checkCollision() {
        this.game.entities.forEach(e => {
            if (e instanceof Projectiles && e.bound.collide(this.bound) && e.friendly) {
                e.hit(this);
            }
        });
    }

    attack() {
        // if attacking
        if (this.knife) {
            // knives on edge every 0.5 second
            if (Date.now() - this.timestamp2 >= this.delay/2) {
                this.knives[0].attack();
                this.knives[1].attack();
                this.knives[this.knives.length-1].attack();
                this.knives[this.knives.length-2].attack();
                this.timestamp2 = Date.now();
            }

            // knives every 1 second
            if (Date.now() - this.timestamp >= this.delay) {
                // decide 3 knives to omit
                var omit = randomInt(this.knives.length-6) + 4;
                for (var i = 2; i < this.knives.length-2; i++) {
                    if (i !== omit && i !== omit - 1 && i !== omit - 2) {
                        this.knives[i].attack();
                    }
                }
                this.timestamp = Date.now();
            }
        } else if (this.miasma) {
            if (Date.now() - this.timestamp >= 2000) {
                // shurikens from polnariff
                var total = 6;
                var offset = Math.PI / total * randomInt(2);
                for (var i = 0; i < total; i++) {
                    var p = new Projectiles(this.game, false, this.x + 32, this.y + 32, this.calculateVel(Math.PI / total * i * 2 + offset), 2, 5000, 30, this.pp);
                    this.game.addEntity(p);
                }
                this.timestamp = Date.now();
            }
        }
    }
}