class Projectiles {
    constructor(game, friendly, x, y, velocity, speed, lifetime, proj) {
        Object.assign(this, { game, friendly, x, y, velocity, speed, lifetime});

        // proj is an object of projectile's properties

        // if no property provided, use default
        if (proj) {
            this.proj = proj;
        } else {
            this.proj = PARAMS.default_projectile;
        }

        // if no spritesheet provided, use default
        if (!this.proj.spritesheet) {
            this.proj.spritesheet = PARAMS.default_p_sheet;
        }

        this.bound = new BoundingCircle(this.x, this.y, this.proj.size);
        

        if (!this.proj.scale)
            this.proj.scale = 2;

        this.rotatedSprite = this.rotate(Math.atan(this.velocity.y / this.velocity.x) + (this.velocity.x <= 0 ? Math.PI : 0));
        
        this.timestamp = Date.now();
    }

    loadAnimations() {

    }

    update() {
        // if lifetime expired
        if (Date.now() - this.timestamp > this.lifetime)
            this.removeFromWorld = true;
        else {
            this.x += this.speed * this.velocity.x;
            this.y += this.speed * this.velocity.y;
        }
        this.updateBound();
    }

    updateBound() {
        this.bound.x = this.x + this.proj.size;
        this.bound.y = this.y + this.proj.size;
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        ctx.drawImage(this.rotatedSprite, this.x - this.game.camera.x, this.y - this.game.camera.y, this.proj.size * this.proj.scale, this.proj.size * this.proj.scale);
        
        if (PARAMS.debug) {
            this.bound.draw(ctx, this.game);
        }
    }

    rotate(angle) {
        var c2 = document.createElement("canvas");
        c2.width = this.proj.size * this.proj.scale;
        c2.height = this.proj.size * this.proj.scale;
        var ctx2 = c2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.save();
        ctx2.translate(this.proj.size * this.proj.scale / 2, this.proj.size * this.proj.scale / 2);
        ctx2.rotate(angle);
        ctx2.translate(-this.proj.size * this.proj.scale / 2, -this.proj.size * this.proj.scale / 2);
        ctx2.drawImage(this.proj.spritesheet, this.proj.sx, this.proj.sy, this.proj.size, this.proj.size, 
            0, 0, this.proj.size * this.proj.scale, this.proj.size * this.proj.scale);

        return c2;
    }
}