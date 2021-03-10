class Dividingprojectile extends Projectiles {
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj);
        Object.assign(this, {});

        this.dividetime = Date.now();

        this.circularattackangle = 0;
    }

    update() {
        if (Date.now() - this.timestamp > this.lifetime) {        
            let partitions = 12;
            for(var i = 0; i < partitions; i++) {
                var pp = {sx: 98, sy: 144, size: 16};
                var p = new Projectiles(this.game, false, this.x, this.y, {x :Math.cos(this.circularattackangle), y:Math.sin(this.circularattackangle)}, 
                        5, 3000, 20, pp);
                this.circularattackangle += 2*Math.PI/partitions;
                this.game.entities.splice(this.game.entities.length - 1, 0, p);        
            }
            this.removeFromWorld = true;
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();

    }
}