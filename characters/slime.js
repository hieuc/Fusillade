class Slime extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);

        this.state = 0; // 0 = idle, 1 = move, 2 = attack, 3 = split, 4 = death
        this.face = 0; // 0 = right, 1 = left
        this.scale = 2;
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/slime.png");
        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 5; i++) {
            this.animations[i] = [];
        }

        // idle 
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 32, 32, 4, 0.1, 0, false, true);
        this.animations[0][1] = this.animations[0][0];

        //  move
        this.animations[1][0] = new Animator(this.spritesheet, 0, 96, 32, 32, 4, 0.1, 0, false, true);
        this.animations[1][1] = new Animator(this.spritesheet, 96, 96, 32, 32, 4, 0.1, 0, true, true);

        // attack
        this.animations[2][0] = new Animator(this.spritesheet, 0, 64, 32, 32, 7, 0.05, 0, false, false);
        this.animations[2][1] = this.animations[1][0];

        // split
        this.animations[3][0] = new Animator(this.spritesheet, 0, 160, 64, 32, 10, 0.1, 0, false, false);
        this.animations[3][1] = this.animations[3][0];

        // death
        this.animations[4][0] = new Animator(this.spritesheet, 0, 128, 32, 32, 7, 0.05, 0, false, false);
        this.animations[4][1] = this.animations[4][0];
    }



}