class Fayere {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Fayere.png");

        this.damage = 8;
        
        this.removeFromWorld = false;

        this.scale = 2;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left

        this.speed = 1.2;

        this.isEnemy = true;

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 300; //in milliseconds.

        this.enemypos = { enemyX: 0, enemyY: 0};

        this.animations = [];

        this.bound = new BoundingBox(this.game, this.x, this.y, 22, 20);

        this.hp = new HealthMpBar(this.game, this.x + 2 * this.scale, this.y + 16 * this.scale, 16 * this.scale, 100, false);

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
        //As long as we don't trigger the enemy, do a pattern movement.
        if(this.state == 3) {
             if(this.animations[this.state][this.face].isDone()) {
                this.removeFromWorld = true;
             }
        } else {
            if(Math.abs(this.x - this.enemyX) > 800 || Math.abs(this.y - this.enemyY) > 600) {
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
            } else if(Math.abs(this.x - this.enemyX) > 350 || Math.abs(this.y - this.enemyY) > 300) {
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

        this.updateBound();

        //Collision Detection. Check if its fired by enemy or hero.

        if(this.state !== 3) {
            var that = this;
            var rutherform = 0;
            this.game.entities.forEach(function (entity) {
                if(entity instanceof Rutherford) {
                    rutherform = entity.form;
                }
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Projectiles && entity.friendly) {
                        that.hp.current -= entity.damage;
                        if(rutherform == 0) {
                            that.game.addEntity(new star(that.game, entity.x, entity.y-22));
                        } else {
                            that.game.addEntity(new burn(that.game, entity.x-50, entity.y-40));
                        }                 
                        that.game.addEntity(new Score(that.game, that.bound.x + that.bound.w/2, that.bound.y + that.bound.h / 2, entity.damage));
                        entity.removeFromWorld = true;
                        var audio = new Audio("./sounds/Hit.mp3");
                        audio.volume = PARAMS.hit_volume;
                        audio.play();
                        if(that.hp.current <= 0) {
                            that.state = 3;
                        }
                    } else {
                        //nothing really.
                    }
                }
            })
        }
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
        
        return v;
    }

    attack() {
        var velocity = this.calculateVel();
        var pp = { sx: 80, sy: 96, size: 16};
        var p = new Projectiles(this.game, false, this.x, this.y, velocity, 3, 2000, 10, pp);
        p.bound.r = 10;
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }
};