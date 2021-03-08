class Wols extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        Object.assign(this, {});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Wols.png");

        this.ss = 200;

        this.scale = 1;

        this.reduceone = true;

        this.tested = false;

        this.wallcd = 10000;

        this.lastcreated = -50;

        this.wallcdtimer = Date.now()-10000;

        this.bound = new BoundingBox(this.game, this.x, this.y, 70, 200);

        this.hp = new HealthMpBar(this.game, this.x + 4 * this.scale, this.y + 32 * this.scale, 100 * this.scale, 500, 0);

        this.state = 0;

        this.face = 0;

        this.animations = []

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 2; i++) { // 4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        //Idle for state 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 200, 200, 3, 0.65, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 1400, 200, 200, 200, 3, 0.65, 0, true, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 600, 0, 200, 200, 4, 0.25, 0, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 600, 200, 200, 200, 4, 0.25, 0, true, true);
    }

    update() {
        if(Date.now() - this.wallcdtimer > this.wallcd) {
            this.game.addEntity(new Mirror(this.game, this.x + this.lastcreated, this.y));
            this.lastcreated = this.lastcreated == -50? 160: -50;
            this.wallcdtimer = Date.now();
        }

        if(Math.abs(this.x - this.game.camera.char.x) < 1100 && Math.abs(this.y - this.game.camera.char.y) < 1100) {
            this.state = 1;
            if(this.reduceone) {
                this.game.camera.char.speed *= 0.8;
                this.reduceone = false;
            }
        } else {
            this.state = 0;
            if(!this.reduceone) {
                this.game.camera.char.speed /= 0.8;
                this.reduceone = true;
            }
        }
        

        this.checkCollisions();
        this.updateBound();
    }

    //Check for projectile, environmental or other collisions.
    checkCollisions() {
        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Projectiles && entity.friendly) {
                    entity.hit(that);
                    ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                } else if(entity instanceof Bluebeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new Star(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                } else if(entity instanceof Redbeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new Burn(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                } 

                if(that.hp.current <= 0) {
                    if(!that.tested) {
                        that.removeFromWorld = true;
                        that.tested = true;
                        that.game.addEntity(new Redbeam(that.game, that.x + 75, that.y-10));
                        that.game.camera.char.speed /= 0.8;
                    }
                }
            }
        })
    }

    updateBound() {
        this.bound.update(this.x+62, this.y);

        this.hp.x = this.x + 45 * this.scale;
        this.hp.y = this.y + 200 * this.scale;
    }
}