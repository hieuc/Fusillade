class BoundingBox {
    constructor(x, y, w, h) {
        Object.assign(this, { x, y, w, h });

        this.left = x;
        this.top = y;
        this.right = this.left + this.w;
        this.bottom = this.top + this.h;
    };

    collide(oth) {
        if (oth instanceof BoundingBox && 
                this.right > oth.left && this.left < oth.right && 
                this.top < oth.bottom && this.bottom > oth.top) 
            return true;

        if (oth instanceof BoundingCircle && oth.collide(this))
            return true;

        return false;
    };

    draw(ctx, game) {
        ctx.strokeStyle = 'Red';
        ctx.strokeRect(this.x - game.camera.x, this.y - game.camera.y, this.w, this.h);
    }
};

class BoundingCircle {
    constructor(x, y, r) {
        Object.assign(this, {x, y, r});
        
    }

    collide(oth) {
        if (oth instanceof BoundingCircle) {
            var dx = this.x - oth.x;
            var dy = this.y - oth.y;
            var d = Math.sqrt(dx * dx + dy * dy)

            if (d < this.r + oth.r)
                return true;
        } else {
            var dx = Math.abs(this.x - oth.x-oth.w/2);
            var dy = Math.abs(this.y - oth.y-oth.h/2);


            if (dx > (oth.w/2 + this.r)) return false;
            if (dy > (oth.h/2 + this.r)) return false;
            if (dx <= (oth.w/2)) return true; 
            if (dy <= (oth.h/2)) return true;

            dx=dx-oth.w/2;
            dy=dy-oth.h/2;

            return dx*dx+dy*dy<=(this.r*this.r);
        }
    }

    draw(ctx, game) {
        ctx.strokeStyle = 'Red';
        ctx.beginPath();
        ctx.arc(this.x - game.camera.x, this.y - game.camera.y, this.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}