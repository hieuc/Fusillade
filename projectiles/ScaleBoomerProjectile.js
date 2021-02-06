class ScaleBoomerProjectiles extends Projectiles{

    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, scaleIncrease, boomerang, proj) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj);
        Object.assign(this, {scaleIncrease, boomerang});

        this.r = 16;
    }

    update() {
        // if lifetime expired

        if(this.boomerang) {
            if (!this.returned && Date.now() - this.timestamp > this.lifetime  * 0.5) {
                this.returned = true;
                this.velocity.x = -this.velocity.x;
                this.velocity.y = -this.velocity.y;
                this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
            } else {
                if(!this.returned) {
                    this.proj.size += this.scaleIncrease;
                } else {
                    this.proj.size -= this.scaleIncrease;
                }
                this.x += this.speed * this.velocity.x;
                this.y += this.speed * this.velocity.y;
            }
        } else {
            this.proj.size += this.scaleIncrease;
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }

        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        }

        this.updateBound();
    }

    updateBound() {
        this.r += this.scaleIncrease;
        this.bound = new BoundingCircle(this.game, this.x + 16 + this.proj.scale, this.y + 16 + this.proj.scale, this.r);
    }
}
