class Newprojectiles extends Projectiles{
    constructor(game, x, y, velocity, speed, lifetime, posX, posY, width, height, scaleIncrease) {
        super(game, x, y, velocity, speed, lifetime);
        Object.assign(this, { posX, posY, width, height, scaleIncrease});

    }

    update() {
        this.scale += this.scaleIncrease;
        // if lifetime expired
        if (Date.now() - this.timestamp > this.lifetime)
            this.removeFromWorld = true;
        else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
    }
}