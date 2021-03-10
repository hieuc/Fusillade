class Raven extends Enemy {
    constructor(game,x,y) {
        super(game,x,y);
        Object.assign(this, {});

        //Get raven's spritesheet
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Raven.png");
        
        //Keep is 2.2 or it is hard to tell
        this.scale = 2.2;

        //This to see how long it's been since level started. We decide triggered on this.
        this.starttimer = Date.now();

        this.createdeffect = false;

        this.state = 0; 

        //The lifetime of projectiles for attackturn = 0.
        this.projlifetime = 6500;

        //Raven has 3 circular patterns, either it's a location swap, all-in barrage or 1-by-1 barrage.
        //0 - Location Swap, 1 - All-in Barrage, 2 - 1-by-1 Barrage 
        this.attackturn = 0;

        //This is used to calculate if it is time for projectiles to return.
        this.zeroturntimer = Date.now();

        //Just so we do not execute location swap if are not doing a 0 attack.
        this.countzerotimer = false;

        //Used to ensure locations are swapped only once.
        this.resetone = true;

        //Used to reset our speed down ONLY ONCE to 20% to simulate time slowing down.
        this.resetspeedonce = true;

        //Calculate how long we've been in Slow-Mo.
        this.timeslow = Date.now();

        this.face = 0; 

        this.circlearea = 0;
        //This is here so that we can keep a temporary location for our X and Y when we swap locations.
        this.tempmylocation = {myX: this.x, myY: this.y};

        //used to keep track of enemy postiions
        this.enemypos = { enemyX: this.game.camera.char.x, enemyY: this.game.camera.char.y};

        this.specialcd = 14000; // Change this to buff or nerf Raven.

        //Used to determine if it is time to use a special.
        this.specialtimer = Date.now();

        this.bound = new BoundingBox(this.game, this.x, this.y, 50, 37);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 68 * this.scale, 22 * this.scale, 4000, 0);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 6; i++) { // 5 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }
        
        // idle animation for state = 0
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 50, 37, 4, 0.15, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 300, 37, 50, 37, 4, 0.15, 0, true, true);

        // walk animation for state = 1
        // facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 0, 37, 50, 37, 6, 0.15, 0, false, true);

        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 200, 481, 50, 37, 6, 0.15, 0, true, true);

        // special animation for state = 2
        // facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 0, 111, 50, 37, 9, 0.15, 0, false, true);

        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 50, 555, 50, 37, 9, 0.15, 0, true, true);

        // slash animation for state = 3
        // facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 0, 148, 50, 37, 7, 0.15, 0, false, true);

        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 150, 592, 50, 37, 7, 0.15, 0, true, true);

        // teleport animation for state = 4
        // facing right = 0
        this.animations[4][0] = new Animator(this.spritesheet, 0, 296, 50, 37, 5, 0.08, 0, false, true);

        // facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 250, 740, 50, 37, 5, 0.08, 0, true, true);

        // sitting animation for state = 5
        // facing right = 0
        this.animations[5][0] = new Animator(this.spritesheet, 150, 222, 50, 37, 4, 0.5, 0, false, true);

        // facing left = 1
        this.animations[5][1] = new Animator(this.spritesheet, 150, 666, 50, 37, 5, 0.5, 0, true, true);
    }

    update() {
        if(Date.now() - this.starttimer < this.specialcd-1000) {
            if(!this.createdeffect) {
                this.state = 5;
                this.game.addEntity(new Jojoeffect(this.game, this.x+50, this.y-60));
                this.game.addEntity(new Jojoeffect(this.game, this.x-60, this.y-60));
                this.createdeffect = true;
            }
        } else {
            this.state = 0;
            //HIGHEST PRIORITY TO THIS MINE ATTACK. Everything else takes second priority.
            if(Date.now() - this.specialtimer > this.specialcd) {
                if(this.attackturn == 0) {
                    this.areamine();
            }    else {
                    let choose = Math.random();
                    choose < 0.33? this.squaremine(): choose >= 0.33 && choose < 0.67? this.squarefillmine(): this.areamine();
                }
                this.specialtimer = Date.now();
            }

            //If our timer says that it is time for projectiles to return for this.attackturn = 0 case then do a swap.
            if(Date.now() - this.zeroturntimer > this.projlifetime && this.countzerotimer) {
                //Only reset locations once.
                if(this.resetone) {
                    ASSET_MANAGER.playAsset("./sounds/sfx/timestop.mp3");
                    ASSET_MANAGER.adjustEffectsVolume(0.6);
                    this.timeslow = Date.now();
                    this.resetone = false;
                    this.tempmylocation.myX = this.x;
                    this.tempmylocation.myY = this.y;
                    this.x = this.game.camera.char.x;
                    this.y = this.game.camera.char.y;
                    this.game.camera.char.x = this.tempmylocation.myX;
                    this.game.camera.char.y = this.tempmylocation.myY;
                }

                //After it has been 0.3 seconds since projectiles started coming for you, do the slow-mo effect.
                if(Date.now() - this.timeslow > 300) {
                    //Slow us down only ONCE because this case will happen many times, we want to do this check.
                    if(this.resetspeedonce) {
                        for(let i = 0; i < this.game.entities.length; i++) {
                            this.game.entities[i].speed *= 0.3;
                        }
                        this.resetspeedonce = false;
                    }
                } 

                //If it has been 1.7 seconds since slow-mo turn back to normal game speed.
                if(Date.now() - this.timeslow > 2000) {
                    //reset zerocounttimer so we don't hit that IF statement anymore.
                    this.countzerotimer = false;
                    //Reset speeds.
                    for(let i = 0; i < this.game.entities.length; i++) {
                        this.game.entities[i].speed /= 0.3;
                    }
                    //reset this back to true for next use.
                    this.resetone = true;
                    //Reset our speedincrease test to true for next use.
                    this.resetspeedonce = true;
                }   
            }
        }

        //Collision Detection. Check if its fired by enemy or hero.

        if(this.removeFromWorld != true) {
            var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Projectiles && entity.friendly) {
                        entity.hit(that);
                        ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                        if(that.hp.current <= 0) {
                            this.removeFromWorld = true;
                        }
                    } 
                    else if(entity instanceof Bluebeam) {
                        that.hp.current -= entity.damage;
                        that.game.addEntity(new Star(that.game, entity.x, entity.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                        if(that.hp.current <= 0) {
                            this.removeFromWorld = true; 
                        }
                    } else if(entity instanceof Redbeam) {
                        that.hp.current -= entity.damage;
                        that.game.addEntity(new Burn(that.game, entity.x, entity.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                        if(that.hp.current <= 0) {
                            this.removeFromWorld = true;  
                        }
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                    }
                    else if(entity instanceof Obstacle) 
                    {
                        if(that.bound.left < entity.bound.left && that.bound.right >= entity.bound.left) 
                        {
                            that.state = 4;
                            that.decideDir();
                            that.x -= that.speed * 1.5;
                        } else if(that.bound.right > entity.bound.right && that.bound.left <= entity.bound.right) 
                        {
                            that.state = 4;
                            that.decideDir();
                            that.x += that.speed * 1.5
                        }
                        if(that.bound.top  < entity.bound.top && that.bound.bottom >= entity.bound.top) 
                        {
                            that.state = 4;
                            that.decideDir();
                            that.y -= that.speed * 1.5;
                        } else if(that.bound.bottom > entity.bound.bottom && that.bound.top <= entity.bound.bottom) 
                        {
                            that.state = 4;
                            that.decideDir();
                            that.y += that.speed * 1.5;
                        }
    
                    }
                }
            })
        }

        this.updateBound();
    }

    updateBound() 
    {
        this.bound.update(this.x + 10, this.y + 5);

        this.hp.x = this.x + 11.5 * this.scale;
        this.hp.y = this.y + 40 * this.scale;
    }

    decideDir() 
    {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    areamine() {
        //How many projectiles constitute the air space at 360 degrees.
        var partitions = 72;
        let multiplier = 0;
        let blitz = 0;

        //If our attackturn is at 2 i.e. 1-by-1 barrage, we want them all to have varying times.
        if(this.attackturn == 2) {
            multiplier = 1;
        }

        //If it is a location-swap start the clocks and the booleans on necessary variables.
        if(this.attackturn == 0) {
            this.zeroturntimer = Date.now();
            this.countzerotimer = true;
        }

        //If it is a barrage type move, create the projectiles.
        if(this.attackturn == 1 || this.attackturn == 2) {
            var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:126, size:16};
            for(var i = 0; i < partitions; i++) {
                var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(blitz), y:Math.sin(blitz)}, 
                        9, this.projlifetime + 100 * multiplier, 20, pp, true);
                blitz += 2*Math.PI/partitions;
                this.game.entities.splice(this.game.entities.length - 1, 0, p);  
                if(this.attackturn == 2) {
                    multiplier++;  
                }    
            }
        } else {
            for(var i = 0; i < partitions; i++) {
                var pp = {sx: 128, sy: 400, size: 16};
                var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(this.circlearea), y:Math.sin(this.circlearea)}, 
                        9, this.projlifetime + 100 * multiplier, 20, pp, true, {x: this.x, y:this.y});
                this.circlearea += 1.8*Math.PI/partitions;
                this.game.entities.splice(this.game.entities.length - 1, 0, p);
            }

            this.circlearea += Math.PI/2;
        }

        if(this.attackturn == 2) {
            this.attackturn = 0;
        } else {
            this.attackturn++;
        }

        multiplier = 0;
    }

    squarefillmine() {
        let multiplier = 0;
        var partitions = 72;
        let xdirection = 0
        let ydirection = -1;

        if(this.attackturn == 2) {
            multiplier = 1;
        }
        var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:126, size:16};
        for(var i = 0; i < partitions; i++) {
            var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(xdirection), y:Math.sin(ydirection)}, 
                    9, this.projlifetime + 100 * multiplier, 20, pp, true);

            ydirection += 20; //Assigning random values to cause a scatter effect.
            xdirection += 1;
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
            if(this.attackturn == 2) {
                multiplier++;
            }
        }

        
        if(this.attackturn == 2) {
            this.attackturn = 0;
        } else {
            this.attackturn++;
        }

        multiplier = 0;
    }

    squaremine() {
        var partitions = 100;
        let xdirection = 0
        let ydirection = -1;
        let multiplier = 0;
        var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:126, size:16};
        for(var i = 0; i < partitions; i++) {
            var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(xdirection), y:Math.sin(ydirection)}, 
                    9, this.projlifetime + 100*multiplier, 20, pp, true);

            if(i == partitions/4) {
                 ydirection = 1;
                 xdirection = Math.PI;
            }

            if(i == 3*partitions/4) {
                 ydirection = 1;
            }

            if(i < partitions/4)
                ydirection += 1/(partitions/8);
            else if(i >= partitions/4 && i< partitions/2)
                ydirection -= 1/(partitions/8);
            else if(i >= partitions/2 && i < 3*partitions/4)
                xdirection -= 1/(partitions/12);
            else 
                xdirection += 1/(partitions/12);
            
            if(this.attackturn == 2)
                multiplier++;

            this.game.entities.splice(this.game.entities.length - 1, 0, p);
        }

        if(this.attackturn == 2) {
            this.attackturn = 0;
        } else {
            this.attackturn++;
        }

        multiplier = 0;
    }


}