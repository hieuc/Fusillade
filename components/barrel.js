class Barrel {
    constructor(game, x, y, drop) {
        Object.assign(this, {game, x, y, drop});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Crate.png");

        this.animations = [];

        this.barrelsound = 0.25; //out of 1

        this.dead = false;

        this.state = 0;

        this.scale = 2;

        this.bound = new BoundingBox(this.game, this.x+44, this.y+48, 50, 50);

        this.hp = new HealthBar(this.game, this.x + 25.5 * this.scale, this.y + 50 * this.scale, 16 * this.scale, 25);

        this.loadAnimations();
    } 

    loadAnimations() {
        //idle
        this.animations[0] = new Animator(this.spritesheet, 0, 64, 64, 64, 1, 0.15, 0, false, true);

        //hit
        this.animations[1] = new Animator(this.spritesheet, 0, 64, 64, 64, 3, 0.1, 0, false, true);

        //destroyed
        this.animations[2] = new Animator(this.spritesheet, 192, 64, 64, 64, 4, 0.15, 0, false, false);
    }

    update() {
        if(this.state == 1 && this.animations[this.state].isAlmostDone(this.game.clockTick) && this.hp.current > 0) {
            if(this.hp.current > 0) {
                this.state = 0;
            } else {
                this.state = 2;
            }
        }

        if(this.state == 2  && this.animations[this.state].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
            this.spawnItem();
        }

        if(!this.dead) {
            var that = this;
                this.game.entities.forEach(function (entity) {
                    if (entity.bound && that.bound.collide(entity.bound)) {
                        if(entity instanceof Projectiles && entity.friendly) {
                            entity.removeFromWorld = true;
                            that.hp.current -= entity.damage;
                            if(that.hp.current <= 0) {
                                var audio = new Audio("./sounds/Barrelbreak.mp3");
                                that.state = 2;
                                that.dead = true;
                            } else {
                                var audio = new Audio("./sounds/Hit.mp3");
                                that.state = 1;
                            }
                            audio.volume = that.barrelsound;
                            audio.play();
                        } else {
                            //nothing
                        }
                    }
            })
        }
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    spawnItem() {
        switch(this.drop.toLowerCase()) {
            case "fayere":
                this.game.addEntity(new Fayere(this.game, this.x+46, this.y+46)); //Offset with sprite size.
                break;
            case "red":
                this.game.entities.splice(this.game.entities.length - 1, 0, new Healthmp(this.game, this.x+50, this.y+55, 0));;
                break;
            case "blue":
                this.game.addEntity(new Healthmp(this.game, this.x+50, this.y+55, 1));
                break;
            case "sred":
                this.game.addEntity(new Healthmp(this.game, this.x+50, this.y+55, 2));
                break;
            case "sblue":
                this.game.addEntity(new Healthmp(this.game, this.x+50, this.y+55, 3));
                break;
            default:
        }
    }

}