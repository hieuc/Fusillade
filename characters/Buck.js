class Buck {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Buck.png");

        //ADD AN ENEMY TAG SO GETTING PLAYER LOCATION GETS NEATER (BOOLEAN)

        this.scale = 1.8;

        this.state = 0; //0 = idle, 1 = move, 2 = attack SLASH, 3 = Summon, LATER(4 = Fury Attack, 5 = die)

        this.face = 0; // 0 = right, 1 = left

        this.speed = 1.8;

        this.triggered = false; //Are you aggro-d/triggered?

        this.summoned = false;

        this.summontime = Date.now();
        
        this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        this.fireRate = 200; //in milliseconds.

        this.summoncooldown = 5000;

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
        this.animations[0][0] = new Animator(this.spritesheet, 22, 22, 62, 47, 5, 0.25, 34, false, true);

        // facing left = 1
        this.animations[0][1] = new Animator(this.spritesheet, 15, 982, 57, 47, 5, 0.25, 39, false, true);

        //walking animation for state = 1
        //facing right = 0
        this.animations[1][0] = new Animator(this.spritesheet, 23, 115, 58, 46, 8, 0.1, 38, false, true);

        //facing left = 1
        this.animations[1][1] = new Animator(this.spritesheet, 15, 1076, 57, 45, 8, 0.1, 39, false, true);

        //attack SLASH animation for state = 2
        //facing right = 0
        this.animations[2][0] = new Animator(this.spritesheet, 1, 295, 90, 61, 9, 0.1, 6, false, true);

        //facing left = 1
        this.animations[2][1] = new Animator(this.spritesheet, 10, 1255, 80, 65, 9, 0.1, 16, false, true);

        //Summon animation for state = 3
        //facing right = 0
        this.animations[3][0] = new Animator(this.spritesheet, 17, 492, 47, 58, 6, 0.1, 49, false, true);

        //facing left = 1
        this.animations[3][1] = new Animator(this.spritesheet, 31, 1450, 44, 59, 6, 0.1, 52, false, true);

    }

    update() {
        //First check if player triggered the enemy.
        if((Math.abs(this.x - this.enemyX) < 300 && Math.abs(this.y - this.enemyY) < 200) && !this.triggered) {
            this.triggered = true;
            this.summontime = Date.now();
        }

        if(this.triggered) {
            //Is it time to summon enemies?
            var summon = Date.now() - this.summontime;
            //If it is time to summon, channel.
            if(summon > this.summoncooldown) {
                this.decideDir();
                this.state = 3;
                //After 5 seconds of channel, summon fayeres.
                if(summon > this.summoncooldown+5000 && !this.summoned) {
                    this.bringSummons(); 
                    this.summoned = true;
                }
                //After 10 seconds of channel, do an attack yourself as well.
                if(summon >= this.summoncooldown+10000 && summon < this.summoncooldown+10900) {
                    this.decideDir();
                    this.state = 2;
                    if(Date.now() - this.attackbuffer >= this.fireRate) {
                        this.attack();
                        this.attackbuffer = Date.now();
                    }
                } 

                if(summon > this.summoncooldown+10500) {
                    this.summontime = Date.now();
                }
            } else {
                this.state = 0;
                this.decideDir();
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
        var p = new Newprojectiles(this.game, this.x, this.y, velocity, 5, 4000, 49, 337, 15, 14, 0.03);
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }

    bringSummons() {
        var fayereSummon = new Fayere(this.game, this.enemyX - 150, this.enemyY);
        var fayereSummon2 = new Fayere(this.game, this.enemyX + 150, this.enemyY);
        var fayereSummon3 = new Fayere(this.game, this.enemyX , this.enemyY - 150);
        var fayereSummon4 = new Fayere(this.game, this.enemyX, this.enemyY + 150);
        this.game.addEntity(fayereSummon);
        this.game.addEntity(fayereSummon2);
        this.game.addEntity(fayereSummon3);
        this.game.addEntity(fayereSummon4);
    }

    decideDir() {
        if(this.x - this.enemyX > 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }
};