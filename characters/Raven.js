class Raven extends Enemy {
    constructor(game,x,y) {
        super(game,x,y);
        Object.assign(this, {});

        this.shaketimer  = Date.now();

        this.move = -50;

        this.celebrationTimer = Date.now();

        /**
         * GENERAL VARIABLES
         */

        //Get raven's spritesheet
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Raven.png");
        
        //Keep is 2.2 or it is hard to tell
        this.scale = 2.2;

        this.damage = 40;

        this.speed = 5;

        this.face = 0; 

        this.createhealthbar = true;

        //This to see how long it's been since level started. We decide triggered on this.
        this.starttimer = Date.now();

        this.createdeffect = false;

        this.state = 0; 

        //used to keep track of enemy postiions
        this.enemypos = { enemyX: this.game.camera.char.x, enemyY: this.game.camera.char.y};

        this.bound = new BoundingBox(this.game, this.x, this.y, 50, 70);

        this.hp;

        this.animations = [];

        // attacks related
        this.current = 0;
        this.lastphase = 0;
        this.inprogress = true;
        this.attackDelayTimestamp = null;
        this.betweenAttacksDelay = 7000;

        /**
         * VARIABLES USED BY VICTOR STARTS HERE ------------------------
         */
        // how many beams to create for each row to fill the room
        this.beamCount = [7,9,11,13,15,17,19,19,19,19,19,19,19,17,15,13,11,9,7];

        // delay between each beam
        this.beamdelay = 400;

        // count the progress of beam going thru the room
        this.currentrow = 0;

        // timestamp to ensure delay between beams
        this.lastbeam = Date.now();

        // square pattern on pattern beam phase, 
        // the array is formatted as [x1, y1, x2, y2,...]
        this.beampattern = [
            [-1, -1, 0, -1, 0, 0, -1, 0],
            [1, -1, 0, -1, 0, 0, 1, 0],
            [0, 0, 0, -1, 1, -1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 0]
        ];
        // current square pattern in progress
        this.currentpattern = 0;

        // 0 = closing beams, 1 = pattern beams
        this.beamphase = 0;

        /**
         * VARIABLES BY VICTOR ENDS HERE---------------------------------
         */

        /** 
         * THIS IS WHERE VARIABLES USED BY ALI ARE 
        */

        //The lifetime of projectiles for attackturn = 0.
        this.projlifetime = 2500;

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

        this.circlearea = 0;

        //This is here so that we can keep a temporary location for our X and Y when we swap locations.
        this.tempmylocation = {myX: this.x, myY: this.y};


        this.specialcd = 7000; // Change this to buff or nerf Raven.

        //Used to determine if it is time to use a special.
        this.specialtimer = Date.now();
        
        //------------------------- end of ali variables

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
        this.animations[0][1] = new Animator(this.spritesheet, 300, 444, 50, 37, 4, 0.15, 0, true, true);

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
        // enemy update
        this.speed = 5;
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        // introduction
        if(Date.now() - this.starttimer < this.specialcd-1000) {
            if(!this.createdeffect) {
                this.state = 5;
                this.game.addEntity(new Jojoeffect(this.game, this.x+50, this.y-60));
                this.game.addEntity(new Jojoeffect(this.game, this.x-60, this.y-60));
                this.createdeffect = true;
            }
        } else {
            // after intro (stood up)
            if(this.createhealthbar) {
                this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 68 * this.scale, 22 * this.scale, 30000, 0);
                this.createhealthbar = false;
                this.state = 0;
            }
            //IF WE ARE DEAD, do the celebration while raven sits down.
            if(this.hp.current <= 0) {
                this.state = 5;
                this.face = 0;
                let xcele = 100;
                let ycele = 100;
                if(Date.now() - this.celebrationTimer > 6000) {
                    for(let j = 0; j < 15; j++) {
                        this.game.addEntity(new CelebrationO(this.game, xcele, 572));
                        this.game.addEntity(new CelebrationB(this.game, 610, ycele));
                        xcele += 70;
                        ycele += 80;
                    }
                    for(let i = 100; i < 109; i++) {
                        let sideX = Math.random() < 0.51? -1:1;
                        let sideY = Math.random() < 0.51? -1:1;
                        this.game.addEntity(new CelebrationO(this.game, this.x + (Math.random() * i * sideX), this.y + (Math.random() * i * sideY)));
                        this.game.addEntity(new CelebrationB(this.game, this.x * Math.random() * i * sideX, this.y * Math.random() * i * sideY));
                    }
                    this.celebrationTimer = Date.now();
                }
            } else {
                // choose attack from pool
                if (!this.inprogress) {
                    // start a delay after an attack is completed
                    if (!this.attackDelayTimestamp) {
                        this.attackDelayTimestamp = Date.now();
                        this.lastphase = this.current;
                        this.current = null;
                    }

                    // NOTE: this prepicking exists because the end of shuriken phase takes too long to transition to beams,
                    // while other phase transitions only requires about 1/3 time 

                    // choose a random attack at 1/3 of delay
                    if (this.current === null && Date.now() - this.attackDelayTimestamp > this.betweenAttacksDelay/3) {
                        var next = randomInt(2);
                        this.current = next;

                        // if this is not transition from shurikens to beam, then immediately start the attack
                        if (this.lastphase - next !== 1) {
                            this.attackDelayTimestamp -= this.betweenAttacksDelay;
                        }
                    }
                    
                    // choose a random attack
                    if (Date.now() - this.attackDelayTimestamp > this.betweenAttacksDelay) {
                        this.attackDelayTimestamp = null;
                        this.inprogress = true;
                    }
                } else {
                    // perform attack
                    if (this.current === 0) {
                        this.vicsattack();
                    } else if (this.current === 1) {
                        this.aliattack();
                    }
                }

                this.updateBound();
                this.checkCollisions();
            }
        }
    }

    checkCollisions() {
        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Obstacle) {
                    if(that.bound.left < entity.bound.left && that.bound.right >= entity.bound.left) {
                        that.x -= that.speed*1.2;
                        that.speed = 0;
                    } else if(that.bound.right > entity.bound.right && that.bound.left <= entity.bound.right) {
                        that.x += that.speed*1.2;
                        that.speed = 0;
                    }
                    if(that.bound.top < entity.bound.top && that.bound.bottom >= entity.bound.top) {
                        that.y -= that.speed*1.2;
                        that.speed = 0;
                    } else if(that.bound.bottom > entity.bound.bottom && that.bound.top <= entity.bound.bottom) {
                        that.y += that.speed*1.2;
                        that.speed = 0;
                    }
                    
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

    /**
     * BEGINNING OF VICTOR'S ATTACK -------------------------------------
     */
    vicsattack() {
        if (Date.now() - this.lastbeam >= this.beamdelay) {
            // this is after a beam phase is completed, pick a random one
            if (this.currentrow === 0) {
                this.beamphase = randomInt(2);
            }

            // closing beams phase
            if (this.beamphase === 0) {
                // left to right
                for (var j = 0; j < this.beamCount[this.currentrow]; j++) {
                    this.game.addEntity(new Beam(this.game, 48 + this.currentrow*64, 64*(j+6.75-(this.beamCount[this.currentrow]-7)/2)));
                }
                // right to left
                for (var j = 0; j < this.beamCount[18-this.currentrow]; j++) {
                    this.game.addEntity(new Beam(this.game, 48 + (18-this.currentrow)*64, 64*(j+6.75-(this.beamCount[18-this.currentrow]-7)/2)));
                }
                // top to bottom
                for (var j = 0; j < this.beamCount[this.currentrow]; j++) {
                    this.game.addEntity(new Beam(this.game, 64*(j+6.75-(this.beamCount[this.currentrow]-7)/2), 48 + this.currentrow*64));
                }
                // bottom to top
                for (var j = 0; j < this.beamCount[18-this.currentrow]; j++) {
                    this.game.addEntity(new Beam(this.game, 64*(j+6.75-(this.beamCount[18-this.currentrow]-7)/2), 48 + (18-this.currentrow)*64));
                }
            } 
            // beam pattern phase
            else {
                // this is the beginning of the phase, pick a pattern
                if (this.currentrow === 0)
                    this.currentpattern = randomInt(this.beampattern.length);
            
                var xoffset = this.beampattern[this.currentpattern][this.currentrow*2];
                var yoffset = this.beampattern[this.currentpattern][this.currentrow*2+1];
            
                for(var i = 0; i < this.beamCount.length; i+=2) {
                    for (var j = 0; j < this.beamCount[i]; j+=2) {
                        this.game.addEntity(new Beam(this.game, 48 + (i+xoffset) *64, 64*(j+6.75-(this.beamCount[i]-7)/2 + yoffset), 1500));
                    }
                }
            }
           

            this.currentrow++;
            // only for pattern beam phase, signal to end the phase when the pattern is done
            if (this.beamphase === 1 && this.currentrow === this.beampattern[this.currentpattern].length/2)
                this.currentrow = this.beamCount.length;
            
            // delay for the next beam
            this.lastbeam = Date.now();
        }

        // end the beam attack
        if (this.currentrow === this.beamCount.length) {
            this.currentrow = 0;
            this.inprogress = false;
        }
    }

    /**
     * END OF VICTOR'S ATTACK -------------------------------------------
     */

    updateBound() 
    {
        this.bound.update(this.x + 25, this.y + 5);

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

    /**
     * THIS IS THE START OF ALI'S SECTION OF ATTACK
     */
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
            var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:128, size:16};
            for(var i = 0; i < partitions; i++) {
                var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(blitz), y:Math.sin(blitz)}, 
                        7, this.projlifetime + 50 * multiplier, this.damage, pp, true);
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
                        7, this.projlifetime, this.damage, pp, true, {x: this.x, y:this.y});
                this.circlearea += 1.8*Math.PI/partitions;
                this.game.entities.splice(this.game.entities.length - 1, 0, p);
            }

            this.circlearea += Math.PI/2;
        }

        if(this.attackturn == 2) {
            this.attackturn = 0;
            // end of cycle
            this.inprogress = false;
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
        var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:128, size:16};
        for(var i = 0; i < partitions; i++) {
            var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(xdirection), y:Math.sin(ydirection)}, 
                    7, this.projlifetime + 50 * multiplier, this.damage, pp, true);

            ydirection += 20; //Assigning random values to cause a scatter effect.
            xdirection += 1;
            this.game.entities.splice(this.game.entities.length - 1, 0, p);
            if(this.attackturn == 2) {
                multiplier++;
            }
        }

        
        if(this.attackturn == 2) {
            this.attackturn = 0;
            // end of cycle
            this.inprogress = false;
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
        var pp = this.attackturn == 1? {sx: 17, sy: 336, size: 16}: {sx:16, sy:128, size:16};
        for(var i = 0; i < partitions; i++) {
            var p = new Chasingprojectile(this.game, false, this.x, this.y, {x :Math.cos(xdirection), y:Math.sin(ydirection)}, 
                    7, this.projlifetime + 50*multiplier, this.damage, pp, true);

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
            // end of cycle
            this.inprogress = false;
        } else {
            this.attackturn++;
        }

        multiplier = 0;
    }

    aliattack() {
        this.state = 0;
        this.decideDir();
        //If it is almost time to do the area attack, do the pose.
        if(Date.now() - this.specialtimer > this.specialcd - 1000) {
            this.state = 2;
            if(this.x - 560 > 20) {
                this.x -= this.speed;
                this.state = 1;
            } else if(this.x - 560 < -20) {
                this.x += this.speed;
                this.state = 1;
            }
            if(this.y - 560 > 20) {
                this.y -= this.speed;
                this.state = 1;
            } else if(this.y - 560 < -20){
                this.y += this.speed;
                this.state = 1;
            }        
        }

        // If it is time to do special, do it.
        if(Date.now() - this.specialtimer > this.specialcd) {
            this.animations[2][0].elapsedTime = 0;
            this.animations[2][1].elapsedTime = 0;
            if(this.attackturn == 0) {
                this.areamine();    
            } else {
                let choose = Math.random();
                choose < 0.33? this.squaremine(): choose >= 0.33 && choose < 0.67? this.squarefillmine(): this.areamine();
            }
            this.specialtimer = Date.now();
        } 

        //If we are doing the slow-mo attack, go back to center before it comes back.
        if(Date.now() - this.zeroturntimer > this.projlifetime /(3/2) && this.countzerotimer) {
            this.state = 0;
            this.decideDir();
            if(this.x - 560 > 20) {
                this.state = 1;
                this.x -= this.speed;
            } else if(this.x - 560 < -20) {
                this.state = 1;
                this.x += this.speed;
            }
            if(this.y - 560 > 20) {
                this.state = 1;
                this.y -= this.speed;
            } else if(this.y - 560 < -20){
                this.state = 1;
                this.y += this.speed;
            }                   
        }

        //If our timer says that it is time for projectiles to return for this.attackturn = 0 case then do a swap.
        if(Date.now() - this.zeroturntimer > this.projlifetime && this.countzerotimer) {
            //Only reset locations once.
            if(this.resetone) {
                ASSET_MANAGER.playAsset("./sounds/sfx/timestop.mp3", 2);
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
            if(Date.now() - this.timeslow > 50) {
                //Slow us down only ONCE because this case will happen many times, we want to do this check.
                if(this.resetspeedonce) {
                    for(let i = 0; i < this.game.entities.length; i++) {
                        this.game.entities[i].speed *= 0.3;
                    }
                    this.resetspeedonce = false;
                }
            }    

            //If it has been 1.7 seconds since slow-mo turn back to normal game speed.
            if(Date.now() - this.timeslow > 1600) {
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

    /**
     * THIS IS THE END OF ALI'S SECTION ON ATTACK.
     */
}