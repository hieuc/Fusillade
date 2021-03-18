class Beam {
    constructor(game, x, y, pretime) {
        Object.assign(this, {game, x, y, pretime});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/beam.png");

        this.animation = new Animator(this.spritesheet, 0, 0, 80, 160, 16, 0.06, 0, false, false);
        this.scale = 0.8;
        this.phase = 0; // 0 = pre-landing, 1 = landing
        this.bound;
        this.damage = 150;
        if (!pretime)
            this.pretime = 600;
        this.timestamp = Date.now();
        this.dealtdmg = false;
    }

    update() {
        if (this.phase === 0 && Date.now() - this.timestamp >= this.pretime)
            this.phase = 1;
        else if (this.phase === 1) {
            if (this.animation.isAlmostDone(this.game.clockTick)) {
                this.removeFromWorld = true;
            } else if (this.animation.currentFrame() > 3) {
                this.bound = null;
            } else if (this.animation.currentFrame() > 2) {
                // only have bound when landed
                this.bound = new BoundingCircle(this.game, this.x, this.y, 40 * this.scale);
            }
        }
            
    }

    draw(ctx) {
        // pre-land
        if (this.phase === 0) {
            // draw bound
            
            ctx.strokeStyle = '#ff4545';
            ctx.beginPath();
            ctx.arc(this.x - this.game.camera.x, this.y - this.game.camera.y, 40 * this.scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath(); 

            // draw closing bound
            var closingRadius = 40 * this.scale *(1 - (Date.now() - this.timestamp) / this.pretime);
            if (closingRadius > 0) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.beginPath();
                ctx.arc(this.x - this.game.camera.x, this.y - this.game.camera.y, 
                    closingRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else { // after landed
            //var p = this.getP(this.x - 80 * this.scale, this.y - 130 * this.scale);
            
            this.animation.drawFrame(this.game.clockTick, ctx, this.x - 40 * this.scale - this.game.camera.x, 
                this.y - 130 * this.scale - this.game.camera.y, this.scale);
            
        }
        if (PARAMS.debug && this.bound) {
            this.bound.draw(this.game, ctx);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - this.game.camera.x - 5, this.y - this.game.camera.y - 5, 10, 10);
        }
    }

    getP(x, y) {
        var o = 560;
        var p = {};
        x-= o ;
        y-= o ;
        p.x = x * Math.cos(this.game.camera.rotation) + y * Math.sin(this.game.camera.rotation);
        p.y = -x * Math.sin(this.game.camera.rotation) + y * Math.cos(this.game.camera.rotation);
        p.x -= this.game.camera.x - o ;
        p.y -= this.game.camera.y - o ;
        return p;
    }

    hit(target) {
        if (!this.dealtdmg) {
            target.hp.current -= this.damage;
            this.game.addEntity(new Score(this.game, target.bound.x + target.bound.w/2 + randomInt(21) - 10, 
                    target.bound.y + target.bound.h / 2 + randomInt(21) - 10, this.damage));
            this.dealtdmg = true;
        }
    }
}