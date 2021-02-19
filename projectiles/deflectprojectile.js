class deflectprojectile extends Projectiles {
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj);
        Object.assign(this, {});

        this.tempspeed = 0;

        this.timeshit = 0; 

        this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0) + Math.PI/5);
    }

    update() {
        // if we hit an obstacle
        var that = this;
        this.game.entities.forEach(function (entity) {
            if(entity.bound && that.bound.collide(entity.bound)) {    
                if(entity instanceof Obstacle) {
                    that.tempspeed = that.speed;
                    that.speed = 0;
                    that.timeshit++;
                    that.rotatedSprite = that.rotate(Math.atan(that.velocity.y / that.velocity.x) + (that.velocity.x <= 0 ? Math.PI : 0) + Math.PI/5 - Math.PI*that.timeshit);
                }
            }
        })

        if(this.speed == 0) {
            this.speed = -1*this.tempspeed;
        }

        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
    }
}