class Bunny extends Enemy {
    constructor (game, x, y) {
        super(game, x, y);

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/bunny.png");

        // sprite size
        this.ss = 8;

        this.scale = 3;

        this.action = 0; // 0 = idle, 1 = moving

        this.state = 0; // 0 = normal, 1 = enraged

        this.face = 0; // 0 = right, 1 = left

        this.speed = 2.5;

        this.moveDelay = 400;
        this.moveTime = 600;

        this.detectRange = 450;
        this.closestRange = 125;
        this.attackRate = 200;

        this.velocity = { x: 0, y: 0};

        this.timestamp = Date.now();

        var boundsize = this.ss*this.scale/1.5;
        this.bound = new BoundingBox(this.game, this.x + this.ss/2, this.y + this.ss,
                         boundsize, boundsize);

        this.hp = new HealthMpBar(this.game, this.x, this.y + this.ss*this.scale*1.15, this.ss*(this.scale+1), 200);

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations = [];
        for (var i = 0; i < 2; i++) {
            this.animations[i] = [];
            for (var j = 0; j < 2; j++) {
                this.animations[i][j] = [];
            }
        }

        // normal idle
        //            state/action/face
        this.animations[0][0][0] = new Animator(this.spritesheet, 32, 0, this.ss, this.ss, 2, 0.5, 0, true, true);
        this.animations[0][0][1] = new Animator(this.spritesheet, 32, 16, this.ss, this.ss, 2, 0.5, 0, true, true);

        // normal jump
        this.animations[0][1][0] = new Animator(this.spritesheet, 0, 0, this.ss, this.ss, 2, 0.25, 0, true, true);
        this.animations[0][1][1] = new Animator(this.spritesheet, 0, 16, this.ss, this.ss, 2, 0.25, 0, true, true);

        // engared idle
        this.animations[1][0][0] = new Animator(this.spritesheet, 32, 8, this.ss, this.ss, 2, 0.5, 0, true, true);
        this.animations[1][0][1] = new Animator(this.spritesheet, 32, 24, this.ss, this.ss, 2, 0.5, 0, true, true);

        // enraged jump
        this.animations[1][1][0] = new Animator(this.spritesheet, 0, 8, this.ss, this.ss, 2, 0.25, 0, true, true);
        this.animations[1][1][1] = new Animator(this.spritesheet, 0, 24, this.ss, this.ss, 2, 0.25, 0, true, true);
    }

    draw(ctx) {
        this.animations[this.state][this.action][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        
        if (this.hp && this.state === 1) {
            this.hp.draw();
        }
        
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    update() {

        // distance from self to rutherford
        var ruth = this.game.camera.char;
        var d = Math.sqrt(Math.pow(ruth.x - this.x, 2) + Math.pow(ruth.y - this.y, 2));
        var time = Date.now() - this.timestamp;
        
        // actions for normal state
        // if falls below 50% hp, switch to enraged state
        if (this.state === 0 && this.hp.current > this.hp.maxHealth / 2) {
            // decide action:
            // if stopped long enough, move; if moved long enough, stop
            if (this.action === 0 && time > this.moveDelay) {
                this.action = 1;
                this.timestamp = Date.now();
            } else if (this.action === 1 && time > this.moveTime) {
                this.action = 0;
                this.timestamp = Date.now();
            }

            // if moving, try to head towards rutherford
            if (this.action === 1) {
                if (d > this.closestRange && d < this.detectRange) {
                    this.velocity = this.calculateVel();
                } 
                // if outside of range then pick a random direction.
                // the if ensure that the bunny doesnt stop, while 
                // only choose the direction once every jump
                else if (this.velocity.x === 0 && this.velocity.y === 0) {
                    this.velocity = {x: Math.random()* 2 - 1, y: Math.random() * 2 - 1};
                }
            } else {
                // this is idle state
                this.velocity = { x: 0, y: 0};
            }
        } else if (this.state === 0){
            // switch state
            // should only happen once
            this.state = 1;
            this.hp.current = this.hp.maxHealth;
        } else if (this.state === 1) {
            // already enraged
            this.velocity = this.calculateVel();
            this.action = 1;
            this.speed = 6;
            this.scale = 4;
            if (time > this.attackRate) {
                this.attack();
                this.timestamp = Date.now();
            }
        }

        // update faces
        if (this.velocity.x < 0) {
            this.face = 1;
        } else if (this.velocity.x > 0) {
            this.face = 0;
        }
        
        // change position based on movement
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;

        // bounds
        this.updateBounds();
        this.checkCollision();
    }

    checkCollision() {
        this.game.entities.forEach(e => {
            if (e instanceof Projectiles && this.bound.collide(e.bound) && e.friendly) {
                e.hit(this);
                if (this.hp.current <= 0) {
                    this.removeFromWorld = true;
                }
            } else if (e instanceof Obstacle && this.bound.collide(e.bound)) {
                var changed = false;
                // check horizontal
                if (this.velocity.x > 0 && this.bound.left < e.bound.left & this.bound.right >= e.bound.left) {
                    // revert the position change if bounds met
                    this.x -= this.velocity.x * this.speed;
                    this.velocity.x = 0;
                } else if (this.velocity.x < 0 && this.bound.right > e.bound.right && this.bound.left <= e.bound.right) {
                    this.x -= this.velocity.x * this.speed;
                    this.velocity.x = 0;
                }
                // check vertical 
                else if (this.velocity.y > 0 && this.bound.top < e.bound.top && this.bound.bottom >= this.bound.top) {
                    this.y -= this.velocity.y * this.speed;
                    this.velocity.y = 0;
                } else if (this.velocity.y < 0 && this.bound.bottom > e.bound.bottom && this.bound.top <= e.bound.bottom) {
                    this.y -= this.velocity.y * this.speed;
                    this.velocity.y = 0;
                }
                if (changed) {
                    // second bound update for collision update
                    this.updateBounds();
                }
            }
        });
    }

    updateBounds() {
        this.bound.w = this.ss*this.scale/1.5;
        this.bound = new BoundingBox(this.game, this.x + this.ss/2, this.y + this.ss,
            this.bound.w, this.bound.w);

        this.hp.x = this.x;
        this.hp.y = this.y + this.ss * this.scale * 1.15;
    }

    attack() {
        var velocity = this.calculateVel();
        var pp = {sx: 64, sy: 336, size: 16};
        var p = new Projectiles(this.game, false, this.x, this.y, velocity, 8, 2000, 15, pp);
        p.bound.r = 8;
        this.game.addEntity(p);
    }
}