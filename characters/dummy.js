class Dummy {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.sprite = ASSET_MANAGER.getAsset("./sprites/dummy.png");

        this.scale = 1.5;

        setInterval(() => this.attack1(this), 3000);
    }

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.sprite, 0, 0, 17, 28, this.x, this.y, 17 * this.scale,  28 * this.scale);
    }

    /**
     * Spiral pattern.
     * 
     * @param {*} that reference to current dumym because js dum dum 
     */
    async attack1(that) {
        var calculateVel = function(angle) {
            var v = { x: Math.cos(angle),
                        y: Math.sin(angle)};
            
            return v;
        }

        var n = 16;
        for (var i = 0; i < n; i++) {
            var velocity = calculateVel(Math.PI / n * i * 2);
            var p = new Projectiles(that.game, that.x, that.y, velocity, 3, 2000);
            this.game.entities.splice(that.game.entities.length - 1, 0, p);
            await this.sleep(100);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}