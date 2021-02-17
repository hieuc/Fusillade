class Rutherford {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/rutherford-main.png");

        this.scale = 2;

        this.action = 0; // 0 = idle, 1 = run, 2 = attack, 3 = transform

        this.form = 0;

        this.face = 0; // 0 = right, 1 = left

        this.speed = 10;

        this.speedtemp = this.speed; //Used to reset back speed when we block it.

        this.regen = 0.01;

        this.ascendedmana = 0.0005; //How much is deducted per tick.

        this.shinecd = Date.now(); //Shining particle effect cooldown when in Ascended form.

        this.hero = true;

        this.slideasc = 15; // Mana cost of Ascended slide.

        this.slidenor = 35; //Mana cost of Normal slide.

        this.speedbump = false;

        this.luckytick = false; //Combo on Base Rutherford Special.

        this.luckyticktimer = 0;

        this.playaudio = 0;

        this.redbeamcost = 200;
        
        this.bluebeamcost = 130;

        this.allow = true; // simply for blocking any button inputs when an event is occuring.

        this.velocity = { x : 0, y : 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 16, 24);

        this.hp = new HealthMpBar(this.game, this.bound.x, this.bound.y, 20 * this.scale, 500, true); //Has mana field too.

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 6; i++) { // 4 states as of now.
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
        
        this.animations[0][0][0] = new Animator(this.spritesheet, 0, 0, 50, 37, 4, 0.2, 0, false, true);
        this.animations[0][1][0] = new Animator(this.spritesheet, 570, 0, 50, 37, 4, 0.2, 0, true, true);
        this.animations[0][0][1] = new Animator(this.spritesheet, 0, 592, 50, 37, 4, 0.2, 0, false, true);
        this.animations[0][1][1] = new Animator(this.spritesheet, 570, 592, 50, 37, 4, 0.2, 0, true, true);
        
        // run
        this.animations[1][0][0] = new Animator(this.spritesheet, 50, 37, 50, 37, 6, 0.1, 0, false, true);
        this.animations[1][1][0] = new Animator(this.spritesheet, 420, 37, 50, 37, 6, 0.1, 0, true, true);
        this.animations[1][0][1] = new Animator(this.spritesheet, 50, 629, 50, 37, 6, 0.1, 0, false, true);
        this.animations[1][1][1] = new Animator(this.spritesheet, 420, 629, 50, 37, 6, 0.1, 0, true, true);

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
    }

    update() {

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

            if(g.gkey) {
                this.action = 3;
                this.allow = false;
            } else if(g.qkey) { 
                if(this.velocity.x != 0 || this.velocity.y != 0) {
                    if(this.form == 1 && this.hp.currMana >= this.slideasc || this.form == 0 && this.hp.currMana >= this.slidenor) {
                        this.action = 4;
                        this.allow = false;
                    }
                }
            } else if(g.ekey) {
                if(this.velocity.x == 0 && this.velocity.y == 0) { 
                    if(this.form == 1 && this.hp.currMana >= this.redbeamcost || this.form == 0 && this.hp.currMana >= this.bluebeamcost) {
                        this.action = 5;
                        this.allow = false;
                    }
                }
            }
        }

        //Did the user press G? If yes, transform and do the animation.
        if(this.action == 3) {
            this.speed = 0;
            if(this.playaudio == 0) {
                var audio = new Audio("./sounds/Ascend.mp3");
                audio.volume = 0.3;
                audio.play();
                this.playaudio = 1;
            }
            if(this.animations[this.action][this.face][this.form].isDone(this.game.clockTick)) {
                this.transform();
                this.action = 0;
                this.allow = true;
                this.speed = this.speedtemp;
                this.playaudio = 0;
            }
        } else if (this.action == 4) {
            if(!this.speedbump) {
                this.speed = this.speed * 2;
                this.speedbump = true;
                let manadeduction = this.form == 1? this.slideasc : this.slidenor;
                this.hp.currMana -= manadeduction;
            }
            if(this.animations[this.action][this.face][this.form].isDone(this.game.clockTick)) {
                this.animations[this.action][this.face][this.form].elapsedTime = 0;
                this.action = 0;
                this.speed = this.speed / 2;
                this.speedbump = false;
                this.allow = true;
            }   
        } else if(this.action == 5) {
            if(this.animations[this.action][this.face][this.form].isAlmostDone(this.game.clockTick)) {
                if(this.playaudio == 0) {
                    var audio = new Audio("./sounds/slam.mp3");
                    audio.volume = 0.1;
                    audio.play();
                    this.playaudio = 1;
                }
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
                this.playaudio = 0;
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

        if (this.velocity.x > 0 && this.action !== 2)
            this.face = 0;
        if (this.velocity.x < 0 && this.action !== 2)
            this.face = 1;

        this.hp.current += this.regen;
        this.hp.currMana += this.regen;
        if (this.hp.current > this.hp.max) {
            this.hp.current = this.hp.max;
        }

        if (this.hp.currMana > this.hp.max) {
            this.hp.currMana = this.hp.max;
        }

        if (this.hp.current < 0) {
            this.hp.current = 0;
        }

        //If we are Ascended, subtract mana each tick.
        if (this.form == 1) {
            this.hp.currMana -= this.hp.max * this.ascendedmana;
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
    }

    draw(ctx) {
        this.animations[this.action][this.face][this.form].drawFrame(this.game.clockTick, ctx, this.x - 25 - this.game.camera.x, this.y - 25 - this.game.camera.y, this.scale);
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
    }

    updateBound() {
        this.bound.update(this.x + 16, this.y + 8);

        this.hp.x = this.bound.x - 12;
        this.hp.y = this.bound.y + 25 * this.scale;;
    }

    //Transforms Rutherford into Ascended Rutherford.
    transform() {
        var whatform = this.form == 0? 1: 0;
        this.form = whatform;
        this.game.addEntity(new thunder(this.game, this.x-25, this.y-230));
        this.createshine();
        this.animations[this.action][this.face][this.form].elapsedTime = 0;
    }

    //Creates the shine particle effect around Rutherford.
    createshine() {
        this.game.addEntity(new shine(this.game, this.x, this.y));
        this.game.addEntity(new shine(this.game, this.x-40, this.y-60));
        this.game.addEntity(new shine(this.game, this.x-45, this.y));
    }

    createRbeam() {
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new redbeam(this.game, this.x+50*i, this.y - 220));
            this.game.addEntity(new redbeam(this.game, this.x-50-(50*i), this.y - 220));
        }

        //UpperLower
        for(let i = 1; i < 6; i++) {
            this.game.addEntity(new redbeam(this.game, this.x - 10, this.y - 470 + 50*i));
            this.game.addEntity(new redbeam(this.game, this.x - 10, this.y - 170 + 50*i));
        }

        //X Shape
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new redbeam(this.game, this.x+25*i, this.y - 220+(25*i)));
            this.game.addEntity(new redbeam(this.game, this.x-25-(25*i), this.y - 220-(25*i)));
        }

        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new redbeam(this.game, this.x + 25*i, this.y - 220 - 25*i));
            this.game.addEntity(new redbeam(this.game, this.x - 10 -25*i, this.y - 220 + 25*i));
        }
    }

    createbbeam() {
        //Sideways
        this.luckyticktimer = Date.now();
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new bluebeam(this.game, this.x+25*i, this.y - 220));
            this.game.addEntity(new bluebeam(this.game, this.x-25-(25*i), this.y - 220));
        }

        //UpperLower
        for(let i = 1; i < 4; i++) {
            this.game.addEntity(new bluebeam(this.game, this.x - 10, this.y - 470 + 50*i));
            this.game.addEntity(new bluebeam(this.game, this.x - 10, this.y - 170 + 50*i));
        }

        if(this.game.ekey) {
            this.luckytick = true;
            this.game.ekey = false; //If we get the lucky tick, don't trigger the move again.
        }
    }

    createanotherbbeam() {
        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new bluebeam(this.game, this.x+25*i, this.y - 220+(25*i)));
            this.game.addEntity(new bluebeam(this.game, this.x-25-(25*i), this.y - 220-(25*i)));
        }

        for(let i = 1; i < 8; i++) {
            this.game.addEntity(new bluebeam(this.game, this.x + 25*i, this.y - 220 - 25*i));
            this.game.addEntity(new bluebeam(this.game, this.x - 10 -25*i, this.y - 220 + 25*i));
        }
    }


    startAttack(click) {
        this.action = 2;
        if (click.x - this.x  + this.game.camera.x - 25 < 0)
            this.face = 1;
        else 
            this.face = 0;
        var velocity = this.calculateVel(click);
        //In case we are ascended, we want to know fire projectile's coordinates.
        var pp = {sx: 96, sy: 336, size: 16};
        var p = this.form == 0? new Projectiles(this.game, true, this.x, this.y, velocity, 5, 1200, 10 + randomInt(10)) : new Projectiles(this.game, true, this.x, this.y, velocity, 5, 1200, 15 + randomInt(10), pp)
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
        
        this.animations[this.action][this.face][this.form].elapsedTime = 0;
    }

    checkCollision() {
        this.game.entities.forEach(e => {
            if (e instanceof Projectiles && this.bound.collide(e.bound) && !e.friendly) {
                //If ascended take 80% of the intended damage.
                if(this.form == 1) {
                    this.hp.current -= e.damage * 0.8;
                } else {
                    this.hp.current -= e.damage;
                }
                e.removeFromWorld = true;
                this.game.addEntity(new Score(this.game, this.bound.x + this.bound.w, this.bound.y, e.damage));
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