class Slime extends Enemy {
    constructor(game, x, y, scale) {
        super(game, x, y);
        this.scale = scale;

        this.state = 0; // 0 = idle, 1 = move, 2 = attack, 3 = split, 4 = death
        this.face = 0; // 0 = right, 1 = left
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/slimee.png");
        this.attackcd = 300;
        this.movecd = 300;
        this.triggerrange = 500;
        this.speed = 1;

        if (this.game.camera.level === 4) {
            this.triggerrange = 350;
            this.speed = 0;
        }

        this.pp = {sx: 176, sy: 80, size: 16, scale: 0.5*(this.scale-1)};
        
        this.velocity = {x: 0, y: 0};
        this.damage = 15;

        this.bound = new BoundingBox(this.game, this.x + this.scale*12, this.y + this.scale*26, 8 * scale, 5 * scale);
        this.hp = new HealthMpBar(this.game, this.bound.x - this.scale, this.bound.y + 6 * this.scale, 10 * this.scale, 25*this.scale);
        this.animations = [];
        this.loadAnimations();
        this.attackts = Date.now(); // attack timestamp
        this.movets = Date.now(); // movement timestamp
    }

    update() {
        if (this.hp.current <= 0 ) {
            if (this.state !== 3 && this.scale > 3.5)
                this.state = 3;
            else if (this.state !== 4 && this.scale <= 3.5) {
                this.state = 4;
            } 
        }
        if (this.state === 4 && this.animations[4][this.face].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
            if (this.scale <= 3.5) {
                this.game.addEntity(new Threecoin(this.game, this.bound.x, this.bound.y));
            }
        }
        else if (this.state === 3 && this.animations[3][this.face].isAlmostDone(this.game.clockTick)) {
            // split: create 2 new slime with lower scale
            this.removeFromWorld = true;
            this.game.addEntity(new Slime(this.game, this.x - this.scale*11, this.y + this.scale*3, this.scale - 0.5));
            this.game.addEntity(new Slime(this.game, this.x + this.scale*11, this.y + this.scale*3, this.scale - 0.5));
        } else if (this.state < 3) {
            // move
            if (Date.now() - this.movets >= this.movecd) {
                this.velocity.x = Math.random()*2-1;
                this.velocity.y = Math.random()*2-1;

                this.movets = Date.now();
            }

            var e = this.game.camera.char;
            var d = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
            // attack
            if (Date.now() - this.attackts >= this.attackcd && d <= this.triggerrange) {
                this.game.addEntity(new Projectiles(this.game, false, this.bound.x, this.bound.y, this.calculateVel(), 4, 3000, this.damage*(this.scale-2), this.pp));

                this.attackcd = 300 + randomInt(5)*100;
                this.attackts = Date.now();
            }

            this.x += this.velocity.x*this.speed;
            this.y += this.velocity.y*this.speed;

            this.updateBound();
            this.checkCollision();
        }
    }

    attack() {

    }

    updateBound() {
        this.bound = new BoundingBox(this.game, this.x + this.scale*12, this.y + this.scale*26, 8 * this.scale, 5 * this.scale);
        this.hp.x = this.bound.x - this.scale;
        this.hp.y = this.bound.y + 6 * this.scale; 
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
        this.animations[3][0] = new Animator(this.spritesheet, 0, 160, 64, 32, 10, 0.07, 0, false, false);
        this.animations[3][1] = this.animations[3][0];

        // death
        this.animations[4][0] = new Animator(this.spritesheet, 0, 128, 32, 32, 7, 0.1, 0, false, false);
        this.animations[4][1] = this.animations[4][0];
    }

    draw(ctx) {
        if (this.state === 3) {
            this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - this.scale*10, this.y - this.game.camera.y + this.scale*6, this.scale-1);
        } else {
            this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        }
        
        if (this.hp && this.state !== 3 && this.game.camera.level !== 4) {
            this.hp.draw();
        }
        
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    checkCollision() {
        this.game.entities.forEach(e => {
            if (e instanceof Projectiles && this.bound.collide(e.bound) && e.friendly) {
                e.hit(this);
                ASSET_MANAGER.playAsset("./sounds/sfx/slimehit.mp3");
            } else if(e instanceof Bluebeam && this.bound.collide(e.bound)) {
                this.hp.current -= e.damage;
                this.game.addEntity(new Star(this.game, e.x, e.y + 180));
                this.game.addEntity(new Score(this.game, this.bound.x + this.bound.w/2, this.bound.y, e.damage));
                //var audio = new Audio("./sounds/Hit.mp3");
                //audio.volume = PARAMS.hit_volume;
                //audio.play();
            } else if(e instanceof Redbeam && this.bound.collide(e.bound) ) {
                this.hp.current -= e.damage;
                this.game.addEntity(new Burn(this.game, e.x, e.y + 180));
                this.game.addEntity(new Score(this.game, this.bound.x + this.bound.w/2, this.bound.y, e.damage));
                //var audio = new Audio("./sounds/Hit.mp3");
                //audio.volume = PARAMS.hit_volume;
                //audio.play();
            }
            
            else if (e instanceof Obstacle && this.bound.collide(e.bound)) {
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

    calculateVel() {
        var enemy = this.game.camera.char;
        // predict enemy movement
        var dx = enemy.bound.x + enemy.velocity.x*50*enemy.speed - (this.bound.x);
        var dy = enemy.bound.y + enemy.velocity.y*50*enemy.speed - (this.bound.y);

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }
}