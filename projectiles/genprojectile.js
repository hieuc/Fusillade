class GenProjectiles extends Projectiles{
    constructor(game, x, y, velocity, speed, lifetime, posX, posY, width, height, scaleIncrease, boomerang, spritesheet) {
        super(game, x, y, velocity, speed, lifetime, spritesheet);
        Object.assign(this, {posX, posY, width, height, scaleIncrease, boomerang});

    }

    update() {
        this.scale += this.scaleIncrease;
        // if lifetime expired

        if(this.boomerang) {
            if (!this.returned && Date.now() - this.timestamp > this.lifetime  * 0.5) {
                this.returned = true;
                this.velocity.x = -this.velocity.x;
                this.velocity.y = -this.velocity.y;
            } else {
                this.x += this.speed * this.velocity.x;
                this.y += this.speed * this.velocity.y;
            }
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }

        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        }

        this.updateBound();
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
        ctx2.drawImage(this.spritesheet, this.posX, this.posY, this.width, this.height, 0, 0, 16 * this.scale, 16 * this.scale);
        ctx.drawImage(c2, this.x - this.game.camera.x, this.y - this.game.camera.y, 16 * this.scale, 16 * this.scale);
    }
}