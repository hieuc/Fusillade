class KnifePortal {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
        this.state = 1; // 0: spawning, 1: ready, 2: depawning
        this.scale = 2;
        this.animations = []; 
        this.loadAnimations();
        
        // projectile properties
        this.pp = { spritesheet: this.spritesheet, sx: 32, sy: 208, scale: 4, size: 16};
    }  

    loadAnimations() {
        // spawning
        this.animations[0] = new Animator(this.spritesheet, 0, 224, 16, 16, 7, 0.5, 0, false, false);

        // ready
        this.animations[1] = new Animator(this.spritesheet, 96, 224, 16, 16, 5, 0.5, 0, false, true);

        // despawning
        this.animations[2] = new Animator(this.spritesheet, 192, 224, 16, 16, 4, 0.5, 0, false, false);
    }

    update() {

    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    attack() {
        var p = new Knife(this.game, false, this.x - 26, this.y, {x:0, y:1}, 2.5, 5000, 50, this.pp);

        this.game.addEntity(p);
    }
}

/**
 * This class exist because the knife's sprite is maxed in diagonally,
 * and rotating will crop parts of it.
 */
class Knife extends Projectiles {
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj);

        this.rotatedSprite = this.rotate(Math.PI * 3 / 4);
        this.bound = new BoundingBox(this.game, this.x, this.y - 32, 18, 56); 
    }

    updateBound() {
        this.bound.update(this.x + 33, this.y + 6);
    }

    /**
     * Return a canvas object of the rotated sprite, based on the provided angle
     * 
     * @param {*} angle in radians
     */
    rotate(angle) {
        var c2 = document.createElement("canvas");
        c2.width = this.proj.size * this.proj.scale * Math.SQRT2;
        c2.height = this.proj.size * this.proj.scale * Math.SQRT2;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(c2.width / 2, c2.height / 2);
        ctx2.rotate(angle);
        ctx2.translate(-c2.width / 2, -c2.height / 2);
        ctx2.drawImage(this.proj.spritesheet, this.proj.sx, this.proj.sy, this.proj.size, this.proj.size, 
            0, 0, this.proj.size * this.proj.scale, this.proj.size * this.proj.scale);

        return c2;
    }
}

class MiasmaPortal {
    constructor(game, x, y, velocity, spdx, spdy, rotationtime) {
        Object.assign(this, {game, x, y, velocity, spdx, spdy, rotationtime});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
        this.state = 1; // 0: spawning, 1: ready, 2: depawning
        this.scale = 3;
        //this.rotationtime is  estimated travel time before switching direction
        if (this.velocity.x !== 0) {
            this.totaldist = spdx * this.rotationtime / 60;
            this.speed = spdx;
        } else {
            this.totaldist = spdy * this.rotationtime / 60;
            this.speed = spdy;
        }
        this.d = 0; // travelled distance
        this.animations = []; 
        this.loadAnimations();
        this.delay = 2000 + randomInt(10) * 100;
        this.timestamp = Date.now();
        
        // projectile properties
        this.pp = { spritesheet: this.spritesheet, sx: 128, sy: 144, scale: 2, size: 16};
    }  

    loadAnimations() {
        // spawning
        this.animations[0] = new Animator(this.spritesheet, 0, 240, 16, 16, 7, 0.5, 0, false, false);

        // ready
        this.animations[1] = new Animator(this.spritesheet, 96, 240, 16, 16, 5, 0.5, 0, false, true);

        // despawning
        this.animations[2] = new Animator(this.spritesheet, 192, 240, 16, 16, 4, 0.5, 0, false, false);
    }

    update() {
        if (Date.now() - this.timestamp >= this.delay) {
            this.attack();
            this.timestamp = Date.now();
        }

        // switch velocity if travelled enough
        if (this.d >= this.totaldist) {
            if (this.velocity.x === 1 && this.velocity.y === 0) {
                this.velocity = { x: 0, y: 1};
            } else if (this.velocity.x === 0 && this.velocity.y === 1) {
                this.velocity = { x: -1, y: 0};
            } else if (this.velocity.x === -1 && this.velocity.y === 0) {
                this.velocity = { x: 0, y: -1};
            } else if (this.velocity.x === 0 && this.velocity.y === -1) {
                this.velocity = { x: 1, y: 0};
            }
            if (this.velocity.x !== 0) {
                this.totaldist = this.spdx * this.rotationtime / 60;
                this.speed = this.spdx;
            } else {
                this.totaldist = this.spdy * this.rotationtime / 60;
                this.speed = this.spdy;
            }
            this.d = 0;
        } else {
            this.x += this.velocity.x * this.speed;
            this.y += this.velocity.y * this.speed;
            this.d += Math.abs(this.velocity.x + this.velocity.y) * this.speed;
        }
        
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    attack() {
        var p = new Projectiles(this.game, false, this.x, this.y, this.calculateVel(), 1.5, 10000, 30, this.pp);
        p.bound.r /= 1.5;
        this.game.addEntity(p);
    }

    calculateVel() {
        var enemy = this.game.camera.char;
        var dx = enemy.bound.x - (this.x);
        var dy = enemy.bound.y - (this.y);

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }
}

class SunPortal {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
        this.state = 1; // 0: spawning, 1: ready, 2: depawning
        this.scale = 3;
        this.animations = []; 
        this.loadAnimations();
        
        // projectile properties
        this.pp = { spritesheet: this.spritesheet, sx: 128, sy: 336, scale: 2, size: 16};

        this.delay = 2000;
        this.timestamp = Date.now();
    }  

    loadAnimations() {
        // spawning
        this.animations[0] = new Animator(this.spritesheet, 0, 256, 16, 16, 7, 0.5, 0, false, false);

        // ready
        this.animations[1] = new Animator(this.spritesheet, 96, 256, 16, 16, 5, 0.5, 0, false, true);

        // despawning
        this.animations[2] = new Animator(this.spritesheet, 192, 256, 16, 16, 4, 0.5, 0, false, false);
    }

    update() {
        if (Date.now() - this.timestamp >= this.delay) {
            this.attack();
            this.timestamp = Date.now();
        }
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    attack() {
        var total = 9;
        for (var i = 0; i < total; i++) {
            var p = new Projectiles(this.game, false, this.x+12, this.y+12, this.calculateVel(Math.PI / total * i * 2), 1, 1800, 30, this.pp);
            p.bound.r /= 1.5;
            this.game.addEntity(p);
        }
    }

    /**
     * Return x and y velocity based on shooting angle
     * 
     * @param {*} angle in radians
     */
     calculateVel (angle) {
        var v = { x: Math.cos(angle),
                    y: Math.sin(angle)};
        
        return v;
    }
}