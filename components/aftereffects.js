class Star {
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

class Thunder {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Thunder.png");

        this.scale = 1.5;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 64, 256, 7, 0.1, 0, false, false);

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

class Shine {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Shine.png");

        this.scale = 1.5;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 64, 64, 5, 0.05, 0, false, false);

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

class Burn {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Burn.png");

        this.scale = 1;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 128, 128, 10, 0.05, 0, false, false);

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

class Thuneffect {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/ThunEffect.png");

        this.scale = 0.5;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 512, 512, 7, 0.1, 0, false, false);

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

class Bluebeam {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/BBeam.png");

        this.scale = 1.2;

        this.damage = 2;

        this.bound = new BoundingBox(this.game, this.x+30, this.y+230, 25, 45);

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 64, 256, 7, 0.1, 0, false, false);

    }
    

    update() {
        if(this.animations[0].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}

class Redbeam {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/RBeam.png");

        this.scale = 1;

        this.damage = 4;

        this.bound = new BoundingBox(this.game, this.x+30, this.y+230, 25, 45);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 64, 256, 7, 0.1, 0, false, false);

    }
    

    update() {
        if(this.animations[0].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}
