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
        var p = new Knife(this.game, false, this.x - 26, this.y, { x: 0, y: 0}, 2.5, 5000, 50, this.pp);
        p.velocity = {x: 0, y: 1};

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