class Buck {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Buck.png");

        this.health = 500;

        this.damage = 15;
        
        this.removeFromWorld = false;

        this.scale = 2.1;

        this.state = 0; //0 = idle, 1 = move, 2 = attack SLASH, 3 = Summon, LATER(4 = Fury Attack, 5 = die)

        this.face = 0; // 0 = right, 1 = left

        this.speed = 1.8;

        this.triggered = false; //Are you aggro-d/triggered?

        this.summoned = false;

        this.isEnemy = true;

        this.summontime = Date.now();
        
        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 200; //in milliseconds.

        this.summoncooldown = 22000; //Cooldown for the summon attack.

        this.whichattack = Math.random(); //Deciding attack among 3 possibilites.

        this.patterntimer = Date.now(); //To keep track of how long we've been running a pattern.

        this.patternduration = 7000; // 6 seconds.

        this.walkaroundtimer = Date.now(); 

        this.bound = new BoundingBox(this.x-60, this.y, 70, 70);

        this.blitz = 0;

        this.enemypos = { enemyX: 0, enemyY: 0, instX : 0, instY: 0};

        this.animations = [];

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
        this.animations[0][0] = new Animator(this.spritesheet, 22, 22, 62, 47, 5, 0.25, 34, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 15, 982, 62, 47, 5, 0.25, 34, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 23, 115, 58, 46, 8, 0.1, 38, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 15, 1076, 57, 45, 8, 0.1, 39, false, true);

        //attack SLASH animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 1, 295, 90, 61, 9, 0.05, 6, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 10, 1255, 80, 65, 9, 0.05, 16, false, true);

        //Summon animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 17, 492, 47, 58, 6, 0.1, 49, false, true);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 31, 1450, 44, 59, 6, 0.1, 52, false, true);

        //Summon animation for state = 4
        //facing right = 0
        this.animations[4][0] = new Animator(this.spritesheet, 8, 597, 84, 47, 9, 0.075, 12, false, true);

        //facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 10, 1556, 75, 48, 9, 0.075, 21, false, true);

    }

    /**
     * Updates our Buck. In our case, we don't trigger unless we're in a certain rage. Once in that range, buck starts
     * counting time for his summon attack and decides from among 3 differnet patterns, rage attack, walking around, 
     * scaling attacks. His summon attack takes priority, so if its time to summon, he'll stop his other attack and start
     * summoning. The probability of choosing any one of the 3 different patterns is same as we are using true random
     * i.e. Math random class.
     */
    update() { 

        //First check if player triggered the enemy.
        if((Math.abs(this.x - this.enemyX) < 300 && Math.abs(this.y - this.enemyY) < 200) && !this.triggered) {
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
                if(summon > this.summoncooldown+5000 && !this.summoned) {
                    this.bringSummons(); 
                    this.summoned = true;
                }
                //After 10 seconds of channel, do an attack yourself as well.
                if(summon >= this.summoncooldown+10000 && summon < this.summoncooldown+10900) {
                    this.decideDir();
                    this.state = 2;
                    if(Date.now() - this.attackbuffer >= this.fireRate) {
                        this.attack();
                        this.attackbuffer = Date.now();
                    }
                } 

                if(summon > this.summoncooldown+10900) {
                    this.summontime = Date.now();
                    this.summoned = false;
                }
            } else {
                var timer = Date.now() - this.patterntimer;
                if(timer < this.patternduration) {
                    this.decideDir();
                    if(this.whichattack >= 0 && this.whichattack < 0.34) { 
                        var timepassed = Date.now() - this.attackbuffer;
                        if(timepassed > this.fireRate) {
                            this.state = 2;
                            this.attack();
                            this.attackbuffer = Date.now();
                        }
                    } else if(this.whichattack >= 0.34 && this.whichattack < 0.67) {
                        this.walkaround(Math.random(), Math.random(), Math.random(), Math.random());
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

        this.updateBound();

        //Take into account different damage types for future reference.
        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Projectiles && entity.friendly) {
                    that.health -= 10;
                    entity.removeFromWorld = true;
                    console.log(that.health);
                    if(that.health <= 0) {
                        that.removeFromWorld = true;
                    }
                } else {
                    //nothing really.
                }
            }
        })
    }

    draw(ctx) {
        //These are just to make sure sprites don't "jump" since some animation sprites are bigger than others.
        var offsetX = 0;
        var offsetY = 0;
        if(this.state == 2) {
            offsetX = 40;
            offsetY = 30;
        } else if(this.state == 3) {
            offsetY = 20;
        } else if(this.state == 4) {
            offsetX = 40;
        }

        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - offsetX, this.y - this.game.camera.y - offsetY, this.scale);
        if (PARAMS.debug) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.bound.x - this.game.camera.x, this.bound.y - this.game.camera.y, this.bound.w, this.bound.h);
        }
    }

    getEnemyPos(eneX, eneY) {
        this.enemyX = eneX;
        this.enemyY = eneY;
    }

    updateBound() {
        this.bound.x = this.x + 16;
        this.bound.y = this.y + 16;
    }

    calculateVel() {
        var dx = this.enemyX - this.x;
        var dy = this.enemyY - this.y;
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};

         console.log(v);
        
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
            var pp = {sx: 96, sy: 144, size: 16};
            var p = new GenProjectiles(this.game, false, this.x+40, this.y+40, {x :Math.cos(this.blitz), y:Math.sin(this.blitz)}, 
                        5, 3000, 0.012, true, pp);
            this.blitz += Math.PI/partitions;
            console.log(this.blitz);
            this.game.entities.splice(this.game.entities.length - 1, 0, p);        
        }
        this.blitz += 50; //Keep changing starting angle
    }

    attack() {
        var velocity = this.calculateVel();
        var offset = this.face == 0? 100: 0;
        var pp = {sx: 96, sy: 144, size: 16};
        var p = new GenProjectiles(this.game, false, this.x + offset, this.y, velocity, 4, 2500, 0.005, false, pp);
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    bringSummons() {
        this.game.addEntity(new Fayere(this.game, this.enemyX - 150, this.enemyY));
        this.game.addEntity(new Fayere(this.game, this.enemyX + 150, this.enemyY));
        this.game.addEntity(new Fayere(this.game, this.enemyX, this.enemyY - 150));
        this.game.addEntity(new Fayere(this.game, this.enemyX, this.enemyY + 150));
    }

    decideDir() {
        if(this.x - this.enemyX > 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    walkaround(rand1, rand2, rand3, rand4) {
        this.howlong = Date.now() - this.walkaroundtimer;
        if(this.howlong < 3500) {
            this.face = 0;
            this.x += rand1 * (this.speed+1.5);
            this.state = 1;
        } else if (this.howlong >= 3500 && this.howlong < 5000) {
            this.face = 1;
            this.x -= rand3 * (this.speed+1.5);
            var updown = this.y - this.enemyY < 0? 1: -1;
            this.y += rand3 * (this.speed) * updown;
        } else if(this.howlong >= 5000 && this.howlong < 6900) {
            this.face = 1;
            this.x += -rand2 * (this.speed+1.5);
        } else {
            this.walkaroundtimer = Date.now();
        }
    }
    
    //Testing code.
    /**
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