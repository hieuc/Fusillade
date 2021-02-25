/**
 * Parent class for all projectiles.
 */
class Projectiles {
    /**
     * 
     * @param {*} game instance of game
     * @param {boolean} friendly true if shot by rutherford, false otherwise 
     * @param {*} x position
     * @param {*} y position
     * @param {vector} velocity the direction that the projectile is heading
     * @param {*} speed how fast projectile is moving
     * @param {*} lifetime how long the projectile staying on screen (ms)
     * @param {*} damage damage inflicting on impact
     * @param {object} proj property of projectile's sprite: spritesheet, starting x,y to draw, size, scale, effect
     * @param {string} effect the particle effect when projectile hit something
     */
    constructor(game, friendly, x, y, velocity, speed, lifetime, damage, proj, effect) {
        Object.assign(this, { game, friendly, x, y, velocity, speed, lifetime, damage, effect});

        // proj is an object of projectile's properties
        // proj.size is the original sprite size
        // proj.scale is the scaling when draw to canvas
        

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

        
        if (!this.proj.scale)
            this.proj.scale = 2;

        this.bound = new BoundingCircle(this.game, this.x + this.proj.size * this.proj.scale /2, 
            this.y + this.proj.size * this.proj.scale/2, this.proj.size * this.proj.scale /2);
        


        // create sprite based on its direction, used to draw
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
        this.bound.update(this.x + this.proj.size * this.proj.scale /2, this.y + this.proj.size * this.proj.scale/2);
    }

    draw(ctx) {
        //ctx.drawImage(this.spritesheet, 96, 96, 16, 16, this.x, this.y, 16 * this.scale, 16 * this.scale);
        ctx.drawImage(this.rotatedSprite, this.x - this.game.camera.x, this.y - this.game.camera.y, this.proj.size * this.proj.scale, this.proj.size * this.proj.scale);
        
        if (PARAMS.debug) {
            this.bound.draw();
        }
    }

    // handle hit effects : do damage, draw damage indicator, draw damage effects, remove from world.
    hit(target) {
        target.hp.current -= this.damage;
        this.game.addEntity(new Score(this.game, target.bound.x + target.bound.w/2 + randomInt(21) - 10, 
                    target.bound.y + target.bound.h / 2 + randomInt(21) - 10, this.damage));
        this.drawEffect();
        this.removeFromWorld = true;
    }

    /**
     * Release the particle effect of projectile, use when hit.
     */
    drawEffect() {
        var effect = this.decideParticleEffect();
        if (effect)
            this.game.addEntity(effect);
    }

    
    decideParticleEffect() {
        var r;

        if (this.effect === "star") {
            r = new Star(this.game, this.x - this.proj.scale * this.proj.size/2 , this.y - this.proj.scale * this.proj.size );
        } else if (this.effect === "burn") {
            r = new Burn(this.game, this.x - 60, this.y - 60);
        }
        return r;
    }

    /**
     * Return a canvas object of the rotated sprite, based on the provided angle
     * 
     * @param {*} angle in radians
     */
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