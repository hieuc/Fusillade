class Ais {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Ais.png");

        this.damage = 10;

        this.removeFromWorld = false;

        this.scale = 2;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left

        this.speed = 2;

        this.isEnemy = true;

        this.atkleftorright = 0;

        this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 300; //in milliseconds.

        this.enemypos = { enemyX: 0, enemyY: 0};

        this.bound = new BoundingBox(this.game, this.x, this.y, 22, 20);

        this.hp = new HealthBar(this.game, this.x + 2 * this.scale, this.y + 16 * this.scale, 16 * this.scale, 130);

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
           } else if(Math.abs(this.x - this.enemyX) > 350 || Math.abs(this.y - this.enemyY) > 100) {
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


        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Projectiles && entity.friendly) {
                    that.hp.current -= entity.damage;
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

    draw(ctx) {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        this.hp.draw();
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    getEnemyPos(eneX, eneY) {
        this.enemyX = eneX;
        this.enemyY = eneY;
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
        //console.log(this.atkleftorright);
        var p2 = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(this.atkleftorright), y:Math.sin(this.atkleftorright)}, 3, 2000, 10, pp);
        this.atkleftorright -= Math.PI/2;
        //console.log(this.atkleftorright);
        var p3 = new Projectiles(this.game, false, this.x, this.y, {x: Math.cos(this.atkleftorright), y:Math.sin(this.atkleftorright)}, 3, 2000, 10, pp);

        p.bound.r = 10;
        p2.bound.r = 10;
        p3.bound.r = 10;

        this.game.entities.splice(this.game.entities.length - 1, 0, p);
        this.game.entities.splice(this.game.entities.length - 1, 0, p2);
        this.game.entities.splice(this.game.entities.length - 1, 0, p3);

    }
};