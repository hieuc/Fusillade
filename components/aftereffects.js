class star {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/star.png");

        this.scale = 2;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 32, 64, 5, 0.05, 0, false, false);

    }

    update() {
        if(this.animations[0].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}
