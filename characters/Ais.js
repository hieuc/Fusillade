class Ais {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Ais.png");

        this.scale = 2; //size of Ais

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left
 
        this.speed = 2; //Ais movement speed

        this.isEnemy = true; //Are we an enemy, used for checks.
        
        this.cooldown = false; //In environment collision, go on cooldown for normal patterns.

        this.atkleftorright = 0; //Attack left or right depending on player's location.

        this.toofarmovement = Date.now(); //If we're not triggered, use this variable to do timed pattern.

        this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 300; //in milliseconds.

        this.enemypos = { enemyX: this.game.camera.char.x, enemyY: this.game.camera.char.y}; //Rutherford's position.

        this.bound = new BoundingBox(this.game, this.x, this.y, 22, 20);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 16 * this.scale, 16 * this.scale, 130, false);

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 4; i++) { // 4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        this.animations[0][0] = new Animator(this.spritesheet, 6, 18, 18, 18, 7, 0.25, 14, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 6, 210, 18, 18, 7, 0.25, 14, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 6, 49, 18, 18, 8, 0.1, 14, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 9, 241, 18, 18, 8, 0.1, 14, false, true);

        //attack animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 8, 82, 18, 18, 6, 0.1, 14, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 7, 274, 18, 18, 6, 0.1, 14, false, true);

        //die animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 7, 146, 18, 18, 6, 0.1, 14, false, false);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 8, 339, 18, 18, 6, 0.1, 14, false, false);

    }

    update() {
        //Reset speed always in case we hit an obstacle.
        this.speed = 2;
        //Get newest position of Rutherford.
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        //As long as we don't trigger the enemy, do a pattern movement.
        if(this.state == 3) {
            if(this.animations[this.state][this.face].isDone()) {
               this.removeFromWorld = true;
            }
       } else {
           //If we are too far away, move left, stand still, move right, stand still, repeat.
           if(Math.abs(this.x - this.enemyX) > 800 || Math.abs(this.y - this.enemyY) > 600 || this.cooldown) {
               this.howlong = Date.now() - this.toofarmovement;
               if(this.howlong < 1500) {
                   this.face = 1;
                   this.x += -1 * this.speed;
                   this.state = 1;
               } else if (this.howlong >= 1500 && this.howlong < 3000) {
                   this.state = 0;
                   this.cooldown = false;
               } else if(this.howlong >= 3000 && this.howlong < 4500) {
                   this.face = 0;
                   this.x += 1 * this.speed;
                   this.state = 1;
               } else if (this.howlong >= 4500 && this.howlong < 6000) {
                   this.state = 0;
               } else {
                   this.toofarmovement = Date.now();
               }
           //If we are in trigger range, get closer to the main character
           } else if(Math.abs(this.x - this.enemyX) > 350 || Math.abs(this.y - this.enemyY) > 100) {
                if(this.x - this.enemyX < 1 && this.x - this.enemyX > -1) {
                    this.face = 0;
                } else if(this.x - this.enemyX > 0) {
                    this.x += -1 * this.speed;
                    this.face = 1;
                    this.state = 1;
                } else {
                    this.x += 1 * this.speed;
                    this.face = 0;
                    this.state = 1;
                }
                if(this.y - this.enemyY > 0) {
                    this.y += -1 * this.speed;
                } else {
                    this.y += 1 * this.speed;
                }
            //If we are too far away in Y-axis, close the distance as our move depends on Y-Position.
           } else if(Math.abs(this.y - this.enemyY) > 50) {
                if(this.y - this.enemyY > 0) {
                    this.y += -1 * this.speed;
                    this.face = 1;
                    this.state = 1;
                } else {
                    this.y += 1 * this.speed;
                    this.face = 0;
                    this.state = 1;
                }
           } else {
            //If we're in range, first stand still to allow player to react, then attack.
               this.attackbehavior = Date.now() - this.attackpatterntime;
               if(this.attackbehavior < 1500) {
                   this.state = 0;
                   if(this.x - this.enemyX > 0) {
                       this.face = 1;
                   } else {
                       this.face = 0;
                   }
               } else if (this.attackbehavior >= 1500 && this.attackbehavior < 4200) {
                   this.state = 2;
                   if(this.x - this.enemyX > 0) {
                       this.face = 1;
                   } else {
                       this.face = 0;
                   }
                   var timepassed = Date.now() - this.attackbuffer;
                   if(timepassed > this.fireRate) {
                       this.attack();
                       this.attackbuffer = Date.now();
                   }
               } else {
                   this.attackpatterntime = Date.now();
               }
           }
       }

       this.updateBound();

       //If we are dead, then dont check for collisions.
        if(this.state != 3) {    
            this.checkCollisions();
        }
    }

    //Check for projectile, environmental or other collisions.
    checkCollisions() {
        var that = this;
        var rutherform = 0;
        this.game.entities.forEach(function (entity) {
            if(entity instanceof Rutherford) {
                rutherform = entity.form;
            }
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
                        that.speed;
                    }

                    that.cooldown = true;
                }

                if(entity instanceof Projectiles && entity.friendly) {
                    that.hp.current -= entity.damage;
                    if(rutherform == 0) {
                        that.game.addEntity(new Star(that.game, entity.x, entity.y-22));
                    } else {
                        that.game.addEntity(new Burn(that.game, entity.x-50, entity.y-40));
                    }
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y + that.bound.h / 2, entity.damage));
                    entity.removeFromWorld = true;
                    var audio = new Audio("./sounds/Hit.mp3");
                    audio.volume = PARAMS.hit_volume;
                    audio.play();
                    if(that.hp.current <= 0) {
                        that.state = 3;
                    }
                } else if(entity instanceof Bluebeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new star(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                    if(that.hp.current <= 0) {
                        that.state = 3;   
                    }
                } else if(entity instanceof Redbeam) {
                    that.hp.current -= entity.damage;
                    that.game.addEntity(new Burn(that.game, entity.x, entity.y + 180));
                    that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                    //var audio = new Audio("./sounds/Hit.mp3");
                    //audio.volume = PARAMS.hit_volume;
                    //audio.play();
                    if(that.hp.current <= 0) {
                        that.state = 3;   
                    }
                } 
            }
        })      
    }

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    updateBound() {
        this.bound.update(this.x + 10, this.y + 5);

        this.hp.x = this.x + 2 * this.scale;
        this.hp.y = this.y + 16 * this.scale;
    }

    attack() {
        var pp = { sx: 80, sy: 128, size: 16}
        this.atkleftorright = this.enemyX - this.x > 0? 0: Math.PI;
        
        var p = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(this.atkleftorright), y:Math.sin(this.atkleftorright)}, 3, 2000, 10, pp);
        this.atkleftorright += Math.PI/4;
        var p2 = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(this.atkleftorright), y:Math.sin(this.atkleftorright)}, 3, 2000, 10, pp);
        this.atkleftorright -= Math.PI/2;
        var p3 = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(this.atkleftorright), y:Math.sin(this.atkleftorright)}, 3, 2000, 10, pp);

        p.bound.r = 10;
        p2.bound.r = 10;
        p3.bound.r = 10;

        this.game.entities.splice(this.game.entities.length - 1, 0, p);
        this.game.entities.splice(this.game.entities.length - 1, 0, p2);
        this.game.entities.splice(this.game.entities.length - 1, 0, p3);

    }
};