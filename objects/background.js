class Ground {
    constructor(game, x, y, p) {
        Object.assign(this, { game, x, y, p});
    };

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.p.spritesheet, this.p.sx, this.p.sy, this.p.width, this.p.height, 
            this.x - this.game.camera.x, this.y - this.game.camera.y, 
            this.p.width * this.p.scale, this.p.height * this.p.scale);
    }
}