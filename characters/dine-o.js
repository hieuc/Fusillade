class DineO {
    constructor(game, x, y) {
        Object.assign(this, {game, x , y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Dine-O.png");

        this.ss = 24;

        this.damage = 7; //Dino's damage

        this.scale = 2;

        this.state = 0;

        this.face = 0;

        this.form = 0;

        this.transformonce = true;

        this.rutherstate = this.game.camera.char.action;

        this.speed = this.game.camera.char.speed - 0.4;

        this.attackcd = this.game.camera.char.attackcd;

        this.bound = new BoundingBox(this.game, this.x-13, this.y-10, 28, 28);

        this.rutherpos = { rutherX: this.game.camera.char.x, rutherY: this.game.camera.char.y};

        this.lastAttack = Date.now();

        this.attackcd = this.game.camera.char.attackcd * 2; // in ms

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        for (var i = 0; i < 5; i++) { // 4 states as of now.
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // two directions
                this.animations[i].push([]);
                for (var k = 0; k < 2; k++) { // 2 forms. i.e. Rutherford, Ascended Rutherford.
                    this.animations[i][j].push([]);
                }
            }
        }

        //The 3rd dimension refers to if Dine-O is Boosted
        // idle
        
        this.animations[0][0][0] = new Animator(this.spritesheet, 0, 0, 24, 24, 4, 0.2, 0, false, true);
        this.animations[0][1][0] = new Animator(this.spritesheet, 478, 24, 24, 24, 4, 0.2, 0, true, true);
        this.animations[0][0][1] = new Animator(this.spritesheet, 0, 48, 24, 24, 4, 0.2, 0, false, true);
        this.animations[0][1][1] = new Animator(this.spritesheet, 478, 72, 24, 24, 4, 0.2, 0, true, true);

        //walk
        this.animations[1][0][0] = new Animator(this.spritesheet, 96, 0, 24, 24, 6, 0.15, 0, false, true);
        this.animations[1][1][0] = new Animator(this.spritesheet, 336, 24, 24, 24, 6, 0.15, 0, true, true);
        this.animations[1][0][1] = new Animator(this.spritesheet, 96, 48, 24, 24, 6, 0.15, 0, false, true);
        this.animations[1][1][1] = new Animator(this.spritesheet, 336, 72, 24, 24, 6, 0.15, 0, true, true);

        //attack
        this.animations[2][0][0] = new Animator(this.spritesheet, 240, 0, 24, 24, 4, 0.15, 0, false, true);
        this.animations[2][1][0] = new Animator(this.spritesheet, 240, 24, 24, 24, 4, 0.15, 0, true, true);
        this.animations[2][0][1] = new Animator(this.spritesheet, 240, 48, 24, 24, 4, 0.15, 0, false, true);
        this.animations[2][1][1] = new Animator(this.spritesheet, 240, 72, 24, 24, 4, 0.15, 0, true, true);

        //dash 
        this.animations[3][0][0] = new Animator(this.spritesheet, 408, 0, 24, 24, 7, 0.15, 0, false, true);
        this.animations[3][1][0] = new Animator(this.spritesheet, 0, 24, 24, 24, 7, 0.15, 0, true, true);
        this.animations[3][0][1] = new Animator(this.spritesheet, 408, 48, 24, 24, 7, 0.15, 0, false, true);
        this.animations[3][1][1] = new Animator(this.spritesheet, 0, 72, 24, 24, 7, 0.15, 0, true, true);

        //transform AND rutherford death
        this.animations[4][0][0] = new Animator(this.spritesheet, 336, 0, 24, 24, 1, 1, 0, false, true);
        this.animations[4][1][0] = new Animator(this.spritesheet, 216, 24, 24, 24, 1, 1, 0, true, true);
        this.animations[4][0][1] = new Animator(this.spritesheet, 336, 48, 24, 24, 1, 1, 0, false, true);
        this.animations[4][1][1] = new Animator(this.spritesheet, 216, 72, 24, 24, 1, 1, 0, true, true);
    }

    update() {
        //Get rutherford's state and save it for time saving.
        this.rutherstate = this.game.camera.char.action;
        this.rutherX = this.game.camera.char.x;
        this.rutherY = this.game.camera.char.y;

        //Default to state 0 in case of a bug.
        this.state = 0;

        //If Dino's form doesn't align with Rutherford, fix it.
        if(this.game.camera.char.form != this.form) {
            this.form = this.game.camera.char.form;
        }

        //If we are colliding with rutherford or if rutherford is idle, stand idle.
        if(this.rutherstate == 7) {
            this.state = 4;
        } else if(this.rutherstate == 0 || this.bound.collide(this.game.camera.char.bound)) {
            this.transformonce = true;
            this.state = 0;
            this.decideDir();
        } else if(this.rutherstate == 1 || this.rutherstate == 6) {
            this.transformonce = true;
            this.state = 1;
            if(Math.abs(this.x - this.rutherX) > 4) {
                if(this.x - this.rutherX < 0) {
                    this.face = 0;
                    this.x += this.speed;
                } else if(this.x - this.rutherX > 0) {
                    this.face = 1;
                    this.x -= this.speed;
                }
            }    

            if(Math.abs(this.y - this.rutherY) > 4) {
                if(this.y - this.rutherY < 0) {
                    this.y += this.speed;
                } else if(this.y - this.rutherY > 0) {
                    this.y -= this.speed;
                }
            }
        } else if(this.rutherstate == 3) {
            if(this.transformonce) {
                this.state = 4;
                this.game.addEntity(new Thuneffect(this.game, this.x-125, this.y - 160));
                this.transformonce = false;
                if(this.animations[this.state][this.face][this.form].isAlmostDone()) {
                    this.form = this.game.camera.char.form == 1? 0:1;
                }
            }
        } else if(this.rutherstate == 4) {
            this.state = 3;
            this.transformonce = true;
            if(Math.abs(this.x - this.rutherX) > 4) {
                if(this.x - this.rutherX < 0) {
                    this.face = 0;
                    this.x += this.speed * 2;
                } else if(this.x - this.rutherX > 0) {
                    this.face = 1;
                    this.x -= this.speed * 2;
                }
            }    

            if(Math.abs(this.y - this.rutherY) > 4) {
                if(this.y - this.rutherY < 0) {
                    this.y += this.speed * 2;
                } else if(this.y - this.rutherY > 0) {
                    this.y -= this.speed * 2;
                }
            }
        }
        
        if(this.rutherstate == 2 || this.rutherstate == 6) {
            this.state = this.rutherstate == 2? 2:1;
            this.attack();
        }

        this.updateBound();

    }

    draw(ctx) {
        this.animations[this.state][this.face][this.form].drawFrame(this.game.clockTick, ctx, this.x - 25 - this.game.camera.x, this.y - 25 - this.game.camera.y, this.scale);
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
    }

    updateBound() {
        this.bound.update(this.x-8, this.y-10);
    }

    decideDir() {
        if(this.x - this.rutherX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    attack() {
        if(Date.now() - this.lastAttack > this.attackcd) {
            var velocity = this.calculateVel(this.game.mouse);
            let formdamage = this.form == 1? 5:0;
            var pp = this.form == 0? {sx: 242, sy: 304, size: 16}: {sx: 192, sy:304, size:16};
            var p = new Projectiles(this.game, true, this.x-7, this.y, velocity, 6, 
                1200, this.damage + randomInt(5) + formdamage, pp, "star"); 
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
                
            this.animations[this.state][this.face][this.form].elapsedTime = 0;
            this.lastAttack = Date.now();
        }
    }

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