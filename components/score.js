/**
 * Use as a damage indicator
 */
class Score {
    constructor (game, x, y, value) {
        Object.assign(this, { game, x, y, value});

        this.lifetime = 500;

        this.timestamp = Date.now();

        // base size
        this.size = 24;

        // max scale
        this.scale = 0.5;
    }

    update() {
        if (Date.now() - this.timestamp > this.lifetime) {
            this.removeFromWorld = true;
        }
        this.y -= 1;
    }

    draw(ctx) {
        var size = this.getSize();
        ctx.font = `${size}px Comic Sans MS`;
        ctx.fillStyle = "rgb(210, 0, 0)";
        ctx.fillText(`-${this.value}`, this.x - this.game.camera.x, this.y - this.game.camera.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.2;
        ctx.strokeText(`-${this.value}`, this.x - this.game.camera.x, this.y - this.game.camera.y);
        ctx.lineWidth = 1;
    }

    getSize() {
        // 0 -> normal size
        // 0 - 10% lifetime -> enlarged
        // 10 - 40% lifetime -> shrink to normal size
        // 40 - 100% lifetime -> stay at normal size
        var size = 0;
        var t = Date.now() - this.timestamp;
        if (t < this.lifetime * 0.1) {
            size = this.size * (1 + t / (this.lifetime * 0.1) * this.scale);
        } else if (t < this.lifetime * 0.4) {
            size = this.size * (1 + (1 - (t - this.lifetime * 0.1) / (this.lifetime * 0.3)) * this.scale);
        } else {
            size = this.size;
        }

        return size;
    }
}