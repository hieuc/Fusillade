class Buckportal extends Enemy {
    constructor(game, x, y, health, totalhealth, form, angle, startX, startY) {
        super(game, x, y);
        Object.assign(this, { health, totalhealth, form, angle, startX, startY});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Portal.png");

        this.state = 0;

        this.scale = 2.0;

        this.bound = new BoundingBox(this.game, this.x+45, this.y+50, 40, 60);

        this.centerpos = {x: this.x+this.startX, y:this.y+this.startY}; //We want to center around the map considering where we are called and where we want to move to.

        //this.angle = 0;

        this.unitsaway = 800;

        this.attack = false;

        this.projcount = 0;

        this.attacks = 0;

        this.takehits = true;

        this.fireRate = 150;

        this.attacktime = Date.now();

        this.createdtime = Date.now();
        
        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[1] = new Animator(this.spritesheet, 0, 0, 64, 64, 8, 0.15, 0, false, true);

        this.animations[0] = new Animator(this.spritesheet, 0, 64, 64, 64, 8, 0.1, 0, false, false);

        this.animations[2] = new Animator(this.spritesheet, 0, 128, 64, 64, 8, 0.15, 0, false, false);

    }

    update() {
        if(!this.attack) {
            if(this.state == 0 && this.animations[this.state].isAlmostDone(this.game.clockTick)) {
                this.state = 1;
                this.createdtime = Date.now();
            } else if(Date.now() - this.createdtime > 2300) {
                this.state = 2;
                this.createdtime = Date.now(); //reset date so we don't hit this case.
            } else if(this.state == 2 && this.animations[this.state].isAlmostDone(this.game.clockTick)) {
                this.attack = true;
                this.state = 1;
                this.bound = new BoundingBox(this.game, 0, 0, 0, 0);
                this.takehits = false;
                this.attacks = Math.floor(this.projcount + (this.projcount/2) * (0.05 * (this.totalhealth - this.health))); //+1 in case no damage.
            }
        } else {
            if(this.attacks > 0) {
                this.x = this.unitsaway*Math.cos(this.angle) + this.centerpos.x;
                this.y = this.unitsaway*Math.sin(this.angle) + this.centerpos.y;
                if(Date.now() - this.attacktime > this.fireRate) {
                    this.fire();
                    this.attacktime = Date.now();
                }
                this.angle += Math.PI/90;
            } else {
                this.removeFromWorld = true;
            }
        }


        //Collision
        if(this.takehits) {
            var that = this;
            this.game.entities.forEach(function (entity) {
                if (entity.bound && that.bound.collide(entity.bound)) {
                    if(entity instanceof Projectiles && !entity.friendly) {
                        entity.removeFromWorld = true;
                        ASSET_MANAGER.playAsset("./sounds/sfx/warpI.mp3");
                        that.projcount++;
                    } else {
                        //nothing really.
                    }
                }
            })
        }

    }

    calculateVel() {
        var dx = this.centerpos.x - this.x;
        var dy = this.centerpos.y - this.y;
        var angle = Math.atan(dy/dx);

        var v = { x: Math.cos(angle),
                 y: Math.sin(angle)};
        
        if (dx < 0)
            v.x *= -1;

        if ((angle > 0 && dy < 0) || (angle < 0 && dy > 0))
            v.y *= -1;
        
        return v;
    }

    fire() {
        var velocity = this.calculateVel();
        var pp = this.form == 1? {sx: 96, sy:160, size: 16}:{sx: 96, sy: 112, size: 16};
        var p = new Projectiles(this.game, false, this.x+50, this.y+40, velocity, 4.5, 2500, 10, pp);
        this.attacks--;
        ASSET_MANAGER.playAsset("./sounds/sfx/warpO.mp3");
        this.game.entities.splice(this.game.entities.length - 1, 0, p);
    }


    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }
}