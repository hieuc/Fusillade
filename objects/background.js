class Ground {
    constructor(game, x, y, p) {
        Object.assign(this, { game, x, y, p});
    };

    update() {

    }

    draw(ctx) {
        ctx.drawImage(this.p.spritesheet, this.p.sx, this.p.sy, this.p.width, this.p.height, 
            this.x - this.game.camera.x, this.y - this.game.camera.y, 
            this.p.width * this.p.scale, this.p.height * this.p.scale);
    }
}

class Planet {
    constructor(game, x, y, speed, r, n) {
        Object.assign(this, { game, x, y, speed, r, n});
        // assuming the radius is the center of the map of level 3
        this.scale = 3;
        this.width = 16;
        this.height = 16;
        this.center = 624 - 16*this.scale/2;
        this.angle = 0;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");
        this.p = [{ sx: 240, sy: 80},   // mercury
                { sx: 224, sy: 80},     // venus
                { sx: 224, sy: 112},    // earth
                { sx: 208, sy: 80},     // mars
                { sx: 224, sy: 128},    // jupiter
                { sx: 224, sy: 96},     // saturn  
                { sx: 208, sy: 96},     // urANUS
                { sx: 208, sy: 128}]    // neptune
    }

    update() {
        this.angle--;
        this.x = this.r*Math.cos(Math.PI*this.angle/3000*this.speed) + this.center;
        this.y = this.r*Math.sin(Math.PI*this.angle/3000*this.speed) + this.center;
    }

    draw(ctx) {
        ctx.drawImage(this.spritesheet, this.p[this.n].sx, this.p[this.n].sy, this.width, this.height, 
            this.x - this.game.camera.x, this.y - this.game.camera.y, 
            this.width * this.scale, this.height * this.scale);
    }
}