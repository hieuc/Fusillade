class Propportal {
    constructor(game, x, y, enemyspawn) {
        Object.assign(this, {game, x, y, enemyspawn});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/Portal.png");

        this.state = 0;

        this.spawnenemy = true;

        this.method = this.enemyspawn;

        this.scale = 2.0;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {

        this.animations[1] = new Animator(this.spritesheet, 0, 0, 64, 64, 8, 0.15, 0, false, true);

        this.animations[0] = new Animator(this.spritesheet, 0, 64, 64, 64, 8, 0.1, 0, false, false);

        this.animations[2] = new Animator(this.spritesheet, 0, 128, 64, 64, 8, 0.15, 0, false, false);

    }

    update() {
        if(this.state == 0 && this.animations[this.state].isAlmostDone(this.game.clockTick)) {
            this.state = 1;
            this.createdtime = Date.now();
        } else if(Date.now() - this.createdtime > 2300) {
            this.state = 2;
            if(this.spawnenemy) {
                this.makeEnemy();
                this.spawnenemy = false;
            }
            this.createdtime = Date.now(); //reset date so we don't hit this case.
        } else if(this.state == 2 && this.animations[this.state].isAlmostDone(this.game.clockTick)) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    makeEnemy() {
        switch(this.enemyspawn) {
            case "Fayere":
                this.game.addEntity(new Fayere(this.game, this.x+46, this.y+46)); //Offset with sprite size.
                break;
            case "Ais":
                this.game.addEntity(new Ais(this.game, this.x + 46, this.y+46));
                break;
            case "Cyclops":
                this.game.addEntity(new Cyclops(this.game, this.x, this.y));
                break;
            default:
        }
    }
}