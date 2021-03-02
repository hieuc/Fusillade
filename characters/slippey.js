class Slippey extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Slime.png");

        this.state = 0; 

        this.start = false; //are we morphing or doing death animation.
        
        this.face = 0;

        this.scale = 2;

        this.transform = 0;

        this.cooldown = false; //Have we hit a wall, if yes go on cooldown on normal pattern.

        this.lastdirection = {inX: 0, inY: 0}; //If we collided, what was the last direction we were walking in?

        this.cooldowntimer = 0; //timer to keep track of cooldown duration.

        this.cooldownduration = 1000; //duration of cooldown.

        this.speed = 1; //Slippey's speed.

        this.attacking = false; //Are we attacking at the moment

        this.firerate = 500; //Attack speed

        this.firerateslime = 1000; //Attack speed in slime form.

        this.attacktimer = Date.now(); //Used to keep track of how long ago we last fired.

        this.enemypos = { enemyX: this.game.camera.x, enemyY: this.game.camera.y};

        this.bound = new BoundingBox(this.game, this.x, this.y, 32, 25);

        this.hp = new HealthMpBar(this.game, this.bound.x, this.bound.y, 20 * this.scale, 800, 0); //Has mana field too.

        this.animations = [];

        this.morphcheck = true; //Have we run a check to see whether to stay slime or morph, happens only ONCE.

        this.loadAnimations();

    }

    loadAnimations() {
        for (var i = 0; i < 5; i++) { // 4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
                for (var k = 0; k < 2; k++) { // 2 forms. i.e. Slime, Slimeford.
                    this.animations[i][j].push([]);
                }
            }
        }

        //Slime exploding animation.
        
        // idle animation for state = 0   
        // facing right = 0
        this.animations[0][0][0] = new Animator(this.spritesheet, 158, 0, 32, 25, 3, 0.18, 0, true, true);

        // facing left = 1
        this.animations[0][1][0] = new Animator(this.spritesheet, 256, 0, 32, 25, 3, 0.18, 0, false, true);

        // walk animation for state = 1
        // facing right = 0
        this.animations[1][0][0] = new Animator(this.spritesheet, 0, 0, 32, 25, 5, 0.18, 0, true, true);

        // facing left = 1
        this.animations[1][1][0] = new Animator(this.spritesheet, 352, 0, 32, 25, 5, 0.18, 0, false, true);

        // attack animation for state = 2
        // facing right = 0
        this.animations[2][0][0] = new Animator(this.spritesheet, 0, 27, 32, 25, 5, 0.1, 0, false, true);

        // facing left = 1
        this.animations[2][1][0] = new Animator(this.spritesheet, 352, 27, 32, 25, 5, 0.1, 0, true, true);

        // morph animation for state = 3 
        // facing right = 0
        this.animations[3][0][0] = new Animator(this.spritesheet, 160, 27, 32, 25, 3, 0.25, 0, true, false);

        // facing left = 1
        this.animations[3][1][0] = new Animator(this.spritesheet, 288, 27, 32, 25, 3, 0.25, 0, false, false);

        //die animation for state = 4
        //facing right
        this.animations[4][0][0] = new Animator(this.spritesheet, 96, 50, 32, 25, 5, 0.1, 0, true, false);
        
        //facing left
        this.animations[4][1][0] = new Animator(this.spritesheet, 256, 50, 32, 25, 5, 0.1, 0, false, false);

        //idle animation for state = 0, transform = 1
        //facing right
        this.animations[0][0][1] = new Animator(this.spritesheet, 0, 0, 50, 37, 1, 0.18, 0, false, true);
        
        //facing left
        this.animations[0][1][1] = new Animator(this.spritesheet, 400, 74, 50, 37, 1, 0.18, 0, false, true);

        //run animation for state = 1, transform = 1
        //facing right
        this.animations[1][0][1] = new Animator(this.spritesheet, 0, 37, 50, 37, 6, 0.1, 0, false, true);
        
        //facing left
        this.animations[1][1][1] = new Animator(this.spritesheet, 150, 111, 50, 37, 6, 0.1, 0, true, true);

        //attack animation for state = 2, transform = 1
        //facing right
        this.animations[2][0][1] = new Animator(this.spritesheet, 0, 0, 50, 37, 9, 0.1, 0, false, true);
        
        //facing left
        this.animations[2][1][1] = new Animator(this.spritesheet, 0, 74, 50, 37, 9, 0.1, 0, true, true);

        //explode for slime rutherford
        this.animations[4][0][1] = new Animator(this.spritesheet, 0, 146, 37.5, 37.5, 11, 0.12, 0, false, false);
        this.animations[4][1][1] = new Animator(this.spritesheet, 0, 146, 37.5, 37.5, 11, 0.12, 0, false, false);

    }

    update() {
        //Refresh our speed, in case we get hit. This formula makes sure the speed is adjusted according to form.
        this.speed = this.transform*4 + 1
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        //If we have collided to environemnt, go back and opposite to the direction you collided.
        if(this.cooldown) {
            if(Date.now() - this.cooldowntimer < this.cooldownduration) {
                let dirX = this.lastdirection.inX > 0? -1: this.lastdirection.inX < 0? 1:0;
                this.x += this.speed * dirX;
                this.face = dirX == 1? 0:1;
                this.state = 1;
                let dirY = this.lastdirection.inY > 0? -1: this.lastdirection.inY < 0? 1:0;
                this.y += this.speed * dirY;

            } else {
                this.cooldowntimer = 0;
                this.state = 0;
                this.cooldown = false;
            }
        //Otherwise, if we're triggered or within range.
        } else if(Math.abs(this.x - this.enemyX) < 600 && Math.abs(this.y - this.enemyY) < 300 || (this.triggered)) {
            this.triggered = true;
            //Check once in your existence if you should morph or stay as slime.
            if(this.morphcheck) {
                this.transform = Math.random() < 0.51? 1:0;
                if(this.transform == 1) {
                    this.state = 4;
                    this.bound = new BoundingBox(this.game, this.x, this.y, 40, 37);
                    this.start = true;
                    this.speed = 5;
                    this.spritesheet = ASSET_MANAGER.getAsset("./sprites/SlimeRuther.png");
                    this.loadAnimations();
                }
                this.morphcheck = false;
            }

            //If we are Slimeford, run this section.
            if(this.transform == 1) {
                if(this.state == 4 && !this.start) {
                    if(this.animations[this.state][this.face][this.transform].isAlmostDone(this.game.clockTick)) {
                        this.removeFromWorld = true;
                    }
                } else if(this.state == 4 && this.start){
                    if(this.animations[this.state][this.face][this.transform].isAlmostDone(this.game.clockTick)) {
                        this.state = 1;
                        this.start = false;
                        this.x -= 10;
                        this.y -= 20;
                    }
                } else if((Math.abs(this.x - this.enemyX) <= 300 && Math.abs(this.y - this.enemyY <= 300)) || this.attacking) {
                    this.attacking = true;
                    this.state = 2;
                    this.decideDir();
                    if(Date.now() - this.attacktimer > this.firerate) {
                        this.attack();
                        this.attacking = false;
                        this.attacktimer = Date.now();
                        this.animations[this.state][this.face][this.transform].elapsedTime = 0;
                    }
                } else if(Math.abs(this.x - this.enemyX) > 300 || Math.abs(this.y - this.enemyY > 300)) {
                    if(Math.abs(this.x - this.enemyX) > 2) {
                        if(this.x < this.enemyX) {
                            this.x += this.speed;
                        } else {
                            this.x -= this.speed;
                        }
                    }
                    if(Math.abs(this.y - this.enemyY) > 2) {
                        if(this.y < this.enemyY) {
                            this.y += this.speed;
                        } else {
                            this.y -= this.speed;
                        }
                    }
                    this.state = 1;
                    this.decideDir();
                } 
            //If we are Slime, then run this section of code.
            } else {
                if(this.state == 4) {
                    if(this.animations[this.state][this.face][this.transform].isAlmostDone(this.game.clockTick)) {
                        this.removeFromWorld = true;
                    }
                }
                if(Math.abs(this.x - this.enemyX) > 400 || Math.abs(this.y - this.enemyY) > 200) {
                    if(Date.now() - this.attacktimer > this.firerateslime) {
                        this.slimeattack();
                        this.state = 2;
                        this.attacktimer = Date.now();
                    }
                    this.decideDir();
                } else {
                    this.state = 1;
                    if(this.x < this.enemyX) {
                        this.x -= this.speed;
                        this.face = 0;
                    } else {
                        this.x += this.speed;
                        this.face = 1;
                    }
                    if(Date.now() - this.attacktimer > this.firerateslime+400) {
                        this.slimeattack();
                        this.attacktimer = Date.now();
                    }
                }
            }
        }

        this.updateBound();
        if(this.state !== 4) {
            this.checkCollisions();
        }
    }   

    draw(ctx) {
        //Draw it only when we aren't transforming or dying in Slimeford form, (hp bar looks skewed)
        if(this.state != 4 && this.start != true) {
            this.hp.draw();
        }
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
        this.animations[this.state][this.face][this.transform].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    updateBound() {
        if(this.transform == 1) {
            this.bound.update(this.x + 30, this.y + 37);
            this.hp.x = this.bound.x;
            this.hp.y = this.bound.y + 25 * this.scale;
        } else {
            this.bound.update(this.x + 22, this.y + 25);
            this.hp.x = this.bound.x - 10;
            this.hp.y = this.bound.y + 16 * this.scale;
        }
    }

    
    decideDir() {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    attack() {
        var velocity = this.calculateVel();
        var pp = { sx: 34, sy: 144, size: 16};
        var p = new Deflectprojectile(this.game, false, this.bound.x, this.bound.y, velocity, 14, 6000, 25, Math.PI/5, pp);
        p.bound.r = 10;
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    slimeattack() {
        var velocity = this.calculateVel();
        var pp = { sx: 192, sy: 144, size: 16};
        var p = new Dividingprojectile(this.game, false, this.x, this.y, velocity, 7, 1500, 60, pp);
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    checkCollisions() {
        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Obstacle) {
                    if(that.bound.left < entity.bound.left && that.bound.right >= entity.bound.left) {
                        that.x -= that.speed*1.2;
                        that.lastdirection.inX = 1;
                        that.speed = 0;
                    } else if(that.bound.right > entity.bound.right && that.bound.left <= entity.bound.right) {
                        that.x += that.speed*1.2;
                        that.lastdirection.inX = -1;
                        that.speed = 0;
                    }
                    if(that.bound.top < entity.bound.top && that.bound.bottom >= entity.bound.top) {
                        that.y -= that.speed*1.2;
                        that.lastdirection.inY = 1;
                        that.speed = 0;
                    } else if(that.bound.bottom > entity.bound.bottom && that.bound.top <= entity.bound.bottom) {
                        that.y += that.speed*1.2;
                        that.lastdirection.inY = -1;
                        that.speed = 0;
                    }

                    that.cooldown = true;
                    that.cooldowntimer = Date.now();
                }
            }

            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Projectiles && entity.friendly) {
                    entity.hit(that);
                    ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                } else if(entity instanceof Bluebeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new Star(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                } else if(entity instanceof Redbeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new Burn(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                }
                if(that.hp.current <= 0) {
                    that.state = 4;
                }
            }
        })
    }

}