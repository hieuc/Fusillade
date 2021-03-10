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

class Fayerehit {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/fayerehit.png");

        this.scale = 0.5;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 128, 0, 128, 128, 5, 0.05, 0, false, false);

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

class Aishit {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Aishit.png");

        this.scale = 0.4;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 128, 128, 6, 0.05, 0, false, false);

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

class Buckhit {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/buckhit.png");

        this.scale = 1;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 64, 108, 64, 6, 0.05, 0, false, false);

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

class Cyclopshit {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/cyclopshit.png");

        this.scale = 0.5;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 440, 0, 110, 110, 7, 0.04, 0, false, false);

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

class Mirror {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/mirror.png");

        this.scale = 0.55;

        this.removetimer = Date.now();

        this.removeafter = 10000;

        this.bound = new BoundingBox(this.game, this.x, this.y-30, 64, 600*this.scale);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 128, 640, 1, 1, 0, false, true);

    }

    update() {
        let that = this;
        if(Date.now() - this.removetimer > this.removeafter) {
            this.removeFromWorld = true;
        }

        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Projectiles && entity.friendly) {
                    entity.hit(that.game.camera.char);
                }
            }
        })
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - 50 - this.game.camera.y, this.scale);
    }

    
    updateBound() {
        this.bound.update(this.x, this.y);
    }
}

class Jojoeffect {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/menacing.png");

        this.scale = 0.25;

        this.timer = Date.now();

        this.movetimer = Date.now();

        this.xmove = 1;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 494, 505, 1, 0.05, 0, false, true);

    }

    update() {
        if(Date.now() - this.timer > 13000) {
            this.removeFromWorld = true;
        }

        if(Date.now() - this.movetimer > 100) {
            this.xmove *= -1;
            this.movetimer = Date.now();
        }

        this.x += this.xmove;
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}
