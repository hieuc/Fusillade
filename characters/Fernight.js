class Fernight extends Enemy {
    constructor(game, x, y, room) {

        super(game, x, y);

        this.room = room;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fernight.png");

        this.scale = 1;

        this.state = 0;

        this.face = 0;

        this.animations = [];

        this.velocity = { x: 1, y: 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 48, 64);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 68 * this.scale, 64 * this.scale, 270, 0);

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.firerate = 100; // in ms

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.succession = 100; // the larger the number the less projectiles Wormy shoots out

        this.barrage = Date.now();

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
        this.animations[1][0] = new Animator(this.spritesheet, 64, 120, 64, 64, 2, 0.2, 0, false, true);

        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 1088, 120, 64, 64, 2, 0.2, 0, true, true);

        //Attack1 animation for state = 2
        this.animations[2][0] = new Animator(this.spritesheet, 0, 384, 82, 56, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 1032, 384, 82, 56, 3, 0.2, 0, true, true);

        //Attack2 animation for state = 3
        this.animations[3][0] = new Animator(this.spritesheet, 0, 448, 64, 64, 3, 0.2, 0, false, true);

        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 1088, 448, 64, 64, 3, 0.2, 0, true, true);

        //Death animation for state = 4
        this.animations[4][0] = new Animator(this.spritesheet, 0, 512, 64, 64, 10, 0.1, 0, true, false);

        // facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 640, 512, 64, 64, 10, 0.1, 0, false, false);

        //Taunt animation for state = 5
        this.animations[5][0] = new Animator(this.spritesheet, 256, 128, 64, 64, 2, 0.25, 0, true, true);

        // facing left = 1
        this.animations[5][1] = new Animator(this.spritesheet, 896, 128, 64, 64, 2, 0.25, 0, false, true);
    }

    update() {
        
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        this.speed = 3.3;

        if(this.state !== 4 && this.hp.current <= 0) {
            this.state = 4;   
        }

        // if Wormy dies
        if (this.state === 4) 
        {
            if(this.animations[this.state][this.face].isDone()) 
            {
               this.removeFromWorld = true;
            }
        }

         // attack pattern
        else if (this.state !== 4 && this.game.camera.isInRoom(this.room))
        {   
            this.howlong = Date.now() - this.toofarmovement;
            // move to the right in a straight line
            if(this.howlong < 3000)
            {
                this.state = 2;
                this.decideDir();

                var timepass = Date.now() - this.attackbuffer;
                this.decideDir();
                if(timepass > this.firerate)
                {
                    if(Date.now() - this.barrage > this.succession)
                    {
                        this.attack();
                        this.barrage = Date.now();
                    }
                    if(timepass > this.firerate + 250)
                    {
                        this.attackbuffer = Date.now();
                    }
                }
            }
            else if(this.howlong >= 3000 && this.howlong < 5000)
            {
                this.state = 5;
            }
            else if(this.howlong >= 5000)
            {
                this.toofarmovement = Date.now();
            }

            if (this.state !== 5) {
                this.x += this.velocity.x * this.speed;
                this.y += this.velocity.y * this.speed;
            }
    
            this.updateBound();
    
              //Collision Detection. Check if its fired by enemy or hero.
    
            if(this.state != 4) {
                var that = this;
                this.game.entities.forEach(e => {
                    if (e.bound && that.bound.collide(e.bound)) {
                        if(e instanceof Projectiles && e.friendly) {
                            e.hit(that);
                            ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                        } 
                        else if(e instanceof Bluebeam) {
                            that.hp.current -= e.damage;
                            that.game.addEntity(new Star(that.game, e.x, e.y + 180));
                            that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, e.damage));
                            //var audio = new Audio("./sounds/Hit.mp3");
                            //audio.volume = PARAMS.hit_volume;
                            //audio.play();
                            
                        } else if(e instanceof Redbeam) {
                            that.hp.current -= e.damage;
                            that.game.addEntity(new Burn(that.game, e.x, e.y + 180));
                            that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, e.damage));
                            //var audio = new Audio("./sounds/Hit.mp3");
                            //audio.volume = PARAMS.hit_volume;
                            //audio.play();
                        }
                        else if (e instanceof Obstacle && this.bound.collide(e.bound)) {
                            var changed = false;
                            // check horizontal
                            if (this.velocity.x > 0 && this.bound.left < e.bound.left & this.bound.right >= e.bound.left) {
                                // revert the position change if bounds met
                                this.x -= this.velocity.x * this.speed;
                                this.velocity.x = -this.velocity.x;
                            } else if (this.velocity.x < 0 && this.bound.right > e.bound.right && this.bound.left <= e.bound.right) {
                                this.x -= this.velocity.x * this.speed;
                                this.velocity.x = -this.velocity.x;
                            }
                            // check vertical 
                            else if (this.velocity.y > 0 && this.bound.top < e.bound.top && this.bound.bottom >= this.bound.top) {
                                this.y -= this.velocity.y * this.speed;
                                this.velocity.y = -this.velocity.y;
                            } else if (this.velocity.y < 0 && this.bound.bottom > e.bound.bottom && this.bound.top <= e.bound.bottom) {
                                this.y -= this.velocity.y * this.speed;
                                this.velocity.y = -this.velocity.y;
                            }
                            if (changed) {
                                // second bound update for collision update
                                this.updateBounds();
                            }
                        }
                    }
                });
            }

        }
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

    attack() {
        var pp = { sx: 144, sy: 432, size: 16};
        let yDir = 0;
        if(this.y - this.enemyY < 0)
        {
            yDir = 1;
        }
        else 
        {
            yDir = -1;
        }
        var p = new Projectiles(this.game, false, this.x + 20, this.y + 10, {x: 0, y: yDir}, 7, 1500, 49, pp);
        p.bound.r = 10;
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

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