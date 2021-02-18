class Slippey {
    constructor(game, x, y) {
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Slime.png");

        Object.assign(this, {game, x, y});

        this.state = 0;
        
        this.face = 0;

        this.scale = 2;

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        for (var i = 0; i < 4; i++) { // 4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        
        // idle animation for state = 0   
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 158, 0, 32, 25, 3, 0.18, 0, true, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 256, 0, 32, 25, 3, 0.18, 0, false, true);

        // walk animation for state = 1
        // facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 0, 0, 32, 25, 5, 0.18, 0, true, true);

        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 352, 0, 32, 25, 5, 0.18, 0, false, true);

        // attack animation for state = 2
        // facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 0, 27, 32, 25, 5, 0.18, 0, false, true);

        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 352, 27, 32, 25, 5, 0.18, 0, true, true);

        // morph animation for state = 3 
        // facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 160, 27, 32, 25, 3, 0.25, 0, true, false);

        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 288, 27, 32, 25, 3, 0.25, 0, false, false);
    }

    update() {
        this.face = 1;
        this.state = 3;
    }

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

}