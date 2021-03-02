class Potion {
    constructor(game, x, y, type) {
        Object.assign(this, {game, x, y, type});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");

        this.animations = [];

        this.scale = 2.5;

        this.bound = new BoundingCircle(this.game, this.x+15, this.y+25, 20);

        this.loadAnimations();
    } 

    loadAnimations() {
        //Red Vial
        this.animations[0] = new Animator(this.spritesheet, 32, 160, 16, 16, 1, 0.15, 0, false, true);

        //Small Red Vial
        this.animations[1] = new Animator(this.spritesheet, 64, 160, 16, 16, 1, 0.15, 0, false, true);

        //Blue Vial
        this.animations[2] = new Animator(this.spritesheet, 48, 160, 16, 16, 1, 0.15, 0, false, true);

        //Small Blue Vial
        this.animations[3] = new Animator(this.spritesheet, 80, 160, 16, 16, 1, 0.15, 0, false, true);

    }

    update() {      
        var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Rutherford) {
                        that.removeFromWorld = true;
                        that.game.camera.inventory.slots[that.type]++;
                        
                        ASSET_MANAGER.playAsset("./sounds/sfx/health.mp3");
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