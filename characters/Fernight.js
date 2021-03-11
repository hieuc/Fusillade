class Fernight extends Enemy {
    constructor(game, x, y, room) {

        super(game,x,y, room);

        this.room = room; // the room Fernight spawns in

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fernight.png");

        this.scale = 1;

        this.state = 0;

        this.face = 0;

        this.animations = [];

        this.bound = new BoundingBox(this.game, this.x, this.y, 64, 64);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 68 * this.scale, 64 * this.scale, 270, 0);

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
        this.animations[0][0] = new Animator(this.spritesheet, 192, 574, 64, 64, 5, 0.3, 0, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 768, 574, 64, 64, 5, 0.3, 0, true, true);

        //walk animation for state = 1
        this.animations[1][0] = new Animator(this.spritesheet, 64, 128, 64, 64, 2, 0.2, 0, false, true);

        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 1088, 128, 64, 64, 2, 0.2, 0, true, true);

        //Attack1 animation for state = 2
        this.animations[2][0] = new Animator(this.spritesheet, 0, 384, 82, 56, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 1032, 384, 82, 56, 3, 0.2, 0, true, true);

        //Attack2 animation for state = 3
        this.animations[3][0] = new Animator(this.spritesheet, 0, 448, 64, 64, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 1088, 448, 64, 64, 3, 0.2, 0, true, true);

        //Death animation for state = 4
        this.animations[4][0] = new Animator(this.spritesheet, 0, 512, 64, 64, 10, 0.1, 0, true, true);

        // facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 640, 512, 64, 64, 10, 0.1, 0, false, true);

        //Taunt animation for state = 5
        this.animations[5][0] = new Animator(this.spritesheet, 256, 128, 64, 64, 2, 0.25, 0, true, true);

        // facing left = 1
        this.animations[5][1] = new Animator(this.spritesheet, 896, 128, 64, 64, 2, 0.25, 0, false, true);
    }

    update() {
        
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        this.speed = 3.5;

        // if Wormy dies
        if(this.state == 4) 
        {
            if(this.animations[this.state][this.face].isDone()) 
            {
               this.removeFromWorld = true;
            }
        }

         // attack pattern
         else 
         {

         }

          //Collision Detection. Check if its fired by enemy or hero.

          if(this.state != 4) {
            var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Projectiles && entity.friendly) {
                        entity.hit(that);
                        ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                        if(that.hp.current <= 0) {
                            that.state = 4;
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
                            that.state = 4;   
                        }
                    } else if(entity instanceof Redbeam) {
                        that.hp.current -= entity.damage;
                        that.game.addEntity(new Burn(that.game, entity.x, entity.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, entity.damage));
                        if(that.hp.current <= 0) {
                            that.state = 4;   
                        }
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                    }
                    else if(entity instanceof Obstacle) 
                    {
                        if(that.bound.left < entity.bound.left && that.bound.right >= entity.bound.left) {
                            that.x -= that.speed;
                            that.speed = 0;
                        } else if(that.bound.right > entity.bound.right && that.bound.left <= entity.bound.right) {
                            that.x += that.speed;
                            that.speed = 0;
                        }
                        if(that.bound.top  < entity.bound.top && that.bound.bottom >= entity.bound.top) {
                            that.y -= that.speed;
                            that.speed = 0;
                        } else if(that.bound.bottom > entity.bound.bottom && that.bound.top <= entity.bound.bottom) {
                            that.y += that.speed;
                            that.speed = 0;
                        }
    
                    }
                }
            })
        }

        this.updateBound();
    }   

    updateBound() {
        this.bound.update(this.x + 10, this.y + 5);

        this.hp.x = this.x * this.scale;
        this.hp.y = this.y + 68 * this.scale;
    }

    decideDir() 
    {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    // attack() {
    //     var velocity = this.calculateVel();
    //     var pp = { sx: 160, sy: 336, size: 16};
    //     var p = new Projectile(this.game, false, this.x + 48, this.y + 56, velocity, 7, 14000, 30, true, pp);
    //     p.bound.r = 10;
    //     this.game.entities.splice(this.game.entities.length - 1, 0, p);
    // }

    calculateVel() {
        var enemy = this.game.camera.char;
        var dx = enemy.bound.x - (this.x + 48); // to deal with the projectiles that miss, change the number you are adding
        var dy = enemy.bound.y - (this.y + 56); // to deal with the projectiles that miss, change the number you are adding

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }

};