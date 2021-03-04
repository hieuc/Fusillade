class Fernight extends Enemy {
    constructor(game, x, y) {
        super(game,x,y);

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fernight.png");

        this.scale = 1;

        this.state = 0;

        this.face = 0;

        this.animations = [];

        this.bound = new BoundingBox(this.game, this.x, this.y, 64, 64);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 68 * this.scale, 64 * this.scale, 270, 0);

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 5; i++) { // 5 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 192, 574, 64, 64, 5, 0.3, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 640, 574, 64, 64, 5, 0.3, 0, true, true);

        //walk animation for state = 1
        this.animations[1][0] = new Animator(this.spritesheet, 64, 128, 64, 64, 2, 0.2, 0, false, true);

        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 1088, 128, 64, 64, 2, 0.2, 0, true, true);

        //Attack1 animation for state = 2
        this.animations[2][0] = new Animator(this.spritesheet, 0, 384, 82, 56, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 1032, 384, 82, 56, 3, 0.2, 0, true, true);

        //Attack2 animation for state = 3
        this.animations[3][0] = new Animator(this.spritesheet, 0, 448, 64, 64, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 1088, 448, 64, 64, 3, 0.2, 0, true, true);

        //Death animation for state = 3
        this.animations[4][0] = new Animator(this.spritesheet, 0, 512, 64, 64, 10, 0.1, 0, true, true);

        // facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 640, 512, 64, 64, 10, 0.1, 0, false, true);
    }

    update() {
        this.state = 4;

        this.face = 0;

        this.updateBound();
    }   

    updateBound() {
        this.bound.update(this.x + 10, this.y + 5);

        this.hp.x = this.x * this.scale;
        this.hp.y = this.y + 68 * this.scale;
    }

}