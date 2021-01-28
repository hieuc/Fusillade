class Fayere {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fayere.png");

        this.scale = 2.5;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left

        this.speed = 1.2;

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 300; //in milliseconds.

        this.enemypos = { enemyX: 0, enemyY: 0};

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

        // idle animation for state = 0
        // facing right = 0
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
        this.animations[2][0] = new Animator(this.spritesheet, 8, 82, 16, 16, 6, 0.1, 16, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 9, 275, 16, 16, 6, 0.1, 16, false, true);

        //die animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 7, 146, 16, 16, 6, 0.1, 16, false, false);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 8, 339, 16, 16, 6, 0.1, 16, false, false);

    }

    update() {
        //As long as we don't trigger the enemy, do a pattern movement.
        if(Math.abs(this.x - this.enemyX) > 300 || Math.abs(this.y - this.enemyY) > 170) {
            this.howlong = Date.now() - this.toofarmovement;
            if(this.howlong < 1500) {
                this.face = 1;
                this.x += -1 * this.speed;
                this.state = 1;
            } else if (this.howlong >= 1500 && this.howlong < 3000) {
                this.state = 0;
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
        } else if(Math.abs(this.x - this.enemyX) > 150 || Math.abs(this.y - this.enemyY) > 120) {
            if(this.x - this.enemyX > 0) {
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
        //Once we are in a decent attack range, Do something now. 
        } else {
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

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    getEnemyPos(eneX, eneY) {
        this.enemyX = eneX;
        this.enemyY = eneY;
    }

    calculateVel() {
        var dx = this.enemyX - this.x;
        var dy = this.enemyY - this.y;
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};
        
        if (dx < 0)
            v.x *= -1;

        if ((angle > 0 && dy < 0) || (angle < 0 && dy > 0))
            v.y *= -1;
        
        console.log(angle);
        return v;
    }

    attack() {
        var velocity = this.calculateVel();
        var p = new Projectiles(this.game, this.x, this.y, velocity, 3, 2000);
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }
};