class Projectiles {
    constructor(game, x, y, velocity, speed, lifetime, spritesheet) {
        Object.assign(this, { game, x, y, velocity, speed, lifetime});

        // if no spritesheet provided, use default
        if (spritesheet) {
            this.spritesheet = ASSET_MANAGER.getAsset(spritesheet);
        } else {
            this.spritesheet = ASSET_MANAGER.getAsset(PARAMS.default_projectile_sheet);
        }

        this.bound = new BoundingCircle(this.x, this.y, 16);

        this.scale = 2;
        
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
        this.updateBound();
    }

    updateBound() {
        this.bound.x = this.x + 16;
        this.bound.y = this.y + 16;
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        this.rotate(ctx, Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, this.bound.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
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

        ctx.drawImage(c2, this.x - this.game.camera.x, this.y - this.game.camera.y, 16 * this.scale, 16 * this.scale);
    }
}