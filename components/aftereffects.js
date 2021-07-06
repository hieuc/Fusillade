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

        this.damage = Math.ceil(this.game.camera.char.damage/5);

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
    constructor(game, x, y, scale) {
        Object.assign(this, {game, x, y, scale});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/RBeam.png");

        this.damage = Math.ceil(this.game.camera.char.damage/4);

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
        if (this.game.camera.level !== 4) {
            this.scale += 0.003;
            this.y -= 1;
            if(Date.now() - this.timer > 5000) {
                this.removeFromWorld = true;
            }
    
            if(Date.now() - this.movetimer > 100) {
                this.xmove *= -1;
                this.movetimer = Date.now();
            }
    
            this.x += this.xmove;
        }
        else {
            if(Date.now() - this.movetimer > 100) {
                this.xmove *= -1;
                this.movetimer = Date.now();
            }
            this.x += this.xmove;
        }
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}

class CelebrationO {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/CelebrationO.png");

        this.scale = 3;

        this.timer = Date.now();

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 7, 51, 40, 0.05, 0, false, true);

    }

    update() {

        if(Date.now() - this.timer > 3000) {
            this.removeFromWorld = true;
            this.game.addEntity(new ExpO(this.game, this.x-160, this.y-160));
        }

        this.y -= 2;
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}

class CelebrationB {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/CelebrationB.png");

        this.scale = 2;

        this.timer = Date.now();

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 7, 51, 40, 0.05, 0, false, true);

    }

    update() {

        if(Date.now() - this.timer > 5000) {
            this.removeFromWorld = true;
            this.game.addEntity(new ExpB(this.game, this.x-160, this.y-160));
        }

        this.y -= 1.7;
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}

class ExpB {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/expB.png");

        this.scale = 4;

        this.timer = Date.now();

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 88, 86, 82, 0.05, 0, false, false);

    }

    update() {

        if(this.animations[0].isDone()) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}

class ExpO {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/expO.png");

        this.scale = 4;

        this.timer = Date.now();

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[0] = new Animator(this.spritesheet, 0, 0, 72, 86, 82, 0.05, 0, false, false);

    }

    update() {

        if(this.animations[0].isDone()) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }
}
