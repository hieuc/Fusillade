class HealthBar {
    constructor(game, x, y, max) {
        Object.assign(this, {game, x, y, max, w});
        
        this.current = max;

    }

    draw() {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.w, 8);

        
    }
}