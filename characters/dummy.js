/**
 * Class to test patterns and animations.
 */
class Dummy {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.sprite = ASSET_MANAGER.getAsset("./sprites/dummy.png");

        this.scale = 1.5;

        this.speed = 1;

        this.timestamp = Date.now();

        this.attack3();
    }

    update() {
        
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, 0, 0, 17, 28, this.x, this.y, 17 * this.scale,  28 * this.scale);
    }

    /*
    * This is a templete for creating new moves
    */
    attackPrototype() {
        // "that" is a reference to the projectile object
        var that = this;
        
        
        // update movement during attack like this
        this.update = function (){}

        // finally update shooting pattern 
        var pattern = async function() {

        }

        // use await sleep(<DELAY>) to delay shots
        
        // set attack cooldown:
        // setInterval(pattern, <DELAY>);

        // to choose this pattern, use it in the constructor
    }

    /**
     * Spiral pattern.
     * 
     * @param {*} 
     */
    attack1() {
        var that = this;
        this.update = function (){}

        var pattern = async function () {
            var n = 16;
            for (var i = 0; i < n; i++) {
                var velocity = that.calculateVel(Math.PI / n * i * 2);
                var p = new Projectiles(that.game, that.x, that.y, velocity, 3, 2000);
                that.game.entities.splice(that.game.entities.length - 1, 0, p);
                await that.sleep(100);
            }
        }
        setInterval(pattern, 2000);
    }  

    /**
     * moving in circle while shoot in 6 directions
     * 
     * @param {*} that 
     */
    attack2() {
        var that = this;
        this.timestamp = Date.now();
        this.update = function () {
            var radius = 2.5;
            // radius and speed are not reflecting corerctly, have to modify function somehow
            that.x += Math.cos((Date.now() - that.timestamp) / 1000 * that.speed) * radius * that.speed;
            that.y += Math.sin((Date.now() - that.timestamp) / 1000 * that.speed) * radius * that.speed;
        }
        
        var pattern = function () {
            var n = 6;
            for (var i = 0; i < n; i++) {
                var velocity = that.calculateVel(Math.PI / n * i * 2);
                var p = new Projectiles(that.game, that.x, that.y, velocity, 3, 2000);
                that.game.entities.splice(that.game.entities.length - 1, 0, p);
            }
        }

        setInterval(pattern, 800);
    }
    /**
     * Alternating boomerang shots
     */
    attack3() {
        var that = this;
        this.timestamp = Date.now();

        this.update = function () {};
        var n = 6; // <------------ change number of projectiles here
        var delay = 800;

        var pattern = async function() {
            // shoot outward 6 directions
            
            for (var i = 0; i < n; i++) {
                var velocity = that.calculateVel(Math.PI / n * i * 2);
                var p = new Boomerang(that.game, that.x, that.y, velocity, 3, 2000, 0.55);
                that.game.entities.splice(that.game.entities.length - 1, 0, p);
            }
            await that.sleep(delay);
            for (var i = 0; i < n; i++) {
                var velocity = that.calculateVel(Math.PI / n * i * 2 - Math.PI / n);
                var p = new Boomerang(that.game, that.x, that.y, velocity, 3, 2000, 0.55);
                that.game.entities.splice(that.game.entities.length - 1, 0, p);
            }

            // boomerang
        }

        setInterval(pattern, delay * 2);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Return x and y velocity based on shooting angle
     * 
     * @param {*} angle in radians
     */
    calculateVel (angle) {
        var v = { x: Math.cos(angle),
                    y: Math.sin(angle)};
        
        return v;
    }

    
}