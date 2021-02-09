class Healthmp {
    constructor(game, x, y, type) {
        Object.assign(this, {game, x, y, type});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");

        this.animations = [];

        this.scale = 2.5;

        this.healthsound = 0.25;

        this.regen = [500, 500, 250, 250]; //Coincides with "type" variable.

        this.bound = new BoundingBox(this.game, this.x, this.y+10, 32, 32);

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
        this.game.entities.forEach(e => {
            if (e instanceof Rutherford && e.bound.collide(that.bound)) {
                console.log("YOYOYOYO");    
            }
        });
        
    }

    draw(ctx) {
        this.animations[this.type].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.debug) {
            this.bound.draw();
        } 
    }


}