/**
 * Use as a damage indicator
 */
class Score {
    /**
     * 
     * @param {*} game 
     * @param {*} x 
     * @param {*} y 
     * @param {*} value 
     * @param {int} healtype undefined/null for damage, 0 for hp healing, 1 for mp healing
     */
    constructor (game, x, y, value, healtype) {
        Object.assign(this, { game, x, y, value, healtype});

        this.lifetime = 500;

        this.timestamp = Date.now();

        if (healtype === 0) {
            // green
            this.color = "rgb(92, 255, 59)";
        } else if (healtype === 1) {
            // blue
            this.color = "rgb(0, 98, 255)";
        } else {
            // red
            this.color = "rgb(219, 45, 45)";
        }

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
        ctx.fillStyle = this.color;
        ctx.fillText(`${this.healtype === undefined ? "-" : "+"} ${Math.round(this.value)}`, this.x - this.game.camera.x, this.y - this.game.camera.y);
        // draw border
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.5;
        ctx.strokeText(`${this.healtype === undefined ? "-" : "+"} ${Math.round(this.value)}`, this.x - this.game.camera.x, this.y - this.game.camera.y);
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