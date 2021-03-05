class Chasingprojectile extends Projectiles {
    /*
    * returnpoint is a scale of lifetime at the point projectiles start returning.
    */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect) {
        super(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect);
        Object.assign(this, {});
    }

    update() {
        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
            var velocity = this.calculateVel();
            var pp = { spritesheet: ASSET_MANAGER.getAsset("./sprites/Doublops.png"), sx: 256, sy: 1236, size: 35, scale : 1};
            var p = new Projectiles(this.game, false, this.x, this.y, velocity, 35, 1000, this.damage, pp, "cyclopshit");
            p.bound.r = p.bound.r / 1.5;
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
        } else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
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