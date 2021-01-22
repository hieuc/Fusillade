class Projectiles {
    constructor(game, x, y, speed, lifetime) {
        Object.assign(this, { game, x, y, speed, lifetime});

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
        else 
            this.x += this.speed;
    }

    draw(ctx) {
        ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
    }
}