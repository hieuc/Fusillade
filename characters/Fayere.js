class Fayere {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fayere.png");

        this.scale = 2.5;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left

        this.speed = 2;

        this.velocity = { x : 0, y : 0};

        this.animations = [];
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
        this.animations[0][0] = new Animator(this.spritesheet, 6, 18, 18, 18, 7, 0.33, 14, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 6, 210, 18, 18, 7, 0.33, 14, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 6, 49, 18, 18, 8, 0.33, 14, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 9, 241, 18, 18, 8, 0.33, 14, false, true);

        //attack animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 8, 82, 16, 16, 6, 0.33, 16, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 9, 275, 16, 16, 6, 0.33, 16, false, true);

        //die animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 7, 146, 16, 16, 6, 0.33, 16, false, true);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 8, 339, 16, 16, 6, 0.33, 16, false, true);

    }

    update() {
        
     }

    draw(ctx) {
        this.animations[3][1].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }
};