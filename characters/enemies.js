// Parent class for all enemies
class Enemy {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
    }

    update() {

    }

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (this.hp) {
            this.hp.draw();
        }
        
        if (PARAMS.debug && this.bound) {
            this.bound.draw();
        }
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