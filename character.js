class Asgore {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        //this.spritesheet = ASSET_MANAGER.getAsset("./sprites/");

        this.scale = 2;

        this.animations = [];
    }

    loadAnimations() {
        //this.animations[0] = new Animator(this.spritesheet, 175, 0, 170, 127, 1, 99999999, 5, false, false);
    }

    update() {
        
    }

    draw(ctx) {
        //this.animations[this.action].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }
}