class Rutherford {
    constructor(game, x, y, pet) {
        Object.assign(this, { game, x, y, pet});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/rutherford-main.png");

        this.shadow = ASSET_MANAGER.getAsset("./sprites/shadow.png");

        this.scale = 2;

        this.damage = 15;

        this.action = 0; // 0 = idle, 1 = run, 2 = attack, 3 = transform

        this.form = 0;

        this.coins = 0;

        this.face = 0; // 0 = right, 1 = left

        this.speed = 6;

        this.attackcd = 200; // in ms
        
        this.lastAttack = Date.now();

        this.hasapet = false; //If we buy a pet, make this true

        this.speedtemp = this.speed; //Used to reset back speed when we block it.

        this.hpregen = 0.2;

        this.mpregen = 0.05;

        this.ascendedmana = 0.001; //How much is deducted per tick.

        this.shinecd = Date.now(); //Shining particle effect cooldown when in Ascended form.

        this.hero = true; //Used for checks.

        this.slideasc = 15; // Mana cost of Ascended slide.

        this.slidenor = 35; //Mana cost of Normal slide.

        this.speedbump = false;

        this.luckytick = false; //Used to check if we got the timing right on Base rutherford's special.

        this.luckyticktimer = 0;

        this.redbeamcost = 200;
        
        this.bluebeamcost = 130;

        this.allow = true; // simply for blocking any button inputs when an event is occuring.

        this.velocity = { x : 0, y : 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 16, 24);

        this.hp = new HealthMpBar(this.game, this.bound.x, this.bound.y, 22 * this.scale, 3000, 400, true); //Has mana field too.

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 8; i++) { // 4 states as of now.
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // two directions
                this.animations[i].push([]);
                for (var k = 0; k < 2; k++) { // 2 forms. i.e. Rutherford, Ascended Rutherford.
                    this.animations[i][j].push([]);
                }
            }
        }

        //The 3rd dimension refers to whether you're in Ascended form or not.
        // idle
        
        this.animations[0][0][0] = new Animator(this.spritesheet, 0, 0, 50, 37, 4, 0.225, 0, false, true);
        this.animations[0][1][0] = new Animator(this.spritesheet, 570, 0, 50, 37, 4, 0.225, 0, true, true);
        this.animations[0][0][1] = new Animator(this.spritesheet, 0, 592, 50, 37, 4, 0.225, 0, false, true);
        this.animations[0][1][1] = new Animator(this.spritesheet, 570, 592, 50, 37, 4, 0.225, 0, true, true);
        
        // run
        this.animations[1][0][0] = new Animator(this.spritesheet, 50, 37, 50, 37, 6, 0.125, 0, false, true);
        this.animations[1][1][0] = new Animator(this.spritesheet, 420, 37, 50, 37, 6, 0.125, 0, true, true);
        this.animations[1][0][1] = new Animator(this.spritesheet, 50, 629, 50, 37, 6, 0.125, 0, false, true);
        this.animations[1][1][1] = new Animator(this.spritesheet, 420, 629, 50, 37, 6, 0.125, 0, true, true);

        // attack
        this.animations[2][0][0] = new Animator(this.spritesheet, 0, 222, 50, 37, 7, 0.05, 0, false, false);
        this.animations[2][1][0] = new Animator(this.spritesheet, 420, 222, 50, 37, 7, 0.05, 0, true, false);
        this.animations[2][0][1] = new Animator(this.spritesheet, 0, 814, 50, 37, 7, 0.05, 0, false, false);
        this.animations[2][1][1] = new Animator(this.spritesheet, 420, 814, 50, 37, 7, 0.05, 0, true, false);

        //transform
        this.animations[3][0][0] = new Animator(this.spritesheet, 100, 444, 50, 37, 5, 0.1, 0, false, false);
        this.animations[3][1][0] = new Animator(this.spritesheet, 420, 444, 50, 37, 5, 0.1, 0, true, false);
        this.animations[3][0][1] = new Animator(this.spritesheet, 100, 1036, 50, 37, 5, 0.1, 0, false, false);
        this.animations[3][1][1] = new Animator(this.spritesheet, 420, 1036, 50, 37, 5, 0.1, 0, true, false);

        //slide
        this.animations[4][0][0] = new Animator(this.spritesheet, 150, 111, 50, 37, 4, 0.15, 0, false, false);
        this.animations[4][1][0] = new Animator(this.spritesheet, 420, 111, 50, 37, 4, 0.15, 0, false, false);
        this.animations[4][0][1] = new Animator(this.spritesheet, 150, 703, 50, 37, 4, 0.15, 0, false, false);
        this.animations[4][1][1] = new Animator(this.spritesheet, 420, 703, 50, 37, 4, 0.15, 0, false, false);

        //Special
        this.animations[5][0][0] = new Animator(this.spritesheet, 0, 518, 50, 37, 7, 0.15, 0, false, false);
        this.animations[5][1][0] = new Animator(this.spritesheet, 420, 518, 50, 37, 7, 0.15, 0, true, false);
        this.animations[5][0][1] = new Animator(this.spritesheet, 0, 1110, 50, 37, 7, 0.15, 0, false, false);
        this.animations[5][1][1] = new Animator(this.spritesheet, 420, 1110, 50, 37, 7, 0.15, 0, true, false);

        //RunAttack
        this.animations[6][0][0] = new Animator(this.spritesheet, 0, 518, 50, 37, 5, 0.05, 0, false, false);
        this.animations[6][1][0] = new Animator(this.spritesheet, 520, 518, 50, 37, 5, 0.05, 0, true, false);
        this.animations[6][0][1] = new Animator(this.spritesheet, 0, 1110, 50, 37, 5, 0.05, 0, false, false);
        this.animations[6][1][1] = new Animator(this.spritesheet, 520, 1110, 50, 37, 5, 0.05, 0, true, false);

        //Death
        this.animations[7][0][0] = new Animator(this.spritesheet, 0, 333, 50, 37, 6, 0.5, 0, false, false);
        this.animations[7][1][0] = new Animator(this.spritesheet, 470, 333, 50, 37, 6, 0.5, 0, true, false);
        this.animations[7][0][1] = new Animator(this.spritesheet, 0, 925, 50, 37, 6, 0.5, 0, false, false);
        this.animations[7][1][1] = new Animator(this.spritesheet, 470, 925, 50, 37, 6, 0.5, 0, true, false);
    }

    update() {
        if(this.hasapet) {
            this.game.addEntity(new DineO(this.game, this.x-20, this.y));
            this.hasapet = false;
            this.pet = true;
        }
        // check death
        if (this.action !== 7 && this.hp.current <= 0) {
            this.action = 7;
            this.game.camera.gameover = true;
            ASSET_MANAGER.pauseBackgroundMusic();
        } 

        // slowly closing the screen when he dies
        if (this.action === 7) {
            var frame = this.animations[this.action][this.face][this.form].currentFrame();

            if (frame === 2) {
                ASSET_MANAGER.playAsset("./sounds/sfx/body-fall.mp3");
            }
            
            var radius = 5;
            // calculate rutherford's current coordinates
            var cx = (this.bound.x - this.bound.w/2) / 64;
            var cy = (this.bound.y - this.bound.h/2) / 64;
            
            this.game.background.forEach(e => {
                if (Math.abs(cx - e.x/64) > radius - frame || Math.abs(cy - e.y/64) > radius - frame) {
                    e.removeFromWorld = true;
                }
            });

            this.game.entities.forEach(e => {
                if (e !== this && (Math.abs(cx - e.x/64) > radius - frame || Math.abs(cy - e.y/64) > radius - frame)) {
                    e.removeFromWorld = true;
                }
            });
        }

        // when death animation finished
        if (this.action === 7 && this.animations[this.action][this.face][this.form].isAlmostDone(this.game.clockTick)) {
            if (this.game.camera.level === 1)
                this.game.camera.loadLevel1();
            else if (this.game.camera.level === 2) {
                this.game.camera.loadLevel2();
            } else if (this.game.camera.level === 3) {
                this.game.camera.loadLevel3();
            }

        } 

        // while not dead
        if (this.action !== 7) {

            //shine effect
            if(this.form == 1) {
                if(Date.now() - this.shinecd > 500) {
                    this.createshine();
                    this.shinecd = Date.now();
                }
            }
            
            //If we got the lucky tick, create a beam.
            if(this.luckytick) {
                if(Date.now() - this.luckyticktimer > 600) {
                    this.createanotherbbeam();
                    this.luckytick = false;
                }
            }

            // movement
            /**
             * Are we performing an action where we should block user's interruption i.e. special, slide?.
             */
            if(this.allow) { 
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

                //If the user wants to go ascended.
                if(g.gkey) {
                    this.action = 3;
                    //block further input
                    this.allow = false;
                //If the user wants to slide.
                } else if(g.spacekey) { 
                    //Are we idle or moving? 
                    if(this.velocity.x != 0 || this.velocity.y != 0) {
                        //If we're moving AND we have enough mana for that form's cost then block input and set action state.
                        if(this.form == 1 && this.hp.currMana >= this.slideasc || this.form == 0 && this.hp.currMana >= this.slidenor) {
                            this.action = 4;
                            this.allow = false;
                        }
                    }
                //Does the user want to use special?
                } else if(g.ekey) {
                    //Are we idle?
                    if(this.velocity.x == 0 && this.velocity.y == 0) { 
                        //If we have enough mana then set action state and block further input.
                        if(this.form == 1 && this.hp.currMana >= this.redbeamcost || this.form == 0 && this.hp.currMana >= this.bluebeamcost) {
                            this.action = 5;
                            this.allow = false;
                        }
                    }
                }
            }

            if(this.action == 3) {         //Did the user press G? If yes, transform and do the animation.
                this.speed = 0;
                
                ASSET_MANAGER.playAsset("./sounds/sfx/Ascend.mp3");
                

                //If our animation is done, transform and start allowing input again. Default back to action state 0.
                if(this.animations[this.action][this.face][this.form].isDone(this.game.clockTick)) {
                    this.transform();
                    this.action = 0;
                    this.allow = true;
                    this.speed = this.speedtemp;
                }
            //If the user has pressed Q with all the prerequisites completed, then slide.
            } else if (this.action == 4) {
                //Increase our speed, Only ONCE
                if(!this.speedbump) {
                    this.speed = this.speed * 2;
                    this.speedbump = true;
                    let manadeduction = this.form == 1? this.slideasc : this.slidenor;
                    this.hp.currMana -= manadeduction;
                    ASSET_MANAGER.playAsset("./sounds/sfx/slide.mp3");
                }
                //After performing the slide, default back to normal state and values.
                if(this.animations[this.action][this.face][this.form].isDone(this.game.clockTick)) {
                    this.animations[this.action][this.face][this.form].elapsedTime = 0;
                    this.action = 0;
                    this.speed = this.speed / 2;
                    this.speedbump = false;
                    this.allow = true;
                }
            //If we wanna use our special.
            } else if(this.action == 5) {
                if(this.animations[this.action][this.face][this.form].isAlmostDone(this.game.clockTick)) {
                    ASSET_MANAGER.playAsset("./sounds/sfx/slam.mp3");
            
                }
                if(this.animations[this.action][this.face][this.form].isDone(this.game.clockTick)) {
                    this.animations[this.action][this.face][this.form].elapsedTime = 0; // take animation back to starting point
                    this.action = 0;
                    if(this.form == 1) {
                        this.createRbeam();
                        this.hp.currMana -= this.redbeamcost;
                    } else {
                        this.createbbeam();
                        this.hp.currMana -= this.bluebeamcost;
                    }
                    if(this.hp.currMana < 0) {
                        this.hp.currMana = 0;
                    }
                    this.allow = true;
                }           
            } else if(this.action == 6) {
                if(this.animations[this.action][this.face][this.form].isAlmostDone(this.game.clockTick)) {
                    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                        this.action = 1;
                    } else {
                        this.action = 0;
                    }
                }
            } else {
                if(this.action !== 2 || this.animations[this.action][this.face][this.form].isAlmostDone(this.game.clockTick)) {
                    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                        this.action = 1;
                    } else {
                        this.action = 0;
                    }
                }
            }

            if (this.velocity.x > 0 && this.action !== 2 && this.action !== 6)
                this.face = 0;
            if (this.velocity.x < 0 && this.action !== 2 && this.action !== 6)
                this.face = 1;

            this.hp.current += this.hpregen;
            this.hp.currMana += this.mpregen;
            if (this.hp.current > this.hp.maxHealth) {
                this.hp.current = this.hp.maxHealth;
            }

            if (this.hp.currMana > this.hp.maxMana) {
                this.hp.currMana = this.hp.maxMana;
            }

            if (this.hp.current < 0) {
                this.hp.current = 0;
            }

            //If we are Ascended, subtract mana each tick.
            if (this.form == 1) {
                this.hp.currMana -= this.hp.maxMana * this.ascendedmana;
                if(this.hp.currMana < 0) {
                    this.hp.currMana = 0;
                    this.action = 3;
                }
            }
            // update position
            this.x += this.velocity.x * this.speed;
            this.y += this.velocity.y * this.speed;
            this.updateBound();
            this.checkCollision();

            // attack if available
            if (this.game.leftclick || this.game.ikey) {
                this.attack();
            }
        };
    }

    draw(ctx) {
        // for running shadow
        var offset = 0;
        if (this.action === 1 && this.face === 0) {
            offset += 5;
        } else if (this.action === 1 && this.face === 1) {
            offset -= 5;
        }
        
        //draw the shadow
        ctx.globalAlpha = 0.6; // change opacity
        ctx.drawImage(this.shadow, 0, 0, 64, 32, this.x - this.game.camera.x + 11 + offset, this.y - this.game.camera.y + 38, 28, 14);
        ctx.globalAlpha = 1;
        
        //Draw hero
        this.animations[this.action][this.face][this.form].drawFrame(this.game.clockTick, ctx, this.x - 25 - this.game.camera.x, this.y - 25 - this.game.camera.y, this.scale);
        
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
    }

    updateBound() {
        this.bound.update(this.x + 16, this.y + 12);

        this.hp.x = this.bound.x + -13;
        this.hp.y = this.bound.y + 46;
    }

    //Transforms Rutherford into Ascended Rutherford.
    transform() {
        var whatform = this.form == 0? 1: 0;
        this.form = whatform;
        this.game.addEntity(new Thunder(this.game, this.x-25, this.y-230));
        this.createshine();
        this.animations[this.action][this.face][this.form].elapsedTime = 0;
    }

    //Creates the shine particle effect around Rutherford.
    createshine() {
        this.game.addEntity(new Shine(this.game, this.x, this.y));
        this.game.addEntity(new Shine(this.game, this.x-40, this.y-60));
        this.game.addEntity(new Shine(this.game, this.x-45, this.y));
    }

    createRbeam() {
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Redbeam(this.game, this.x+50*i, this.y - 220));
            this.game.addEntity(new Redbeam(this.game, this.x-50-(50*i), this.y - 220));
        }

        //UpperLower
        for(let i = 1; i < 6; i++) {
            this.game.addEntity(new Redbeam(this.game, this.x - 10, this.y - 470 + 50*i));
            this.game.addEntity(new Redbeam(this.game, this.x - 10, this.y - 170 + 50*i));
        }

        //X Shape
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Redbeam(this.game, this.x+25*i, this.y - 220+(25*i)));
            this.game.addEntity(new Redbeam(this.game, this.x-25-(25*i), this.y - 220-(25*i)));
        }

        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Redbeam(this.game, this.x + 25*i, this.y - 220 - 25*i));
            this.game.addEntity(new Redbeam(this.game, this.x - 10 -25*i, this.y - 220 + 25*i));
        }
    }

    createbbeam() {
        //Sideways
        this.luckyticktimer = Date.now();
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Bluebeam(this.game, this.x+25*i, this.y - 220));
            this.game.addEntity(new Bluebeam(this.game, this.x-25-(25*i), this.y - 220));
        }

        //UpperLower
        for(let i = 1; i < 4; i++) {
            this.game.addEntity(new Bluebeam(this.game, this.x - 10, this.y - 470 + 50*i));
            this.game.addEntity(new Bluebeam(this.game, this.x - 10, this.y - 170 + 50*i));
        }

        if(this.game.ekey) {
            this.luckytick = true;
            this.game.ekey = false; //If we get the lucky tick, don't trigger the move again.
        }
    }

    createanotherbbeam() {
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Bluebeam(this.game, this.x+25*i, this.y - 220+(25*i)));
            this.game.addEntity(new Bluebeam(this.game, this.x-25-(25*i), this.y - 220-(25*i)));
        }

        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new Bluebeam(this.game, this.x + 25*i, this.y - 220 - 25*i));
            this.game.addEntity(new Bluebeam(this.game, this.x - 10 -25*i, this.y - 220 + 25*i));
        }
    }


    attack() {
        if (this.action !== 7 && this.allow && Date.now() - this.lastAttack > this.attackcd) {
            if(this.velocity.x != 0 || this.velocity.y != 0) {
                this.action = 6;
            } else {
                this.action = 2;
            }

            if (this.game.mouse.x - this.x  + this.game.camera.x - 25 < 0)
                this.face = 1;
            else 
                this.face = 0;

            var velocity = this.calculateVel(this.game.mouse);
            //In case we are ascended, we want to know fire projectile's coordinates.
            var f = this.form === 0; // condition if form is default, change this to an int if we have more than 2 form
            var pp = {sx: 96, sy: 336, size: 16};
            var p;

            if (PARAMS.meme) {
                pp = {sx: 0, sy: 0, size: 16, spritesheet: ASSET_MANAGER.getAsset("./sprites/p.png")};
                p =  new Projectiles(this.game, true, this.x, this.y, velocity, 4, 
                    1200, this.damage + randomInt(10) + (f ? 0 : Math.floor(this.damage*0.4)), pp, f ? "star" : "burn");;
            } else {
                p = new Projectiles(this.game, true, this.x, this.y, velocity, 7, 
                    1200, this.damage + randomInt(10) + (f ? 0 : Math.floor(this.damage*0.4)), f ? undefined : pp, f ? "star" : "burn");
            }
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
            
            this.animations[this.action][this.face][this.form].elapsedTime = 0;
            this.lastAttack = Date.now();
        }
    }

    checkCollision() {
        this.game.entities.forEach(e => {
            if (e instanceof Projectiles && this.bound.collide(e.bound) && !e.friendly) {
                //If ascended take 80% of the intended damage.
                if(this.form == 1) {
                    e.hit(this);
                    this.hp.current += e.damage * 0.2;
                } else {
                    e.hit(this);
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
                    this.updateBound();
                }
            } else if(e instanceof Onecoin && this.bound.collide(e.bound)) {
                this.coins += 1;
                ASSET_MANAGER.playAsset("./sounds/sfx/coin.mp3");
                e.removeFromWorld = true;
            } else if(e instanceof Threecoin && this.bound.collide(e.bound)) {
                this.coins += 3;
                ASSET_MANAGER.playAsset("./sounds/sfx/coin.mp3");
                e.removeFromWorld = true;
            }
        });
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