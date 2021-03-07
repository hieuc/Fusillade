class SquareProjectile extends Projectiles
{
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, random, proj, effect) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect);
        Object.assign(this, {random});

        this.directiontimer = Date.now(); // how long the projectile should go in this direction

        this.directionlifetime = lifetime/8;

        this.istime = true;

        this.leftright;

        this.updown;
    }

    update() {
        let followduration = Math.ceil(this.lifetime / 10); // how long the projectile follows Rutherford 
        if(Date.now() - this.timestamp > followduration)
        {
            if(this.istime)
            {
                let slowfast = Math.random() < 0.51 ? 1 : -1;
                if(this.random)
                    this.speed += 3 * slowfast * Math.random();
                this.directiontimer = Date.now();
                this.istime = false;
                this.leftright = this.x - this.game.camera.char.x < 0? 1: -1;
                this.updown = this.y - this.game.camera.char.y < 0? 1: -1;
            }
            if(Date.now() - this.directiontimer < this.directionlifetime)
            {
                this.velocity.x = this.leftright;
                this.velocity.y = 0;
            }
            else if(Date.now() - this.directiontimer >= this.directionlifetime && Date.now() - this.directiontimer < this.directionlifetime * 2)
            {
                this.velocity.x = 0;
                this.velocity.y = this.updown;
            }
            else if(Date.now() - this.directiontimer >= this.directionlifetime * 2 && Date.now() - this.directiontimer < this.directionlifetime * 3)
            {
                this.velocity.x = -1*this.leftright;
                this.velocity.y = 0;
            }
            else if(Date.now() - this.directiontimer >= this.directionlifetime * 3 && Date.now() - this.directiontimer < this.directionlifetime * 4)
            {
                this.velocity.x = 0;
                this.velocity.y = -1*this.updown;
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