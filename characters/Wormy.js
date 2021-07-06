class Wormy extends Enemy {
    constructor(game, x, y) {
        super(game,x,y);

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Wormy.png");

        this.ss = 90;

        this.scale = 2;

        this.state = 0; // idle, walk, get hit, attack, die

        this.face = 0; // 0 for right, 1 for left

        this.animations = [];

        this.bound = new BoundingBox(this.game, this.x, this.y, 60, 50);

        this.hp = new HealthMpBar(this.game, this.x * this.scale, this.y * this.scale, 50 * this.scale, 400, 0, false); //change this to fit Wormy

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.firerate = 2500; // in ms

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.succession = 100; // the larger the number the less projectiles Wormy shoots out

        this.barrage = Date.now();

        this.loadAnimations();

    }

    loadAnimations() {
        for (var i = 0; i < 4; i++) { // 5 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { // 2 directions
                this.animations[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 90, 90, 8, 0.15, 0, false, true);

        // idle animation for state = 0
        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 3060, 90, 90, 90, 8, 0.15, 0, true, true);

        // walk animation for state = 1
        // facing right
        this.animations[1][0] = new Animator(this.spritesheet, 810, 0, 90, 90, 16, 0.1, 0, false, true);

        // walking animation facing left
        // facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 1620, 90, 90, 90, 16, 0.1, 0, true, true);

        // attack animation for state = 3
        // facing right
        this.animations[2][0] = new Animator(this.spritesheet, 2160, 0, 90, 90, 11, 0.05, 0, false, true);

        // attack animation facing left
        // facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 630, 90, 90, 90, 11, 0.05, 0, true, true);

        // Death animation for state = 4
        // facing right
        this.animations[3][0] = new Animator(this.spritesheet, 3150, 0, 90, 90, 7, 0.1, 0, false, false);

        // Death amimation facing left
        // facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 0, 90, 90, 90, 7, 0.1, 0.0, true, false);

    }

    update() {
        this.enemyX = this.game.camera.char.x;
        this.enemyY = this.game.camera.char.y;
        this.speed = 3.5;

        // if Wormy dies
        if(this.state == 3) 
        {
            if(this.animations[this.state][this.face].isDone()) 
            {
               this.removeFromWorld = true;
               this.game.addEntity(new BunchofCoins(this.game, this.bound.x, this.bound.y, 10));
            }
        }

        // attack pattern
        else 
        {
            // movement pattern when Rutherford is not in trigger range
            if(Math.abs(this.x - this.enemyX) > 350 || Math.abs(this.y - this.enemyY) > 350)
            {
                this.howlong = Date.now() - this.toofarmovement;
                // move to the right in a straight line
                if(this.howlong < 2000)
                {
                    this.state = 1;
                    this.decideDir();
                    this.velocity = {x: 1, y:0};
                }
                else if(this.howlong >= 2000 && this.howlong < 4000)
                {
                    this.state = 1;
                    this.decideDir();
                    let tf = this.decideYDir();
                    if(tf)
                    {
                        this.velocity = {x: 0, y:1};
                    }
                    else
                    {
                        this.velocity = {x: 0, y:-1};
                    }
                }
                else if(this.howlong >= 4000 && this.howlong < 6000)
                {
                    this.state = 1;
                    this.decideDir();
                    this.velocity = {x: -1, y:0};
                }
                else if(this.howlong >= 6000 && this.howlong < 8000)
                {
                    this.state = 1;
                    this.decideDir();
                    let tf = this.decideYDir();
                    if(tf)
                    {
                        this.velocity = {x: 0, y:-1};
                    }
                    else
                    {
                        this.velocity = {x: 0, y:-1};
                    }
                }
                else
                {
                    this.toofarmovement = Date.now();
                }
            }
            // If Rutherford is in trigger range, then fire off attacks
            else if(Math.abs(this.x - this.enemyX) < 350 || Math.abs(this.y - this.enemyY) < 350)
            {
                var timepass = Date.now() - this.attackbuffer;
                this.decideDir();
                if(timepass > this.firerate)
                {
                    if(Date.now() - this.barrage > this.succession)
                    {
                        this.state = 2;
                        this.attack();
                        this.barrage = Date.now();
                    }
                    if(timepass > this.firerate + 250)
                    {
                        this.attackbuffer = Date.now();
                    }
                }
            }

            this.x += this.velocity.x * this.speed;
            this.y += this.velocity.y * this.speed;
        }

         //Collision Detection. Check if its fired by enemy or hero.

         if(this.state != 3) {
            var that = this;
            this.game.entities.forEach(e => {
                if (e.bound && this.bound.collide(e.bound)) {
                    if(e instanceof Projectiles && e.friendly) {
                        e.hit(that);
                        ASSET_MANAGER.playAsset("./sounds/sfx/Hit.mp3");
                        if(that.hp.current <= 0) {
                            that.state = 3;
                        }
                    } 
                    else if(e instanceof Bluebeam) {
                        that.hp.current -= e.damage;
                        that.game.addEntity(new Star(that.game, e.x, e.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, e.damage));
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                        if(that.hp.current <= 0) {
                            that.state = 3;   
                        }
                    } else if(e instanceof Redbeam) {
                        that.hp.current -= e.damage;
                        that.game.addEntity(new Burn(that.game, e.x, e.y + 180));
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y, e.damage));
                        if(that.hp.current <= 0) {
                            that.state = 3;   
                        }
                        //var audio = new Audio("./sounds/Hit.mp3");
                        //audio.volume = PARAMS.hit_volume;
                        //audio.play();
                    }
                    else if(e instanceof Obstacle) 
                    {
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
                            this.updateBounds();
                        }
                    }
                }
            })
        }

        this.updateBound();

    }   

    updateBound() {
        this.bound.update(this.x + 65, this.y + 70);

        this.hp.x = this.x + 20 * this.scale;
        this.hp.y = this.y + 65 * this.scale;
    }

    decideDir() 
    {
        if(this.x - this.enemyX> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    decideYDir()
    {
        let truthVal = false;
        if(this.y - this.enemyY < 0)
        {
            truthVal = true;
        }
        return truthVal;
    }

    attack() {
        var velocity = this.calculateVel();
        var pp = { sx: 160, sy: 336, size: 16};
        var p = new SquareProjectile(this.game, false, this.x + 48, this.y + 56, velocity, 7, 14000, 30, true, pp);
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

}