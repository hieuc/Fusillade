class HealthBar {
    constructor(x, y, w, max) {
        Object.assign(this, { x, y, w, max});
        
        this.current = max;
        this.h = 6;
    }

    draw(ctx,game) {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x - game.camera.x, this.y - game.camera.y, this.w, this.h);

        var percentage = this.current / this.max;
        
        if (percentage < 0) percentage = 0;
        ctx.fillStyle = this.getColor(percentage);
        ctx.fillRect(this.x - game.camera.x, this.y - game.camera.y, this.w * percentage, this.h);
    }

    /**
     * Get color from green to red based on scale value.
     * 
     * @param {Double} value a scale from 0-1
     */
    getColor(value) {
        // this function was originally designed to give green color at 0, red at 1
        // reversing value for it to make sense as an hp bar
        value = 1- value;
        if (value < 0 || value > 1) {
            return 'rgb(255, 0, 0)';
        }


        var r;
        var g;

        if (value / 0.5 <= 1) {
            g = 1;
            r = value * 2;
        } else {
            g = 1 - (value - 0.5) * 2;
            r = 1;
        }
        return `rgb(${Math.round(255 * r)}, ${Math.round(255 * g)}, 0)`;
    }
}