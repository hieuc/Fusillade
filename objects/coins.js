class Onecoin {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");
        
        this.bound = new BoundingCircle(this.game, this.x+18, this.y+22, 14);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 10, 140, 14, 14, 1, 0.15, 0, false, true);
    }

    update() {

    }

    draw(ctx) {
        if (PARAMS.debug) {
            this.bound.draw();
        }
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

}

class Threecoin {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");
        
        this.bound = new BoundingCircle(this.game, this.x+21, this.y+18, 15);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 38, 140, 16, 14, 1, 0.15, 0, false, true);
    }

    update() {

    }

    draw(ctx) {
        if (PARAMS.debug) {
            this.bound.draw();
        }
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

}

