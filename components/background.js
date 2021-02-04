class Ground {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/forest.png");
    };

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.spritesheet, 96, 0, 96, 96, this.x - this.game.camera.x, this.y - this.game.camera.y, 96, 96);
    }
}