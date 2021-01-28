class Boomerang extends Projectiles {
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, x, y, velocity, speed, lifetime, returnpoint, spritesheet) {
        super(game, x, y, velocity, speed, lifetime);
        this.returnpoint = returnpoint;
        this.returned = false;
    }

    update() {
        // if lifetime expired
        if (!this.returned && Date.now() - this.timestamp > this.lifetime  * this.returnpoint) {
            this.returned = true;
            this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
        }
        
        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
    }
}