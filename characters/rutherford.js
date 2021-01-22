class Rutherford {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/rutherford-main.png");

        this.scale = 2;

        this.action = 0; // 0 = idle, 1 = run, 2 = attack

        this.face = 0; // 0 = right, 1 = left

        this.speed = 2;

        this.velocity = { x : 0, y : 0};

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 3; i++) {
            this.animations[i] = [];
        }

        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 50, 36, 4, 0.25, 0, false, true);
        this.animations[0][1] = new Animator(this.spritesheet, 570, 0, 50, 36, 4, 0.25, 0, true, true);

        this.animations[1][0] = new Animator(this.spritesheet, 50, 39, 50, 36, 6, 0.15, 0, false, true);
        this.animations[1][1] = new Animator(this.spritesheet, 420, 39, 50, 36, 6, 0.15, 0, true, true);

        this.animations[2][0] = new Animator(this.spritesheet, 0, 222, 50, 36, 5, 0.05, 0, false, false);
        this.animations[2][1] = new Animator(this.spritesheet, 520, 222, 50, 36, 5, 0.05, 0, true, false);
    }

    update() {
        if(this.action !== 2 || this.animations[this.action][this.face].isDone()) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0)
                this.action = 1;
            else 
                this.action = 0;
        }

        if (this.velocity.x > 0)
            this.face = 0;
        if (this.velocity.x < 0)
            this.face = 1;

        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }

    draw(ctx) {
        this.animations[this.action][this.face].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    startAttack() {
        this.action = 2;
        this.animations[this.action][this.face].elapsedTime = 0;
    }
}