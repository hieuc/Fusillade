class Cyclops
{
    constructor(game, x, y) 
    {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Cyclops.png");

        this.damage = 8;
        
        this.removeFromWorld = false;

        this.scale = 2;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die, 4 = laser attack

        this.face = 0; // 0 = right, 1 = left

        //this.patterntimer = Date.now();

        this.speed = 1.2;

        this.isEnemy = true;

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 150; //in milliseconds.

        this.enemypos = { enemyX: 0, enemyY: 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 64, 64);

        this.hp = new HealthMpBar(this.game, this.bound.x, this.bound.y , 34 * this.scale, 300, false);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() 
    {
        for (var i = 0; i < 5; i++) { // 4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 64, 64, 15, 0.25, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 0, 640, 64, 64, 15, 0.25, 0, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 0, 64, 64, 64, 12, 0.1, 0, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 0, 704, 64, 64, 12, 0.1, 0, false, true);

        //attack animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 0, 192, 64, 64, 13, 0.1, 0, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 0, 832, 64, 64, 13, 0.1, 0, false, true);

        //die animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 0, 384, 64, 64, 9, 0.1, 0, false, false);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 0, 1024, 64, 64, 9, 0.1, 0, false, false);

        // laser attack animation
        // facing right
        this.animations[4][0] = new Animator(this.spritesheet, 0, 512, 64, 64, 6, 0.1, 0, false, true);

        // laser attack animation
        // facing left
        this.animations[4][1] = new Animator(this.spritesheet, 0, 1152, 64, 64, 6, 0.1, 0, false, true);

    }


    update()
    {
        //As long as we don't trigger the enemy, do a pattern movement.
        //Death Animation for state of 3
        if(this.state == 3) 
        {
            if(this.animations[this.state][this.face].isDone()) 
            {
               this.removeFromWorld = true;
            }
        } 
        else 
        {
            //console.log("here")
            //console.log("x: " + Math.abs(this.x - this.enemyX) + ", y: " + Math.abs(this.y - this.enemyY))
            // if Cyclops x-value greater than 200 and y-value greater than 100 away from Rutherford then do the walking animation
           if(Math.abs(this.x - this.enemyX) > 200 || Math.abs(this.y - this.enemyY) > 100) 
           {
               this.howlong = Date.now() - this.toofarmovement;
               if(this.howlong < 1500) 
               {
                   this.face = 1;
                   this.x += -1 * this.speed;
                   this.state = 1;
               } 
               else if (this.howlong >= 1500 && this.howlong < 3000) 
               {
                   this.state = 0;
               } 
               else if(this.howlong >= 3000 && this.howlong < 4500) 
               {
                   this.face = 0;
                   this.x += 1 * this.speed;
                   this.state = 1;
               } 
               else if (this.howlong >= 4500 && this.howlong < 6000) 
               {
                   this.state = 0;
               } 
               else 
               {
                   this.toofarmovement = Date.now();
               }
               //If we are in trigger range, get closer to the main character
            } 
           else if(Math.abs(this.x - this.enemyX) > 100 || Math.abs(this.y - this.enemyY) > 80) 
           {
               this.attack();
            //Once we are in a decent attack range, Do something now. 
            } 
            else 
            {
               this.attackbehavior = Date.now() - this.attackpatterntime;
               if(this.attackbehavior < 1500) 
               {
                   this.state = 0;
                   if(this.x - this.enemyX > 0) 
                   {
                       this.face = 1;
                   } 
                   else 
                   {
                       this.face = 0;
                   }
               } 
               else if (this.attackbehavior >= 1500 && this.attackbehavior < 4200) 
               {
                   this.state = 4;
                   if(this.x - this.enemyX > 0) 
                   {
                       this.face = 1;
                   } 
                   else 
                   {
                       this.face = 0;
                   }
                   var timepassed = Date.now() - this.attackbuffer;
                   if(timepassed > this.fireRate) 
                   {
                       this.attack();
                       this.attackbuffer = Date.now();
                   }
               } 
               else 
               {
                   this.attackpatterntime = Date.now();
               }
           }
        }

       this.updateBound();

        //Collision Detection. Check if its fired by enemy or hero.

        if(this.state != 3) {
            var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Projectiles && entity.friendly) {
                        that.hp.current -= entity.damage;             
                        entity.removeFromWorld = true;
                        var audio = new Audio("./sounds/Hit.mp3");
                        audio.volume = PARAMS.hit_volume;
                        audio.play();
                        if(that.hp.current <= 0) {
                            that.state = 3;
                        }
                    } 
                    else if(entity instanceof bluebeam) {
                        that.hp.current -= entity.damage;
                        that.game.addEntity(new star(that.game, entity.x, entity.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                        if(that.hp.current <= 0) {
                            that.state = 3;   
                        }
                    } else if(entity instanceof redbeam) {
                        that.hp.current -= entity.damage;
                        that.game.addEntity(new burn(that.game, entity.x, entity.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                        if(that.hp.current <= 0) {
                            that.state = 3;   
                        }
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                    }
                }
            })
        }
    }

    draw(ctx)
    {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    updateBound() {
        this.bound.update(this.x + 37, this.y + 37);

        this.hp.x = this.x + 16 * this.scale;
        this.hp.y = this.y + 68 * this.scale;
    }

    // get position of Rutherford
    getEnemyPos(eneX, eneY) 
    {
        this.enemyX = eneX;
        this.enemyY = eneY;
    }

    calculateVel() 
    {
        var dx = this.enemyX - this.x;
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

    attack() {
        var velocity = this.calculateVel();
        var pp = { spritesheet: ASSET_MANAGER.getAsset("./sprites/Cyclops.png"), sx: 285, sy: 608, size: 7};
        var p = new Projectiles(this.game, false, this.x, this.y, velocity, 3, 2000, 10, pp);
        p.bound.r = 10;
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

};