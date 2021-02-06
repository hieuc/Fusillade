class Cyclops
{
    constructor(game, x, y) 
    {
        Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Cyclops.png");

        this.scale = 2;

        this.state = 0; //0 = idle, 1 = move, 2 = attack, 3 = die

        this.face = 0; // 0 = right, 1 = left

        this.patterntimer = Date.now();

        //this.speed = 1.2;

        // this.toofarmovement = Date.now(); //We want to give a behavior pattern when enemy is too far.

        // this.attackpatterntime = Date.now(); //When are in attack range, do time interval patterns.

        // this.attackbuffer = Date.now(); //Used to calculate when the last shot was fired.

        // this.fireRate = 300; //in milliseconds.

        this.enemypos = { enemyX: 0, enemyY: 0};

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() 
    {
        for (var i = 0; i < 4; i++) { // 4 states
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

    }


    update()
    {
        var time = Date.now() - this.patterntimer;
        if(time < 2500) {
            this.state = 0;
            this.face = 0;
        } else if(time >= 2500 && time < 5000) {
            this.state = 0;
            this.face = 1;
        } else if(time >= 5000 && time < 7500) {
            this.state = 1;
            this.face = 0;
        } else if(time >= 7500 && time < 10000) {
            this.state = 1;
            this.face = 1;
        } else if(time >= 10000 && time < 12500) {
            this.state = 2;
            this.face = 0;
        } else if(time >=12500 && time < 15000) {
            this.state =2;
            this.face = 1;
        } else if(time >= 15000 && time < 17500) {
            this.state = 3;
            this.face = 0;
        } else if(time >=17500 && time < 20000) {
            this.state = 3;
            this.face = 1;
        }
    }



    draw(ctx)
    {
        this.animations[this.state][this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
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

};