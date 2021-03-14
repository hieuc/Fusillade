class Buck extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Buck.png");

        this.ss = 96;

        this.projspeed = 5; //Buck's projectiles speed.

        this.damage = 30;
        
        this.removeFromWorld = false;

        this.scale = 2.1; //Buck's size.

        this.state = 0; //0 = idle, 1 = move, 2 = attack SLASH, 3 = Summon, LATER(4 = Fury Attack, 5 = die)

        this.face = 1; // 0 = right, 1 = left

        this.speed = 1.8;

        this.triggered = false; //Are you aggro-d/triggered?

        this.summoned = false; //Has buck used his summon move? If not keep counting timer.

        this.summontime = Date.now(); //Used for keeping track of how long ago we used Summon.
        
        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 200; //in milliseconds.

        this.summoncooldown = 21000; //Cooldown for the summon attack.

        this.createone = Date.now(); //create one enemy

        this.createonecd = 18000; //Create an Ais enemy cooldown.

        this.whichattack = Math.random(); //Deciding attack among 3 possibilites.

        this.patterntimer = Date.now(); //To keep track of how long we've been running a pattern.

        this.patternduration = 6000; // 6 seconds.

        this.healcd = 1200; //After how many milliseconds we get a "tick" of heal on Buck.

        this.healtimer = Date.now(); //Used for calculating if we should heal "tick"

        this.bound = new BoundingBox(this.game, this.x, this.y, 50, 86);

        this.hp = new HealthMpBar(this.game, this.x + 16 * this.scale, this.y + 44 * this.scale, 32 * this.scale, 1800, 0);

        this.portal = true; //Should we create a Buckportal for Buck's special. False if it's already created.

        this.myportal; //Later becomes BuckPortal when created.

        this.blitz = 0; //Buck's semi-circular attack angle calculator.

        this.enemypos = { enemyX: this.game.camera.char.x, enemyY: this.game.camera.char.y};

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 7; i++) { // 5 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 96, 96, 5, 0.25, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 0, 960, 96, 96, 5, 0.25, 0, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 0, 96, 96, 96, 8, 0.1, 0, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 0, 1056, 96, 96, 8, 0.1, 0, false, true);

        //attack SLASH animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 0, 288, 96, 96, 9, 0.05, 0, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 0, 1248, 96, 96, 9, 0.05, 0, false, true);

        //Summon animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 0, 480, 96, 96, 6, 0.1, 0, false, true);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 0, 1440, 96, 96, 6, 0.1, 0, false, true);

        //Spin animation for state = 4
        //facing right = 0
        this.animations[4][0] = new Animator(this.spritesheet, 0, 576, 96, 96, 9, 0.075, 0, false, true);

        //facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 0, 1536, 96, 96, 9, 0.075, 0, false, true);


        //Death animation for state = 5
        //facing right
        this.animations[5][0] = new Animator(this.spritesheet, 0, 864, 96, 96, 6, 0.15, 0, false, false);

        //facing left = 1
        this.animations[5][1] = new Animator(this.spritesheet, 0, 1824, 96, 96, 6, 0.15, 0, false, false);

        //Healing animation for state = 6
        //facing right
        this.animations[6][0] = new Animator(this.spritesheet, 0, 384, 96, 96, 5, 0.15, 0, false, true);

        //facing left = 1
        this.animations[6][1] = new Animator(this.spritesheet, 0, 1344, 96, 96, 5, 0.15, 0, false, true);

    }

    /**
     * Updates our Buck. In our case, we don't trigger unless we're in a certain rage. Once in that range, buck starts
     * counting time for his summon attack and decides from among 3 differnet patterns, rage attack, walking around, 
     * scaling attacks. His summon attack takes priority, so if its time to summon, he'll stop his other attack and start
     * summoning. The probability of choosing any one of the 3 different patterns is same as we are using true random
     * i.e. Math random class.
     */
    update() { 
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        if(this.state == 5) {
            if(this.animations[this.state][this.face].isDone()) {
               for(let i = 0; i < this.game.entities.length; i++) {
                   if(this.game.entities[i] instanceof Buckportal) {
                       this.game.entities[i].removeFromWorld = true;
                   }
               } 
               this.removeFromWorld = true;
               this.game.addEntity(new BunchofCoins(this.game, this.bound.x, this.bound.y, 20));
            }
       } else {
            if(Date.now() - this.createone > this.createonecd) {
                this.game.addEntity(new Propportal(this.game, this.x * Math.random(), this.y *Math.random(), "Ais"));
                this.createone = Date.now();
            }

            //First check if player triggered the enemy.
            if((Math.abs(this.x - this.enemyX) < 900 && Math.abs(this.y - this.enemyY) < 900) && !this.triggered) {
                this.triggered = true;
                this.summontime = Date.now();
            }

            if(this.triggered) {
                //Is it time to summon enemies?
                var summon = Date.now() - this.summontime;
                //If it is time to summon, channel.
                if(summon > this.summoncooldown) {
                    this.decideDir();
                    this.state = 3;
                    //After 5 seconds of channel, summon fayeres.
                    if(summon > this.summoncooldown+1500 && !this.summoned) {
                        this.bringSummons(); 
                        this.summoned = true;
                    }
                    //After 10 seconds of channel, do an attack yourself as well.
                    if(summon >= this.summoncooldown+4500 && summon < this.summoncooldown+6800) {
                        if(this.portal) {
                            this.myportal = new Buckportal(this.game, this.x-300, this.y - 50, this.hp.current, this.hp.maxHealth, 0, 0, 350, 100);
                            this.game.addEntity(this.myportal);
                            this.portal = false;
                        }
                        this.state = 2;
                        this.face = 1;
                        if(Date.now() - this.attackbuffer >= this.fireRate) {
                            this.attackportal();
                            this.attackbuffer = Date.now();
                        }
                    } 

                    if(summon > this.summoncooldown+6800) {
                        this.summontime = Date.now();
                        this.summoned = false;
                        this.portal = true;
                    }
                } else {
                    var timer = Date.now() - this.patterntimer;
                    if(timer < this.patternduration) {
                        this.decideDir();
                        if(this.whichattack >= 0 && this.whichattack < 0.5) { 
                            var timepassed = Date.now() - this.attackbuffer;
                            if(timepassed > this.fireRate) {
                                this.state = 2;
                                this.attack();
                                this.attackbuffer = Date.now();
                            }
                        } else if(this.whichattack >= 0.5 && this.whichattack < 0.6) {
                            this.state = 6;
                            if(Date.now() - this.healtimer > this.healcd) {
                                this.heal();
                                this.healtimer = Date.now();
                            }
                        } else {
                            var timepassed = Date.now() - this.attackbuffer;
                            if(timepassed > this.fireRate+300) {
                                this.state = 4;
                                this.rageAttack();
                                this.attackbuffer = Date.now();
                            }
                        }
                    } else {
                        this.state = 0;
                        this.patterntimer = Date.now();
                        this.whichattack = Math.random();
                    }
                }
            } 
        }

        this.updateBound();

        //Collision detection and damage type detection.
        if(this.state !== 5) {
            this.checkCollisions();
        }
    }

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (this.hp) {
            this.hp.draw();
        }
        
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    checkCollisions() {
        var rutherform = 0;
        var that = this;
        this.game.entities.forEach(function (entity) {
            if(entity instanceof Rutherford) {
                rutherform = entity.form;
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
                    that.state = 5;
                }
            }
        })
    }

    updateBound() {
        this.bound.update(this.x + 75, this.y + 48);

        this.hp.x = this.bound.x - 4 * this.scale;
        this.hp.y = this.bound.y + 43 * this.scale;
    }

    calculateVel() {
        //Buck's sprite is BIG. We wanna make sure we fire correctly aestheically but also have correct
        //angle calculation in case we switch our projectile's location.
        let offset = this.face == 0? 100 : 0;
        var dx = this.enemyX - this.x - offset;
        var dy = this.enemyY - this.y;
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};
        
        if (dx < 0)
            v.x *= -1;

        if ((angle > 0 && dy < 0) || (angle < 0 && dy > 0))
            v.y *= -1;
        
        return v;
    }

    
    /**
     * This is the rage attack for buck. Partitions define how many attacks he'll launch in the 180 degree angle.
     */
    rageAttack() {
        var partitions = 10;
        for(var i = 0; i < partitions; i++) {
            var pp = {sx: 96, sy: 112, size: 16}; // position of projectile in default sprite sheet
            var p = new ScaleBoomerProjectiles(this.game, false, this.x+80, this.y+80, {x :Math.cos(this.blitz), y:Math.sin(this.blitz)}, 
                        this.projspeed, 5500, this.damage, 0.012, true, pp, "buckhit"); // projectile that is actually produced
            this.blitz += Math.PI/partitions;
            this.game.entities.splice(this.game.entities.length - 1, 0, p);        
        }
        this.blitz += 50; //Keep changing starting angle
    }

    /**
     * Normal attack of buck where he attacks exactly where you are standing.
     */
    attack() {
        var velocity = this.calculateVel();
        var offset = this.face == 0? 100: 0;
        var pp = {sx: 96, sy: 112, size: 16};
        var p = new ScaleBoomerProjectiles(this.game, false, this.x+offset, this.y, velocity, this.projspeed, 2500, this.damage, 0.005, false, pp, "buckhit");
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    attackportal() {
        var pp = {sx: 96, sy: 112, size: 16};
        var p = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(Math.PI), y:Math.sin(Math.PI)}, 4, 2000, this.damage, pp, "buckhit");
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    bringSummons() {
        //this.game.addEntity(new Fayere(this.game, this.enemyX - 150, this.enemyY));
        this.game.addEntity(new Propportal(this.game, this.x - 96, this.y, "Fayere"));
        this.game.addEntity(new Propportal(this.game, this.x + 180, this.y, "Fayere"));
        this.game.addEntity(new Propportal(this.game, this.x + 44, this.y + 140, "Fayere"));
        this.game.addEntity(new Propportal(this.game, this.x + 44, this.y - 140, "Fayere"));
    }

    decideDir() {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    heal() {
        if(this.hp.current < this.hp.max) { 
            var theHeal = this.hp.max * 0.05;
            if(this.hp.current + theHeal > this.hp.max) {
                theHeal = this.hp.max - this.hp.current;
            }

            this.hp.current += theHeal;
        } 
    }

    /* 

    DEPRECATED CODE. Might need so don't delete.

    walkaround(rand1, rand2, rand3, rand4) {
        this.howlong = Date.now() - this.walkaroundtimer;
        if(this.howlong < 2400) {
            this.face = 0;
            this.x += rand1 * (this.speed+1.5);
            this.state = 1;
        } else if (this.howlong >= 2400 && this.howlong < 3400) {
            this.state = 1;
            this.face = 1;
            this.x -= rand3 * (this.speed+1.5);
            var updown = this.y - this.enemyY < 0? 1: -1;
            this.y += rand3 * (this.speed) * updown;
        } else if(this.howlong >= 3400 && this.howlong < 5800) {
            this.state = 1;
            this.face = 1;
            this.x += -rand2 * (this.speed+1.5);
        } else {
            this.walkaroundtimer = Date.now();
        }
    }
    
    //Testing code.

     var time = Date.now() - this.patterntimer;
        if(time < 2500) {
            this.state = 0;
            this.face = 0;
        } else if(time >= 2500 && time < 5000) {
            this.state = 0;
            this.face = 1;
        } else if(time >= 5000 && time < 7500) {
            this.state = 1;
            this.face = 0;
        } else if(time >= 7500 && time < 10000) {
            this.state = 1;
            this.face = 1;
        } else if(time >= 10000 && time < 12500) {
            this.state = 2;
            this.face = 0;
        } else if(time >=12500 && time < 15000) {
            this.state =2;
            this.face = 1;
        } else if(time >= 15000 && time < 17500) {
            this.state = 3;
            this.face = 0;
        } else if(time >=17500 && time < 20000) {
            this.state = 3;
            this.face = 1;
        } else if(time >= 20000 && time < 22500) {
            this.state = 4;
            this.face = 0;
        } else if(time >=22500 && time < 25000) {
            this.state = 4;
            this.face = 1;
        }
     */
};