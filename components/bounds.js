class BoundingBox {
    constructor( game, x, y, w, h) {
        Object.assign(this, { game, x, y, w, h });

        this.left = x;
        this.top = y;
        this.right = this.left + this.w;
        this.bottom = this.top + this.h;
    };

    collide(oth) {
        if (oth instanceof BoundingBox)
            if (this.right >= oth.left && this.left <= oth.right && this.top <= oth.bottom && this.bottom >= oth.top) 
                return true; 

        if (oth instanceof BoundingCircle && oth.collide(this))
            return true;

        return false;
    };

    update(x, y) {
        this.x = x;
        this.y = y;
        this.left = x;
        this.top = y;
        this.right = this.left + this.w;
        this.bottom = this.top + this.h;
    }

    draw() {
        var ctx = this.game.ctx;
        ctx.strokeStyle = 'Red';
        ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.w, this.h);
    }
};

class BoundingCircle {
    constructor( game, x, y, r) {
        Object.assign(this, { game, x, y, r});
        
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

    update(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        var ctx = this.game.ctx;
        ctx.strokeStyle = 'Red';
        ctx.beginPath();
        ctx.arc(this.x - this.game.camera.x, this.y - this.game.camera.y, this.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}