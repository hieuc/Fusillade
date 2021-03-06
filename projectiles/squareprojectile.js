class SquareProjectile extends Projectiles
{
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect);
        Object.assign(this, {});
        this.directiontimer = Date.now(); // how long the projectile should go in this direction
        this.istime = true;
    }

    update() {
        let followduration = Math.ceil(this.lifetime / 10); // how long the projectile follows Rutherford 
        if(Date.now() - this.timestamp > followduration)
        {
            if(this.istime)
            {
                let slowfast = Math.random() < 0.51 ? 1 : -1;
                this.speed += 3 * slowfast * Math.random();
                this.directiontimer = Date.now();
                this.istime = false;
            }
            if(Date.now() - this.directiontimer < 2000)
            {
                this.velocity.x = 1;
                this.velocity.y = 0;
            }
            else if(Date.now() - this.directiontimer >= 2000 && Date.now() - this.directiontimer < 4000)
            {
                this.velocity.x = 0;
                this.velocity.y = 1;
            }
            else if(Date.now() - this.directiontimer >= 4000 && Date.now() - this.directiontimer < 6000)
            {
                this.velocity.x = -1;
                this.velocity.y = 0;
            }
            else if(Date.now() - this.directiontimer >= 6000 && Date.now() - this.directiontimer < 8000)
            {
                this.velocity.x = 0;
                this.velocity.y = -1;
            }
            else
            {
                this.directiontimer = Date.now();
            }
        }
        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
    }

};