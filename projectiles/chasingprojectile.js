class Chasingprojectile extends Projectiles {
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj, hold, aimme, effect) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect);

        this.tempspeed = this.speed;

        this.floattimer = Date.now();

        this.floatspeed = 0.8;

        this.returnlifetime = this.lifetime/2;

        this.resetonce = true;

        Object.assign(this, {hold, aimme});
    }

    update() {
        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
            let velocity = 0;
            if(this.hold)
                velocity = this.calculateRandVel();
            else if(!this.hold)
                velocity = this.calculateVel();
                this.returnlifetime += this.lifetime/2.5;
            if(this.aimme != undefined) {
                velocity = this.calculateMyVel();
            } 
            var p = new Projectiles(this.game, false, this.x, this.y, velocity, this.tempspeed * 1.8, this.returnlifetime, this.damage, this.proj, "cyclopshit");
            p.bound.r = p.bound.r / 1.5;
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
        } else {
            if(this.hold && Date.now() - this.timestamp > 1300) { //Although hard coding isn't good, it works in this case since it won't be expanded on.
                if(this.resetonce) {
                    this.floattimer = Date.now();
                    this.resetonce = false;
                }
                this.speed = 0;
                if(Date.now() - this.floattimer < 500) {
                    this.y += this.floatspeed;
                } else {
                    this.resetonce = true;
                    this.floatspeed *= -1;
                }

            }
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
    }

    calculateRandVel() {
        var enemy = this.game.camera.char;
        var randX = 0
        var plusminus = Math.random < 0.51? -1:1;
        randX = plusminus * randomInt(200);
        var dx = enemy.bound.x - (this.bound.x) + randX;
        var dy = enemy.bound.y - (this.bound.y);

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }

    calculateMyVel() {
        var dx = this.aimme.x - (this.bound.x);
        var dy = this.aimme.y - (this.bound.y);

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }

    calculateVel() {
        var enemy = this.game.camera.char;
        var dx = enemy.bound.x - (this.bound.x);
        var dy = enemy.bound.y - (this.bound.y);

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }
}