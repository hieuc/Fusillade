class Healthmp {
    constructor(game, x, y, type) {
        Object.assign(this, {game, x, y, type});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");

        this.animations = [];

        this.scale = 2.5;

        this.healthsound = 0.25;

        this.regen = [500, 500, 250, 250]; //Coincides with "type" variable.

        this.bound = new BoundingCircle(this.game, this.x+15, this.y+25, 20);

        this.loadAnimations();
    } 

    loadAnimations() {
        //Red Vial
        this.animations[0] = new Animator(this.spritesheet, 34, 160, 16, 16, 1, 0.15, 0, false, true);

        //Blue Vial
        this.animations[1] = new Animator(this.spritesheet, 50, 160, 16, 16, 1, 0.15, 0, false, true);

        //Small Red Vial
        this.animations[2] = new Animator(this.spritesheet, 66, 160, 16, 16, 1, 0.15, 0, false, true);

        //Small Blue Vial
        this.animations[3] = new Animator(this.spritesheet, 82, 160, 16, 16, 1, 0.15, 0, false, true);

    }

    update() {
        var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Rutherford) {
                        that.removeFromWorld = true;
                        if(that.type == 0 || that.type == 2) {
                            if(entity.hp.current + that.regen[that.type] > entity.hp.max) {
                                var heal = entity.hp.max - entity.hp.current;
                                entity.hp.current += heal;
                            } else {
                                entity.hp.current += that.regen[that.type];
                            }
                        } else {
                            //No mana for now..
                        }
                        var audio = new Audio("./sounds/health.mp3");
                        audio.volume = that.healthsound;
                        audio.play();
                    } else {
                        //Nothing really
                    }
                }
            })
    }

    draw(ctx) {
        this.animations[this.type].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.debug) {
            this.bound.draw();
        } 
    }


}