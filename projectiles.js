class Projectiles {
    constructor(game, x, y, velocity, speed, lifetime) {
        Object.assign(this, { game, x, y, velocity, speed, lifetime});

        this.scale = 2;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
        
        this.timestamp = Date.now();
    }

    loadAnimations() {

    }

    update() {
        // if lifetime expired
        if (Date.now() - this.timestamp > this.lifetime)
            this.removeFromWorld = true;
        else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        this.rotate(ctx, Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
    }

    rotate(ctx, angle) {
        var c2 = document.createElement("canvas");
        c2.width = 16 * this.scale;
        c2.height = 16 * this.scale;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(16 * this.scale / 2, 16 * this.scale / 2);
        ctx2.rotate(angle);
        ctx2.translate(-16 * this.scale / 2, -16 * this.scale / 2);
        ctx2.drawImage(this.spritesheet, 96, 96, 16, 16, 0, 0, 16 * this.scale, 16 * this.scale);

        ctx.drawImage(c2, this.x, this.y, 16 * this.scale, 16 * this.scale);
    }
}