class Obstacle {
    // p: property
    constructor (game, x, y, p, callback) {
        Object.assign(this, {game, x, y, p, callback});
        // bound width and height
        var bw = p.width * p.scale * p.bound.w;
        var bh = p.height * p.scale * p.bound.h;

        this.bound = new BoundingBox(game, x + p.bound.x ,
            y + p.bound.y , bw, bh);
    }

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.p.spritesheet, this.p.sx, this.p.sy, this.p.width, this.p.height, 
            this.x - this.game.camera.x, this.y - this.game.camera.y, 
            this.p.width * this.p.scale, this.p.height * this.p.scale);

        if (PARAMS.debug) {
            this.bound.draw();
        }
    }
}