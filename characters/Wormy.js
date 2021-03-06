class Wormy extends Enemy {
    constructor(game, x, y) {
        super(game,x,y);

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Wormy.png");

        this.scale = 2;

        this.state = 0; // idle, walk, get hit, attack, die

        this.face = 0; // 0 for right, 1 for left

        this.animations = [];

        this.bound = new BoundingBox(this.game, this.x, this.y, 60, 50);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 90 * this.scale, 90 * this.scale, 100, 0, false); //change this to fit Wormy

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.firerate = 2500; // in ms

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.succession = 200; // the larger the number the less projectiles Wormy shoots out

        this.barrage = Date.now();

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
        this.animations[0][0] = new Animator(this.spritesheet, 2430, 0, 90, 90, 9, 0.15, 0, false, true);

        // idle animation for state = 0
        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 810, 90, 90, 90, 9, 0.15, 0, true, true);

        // walk animation for state = 1
        // facing right
        this.animations[1][0] = new Animator(this.spritesheet, 3150, 0, 90, 90, 9, 0.05, 0, false, true);

        // walking animation facing left
        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 0, 90, 90, 90, 9, 0.05, 0, true, true);

        // Get hit animation for state = 2
        // facing right
        this.animations[2][0] = new Animator(this.spritesheet, 2160, 0, 90, 90, 3, 0.2, 0, false, true);

        // Get hit animation for facing left
        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 1620, 90, 90, 90, 3, 0.2, 0, true, true);

        // attack animation for state = 3
        // facing right
        this.animations[3][0] = new Animator(this.spritesheet, 0, 0, 90, 90, 16, 0.15, 0, false, true);

        // attack animation facing left
        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 2610, 90, 90, 90, 16, 0.15, 0, true, true);

        // Death animation for state = 4
        // facing right
        this.animations[4][0] = new Animator(this.spritesheet, 1440, 0, 90, 90, 8, 0.3, 0.15, false, false);

        // Death amimation facing left
        // facing left = 1
        this.animations[4][1] = new Animator(this.spritesheet, 1890, 90, 90, 90, 8, 0.3, 0.15, true, false);

    }

    update() {

        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        this.speed = 5;

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
            this.howlong = Date.now() - this.toofarmovement;
            // move to the right in a straight line
            if(this.howlong < 2000)
            {
                this.state = 1;
                this.decideDir();
                this.x += this.speed;
            }
            else if(this.howlong >= 2000 && this.howlong < 4000)
            {
                this.state = 1;
                this.decideDir();
                this.y += -1 * this.speed;
            }
            else if(this.howlong >= 4000 && this.howlong < 6000)
            {
                this.state = 1;
                this.decideDir();
                this.x += -1 * this.speed;
            }
            else if(this.howlong >= 6000 && this.howlong < 8000)
            {
                this.state = 1;
                this.decideDir();
                this.y += this.speed;
            }
            else
            {
                this.toofarmovement = Date.now();
            }
            var timepass = Date.now() - this.attackbuffer;
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

        //this.updateBound();

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
        this.bound.update(this.x + 65, this.y + 70);

        this.hp.x = this.x + 30 * this.scale;
        this.hp.y = this.y + 30 * this.scale;
    }

    decideDir() {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    attack() {
        var velocity = this.calculateVel();
        var pp = { sx: 160, sy: 336, size: 16};
        var p = new SquareProjectile(this.game, false, this.x, this.y, velocity, 7, 14000, 10, pp);
        p.bound.r = 10;
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    calculateVel() {
        var enemy = this.game.camera.char;
        var dx = enemy.bound.x - (this.bound.x) + 40; // to deal with the projectiles that miss, change the number you are adding
        var dy = enemy.bound.y - (this.bound.y) + 53; // to deal with the projectiles that miss, change the number you are adding

        // find unit vector
        var length = Math.sqrt(dx * dx + dy * dy);
        var v = { x: dx / length,
                 y: dy / length};
        
        return v;
    }

}