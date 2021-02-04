class Rutherford {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/rutherford-main.png");

        this.scale = 2;

        this.action = 0; // 0 = idle, 1 = run, 2 = attack

        this.face = 0; // 0 = right, 1 = left

        this.speed = 3.5;

        this.velocity = { x : 0, y : 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 16, 32);

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
        // movement
        var g = this.game;
        if (g.left && !g.right) {
            this.velocity.x = -1;
        } else if (g.right && !g.left) {
            this.velocity.x = 1;
        } else {
            this.velocity.x = 0;
        }

        if (g.up && !g.down) {
            this.velocity.y = -1;
        } else if (g.down && !g.up) {
            this.velocity.y = 1;
        } else {
            this.velocity.y = 0;
        }


        // animation
        if(this.action !== 2 || this.animations[this.action][this.face].isAlmostDone(this.game.clockTick)) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0)
                this.action = 1;
            else 
                this.action = 0;
        }

        if (this.velocity.x > 0 && this.action !== 2)
            this.face = 0;
        if (this.velocity.x < 0 && this.action !== 2)
            this.face = 1;

        // update position
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
        this.updateBound();
    }

    draw(ctx) {
        this.animations[this.action][this.face].drawFrame(this.game.clockTick, ctx, this.x - 25 - this.game.camera.x, this.y - 25 - this.game.camera.y, this.scale);
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
    }

    updateBound() {
        this.bound.x = this.x + 16;
        this.bound.y = this.y + 16;
    }

    startAttack(click) {
        this.action = 2;
        if (click.x - this.x  + this.game.camera.x - 25 < 0)
            this.face = 1;
        else 
            this.face = 0;
        var velocity = this.calculateVel(click);
        var p = new Projectiles(this.game, true, this.x, this.y, velocity, 5, 1200);
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
        
        this.animations[this.action][this.face].elapsedTime = 0;
    }

    /**
     * Calculate x, y velocity towards a location such that x^2 + y^2 = 1 
     * 
     * @param {*} click 
     */
    calculateVel(click) {
        var dx = click.x - this.x + this.game.camera.x - 16;
        var dy = click.y - this.y + this.game.camera.y - 16;
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};
        
        if (dx < 0)
            v.x *= -1;

        if ((angle > 0 && dy < 0) || (angle < 0 && dy > 0))
            v.y *= -1;
        
        return v;
    }
}