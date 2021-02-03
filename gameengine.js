// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.entities = [];
        this.showOutlines = false;
        this.ctx = null;
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
    };

    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    };

    startInput() {
        var that = this;
        var c = that.entities[that.entities.length-1];

        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

            return { x: x, y: y };
        }

        this.ctx.canvas.addEventListener("keydown", e => {
            switch (e.key) {
                case 'd':
                    if (c.velocity.x < 1)
                        c.velocity.x++;
                    break;
                case 'a':
                    if (c.velocity.x > -1)
                        c.velocity.x--;
                    break;
                case 's':
                    if (c.velocity.y < 1)
                        c.velocity.y++;
                    break;
                case 'w':
                    if (c.velocity.y > -1)
                        c.velocity.y--;
                    break;
                default:
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.key) {
                case 'd':
                    c.velocity.x = 0;
                    break;
                case 'a':
                    c.velocity.x = 0;
                    break;
                case 's':
                    c.velocity.y = 0;
                    break;
                case 'w':
                    c.velocity.y = 0;
                    break;
                default:
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("mousemove", function (e) {
            //console.log(getXandY(e));
            that.mouse = getXandY(e);
        }, false);

        this.ctx.canvas.addEventListener("click", function (e) {
            that.click = getXandY(e);
            c.startAttack(that.click);
        }, false);

        this.ctx.canvas.addEventListener("wheel", function (e) {
            //console.log(getXandY(e));
            that.wheel = e;
            //       console.log(e.wheelDelta);
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("contextmenu", function (e) {
            //console.log(getXandY(e));
            that.rightclick = getXandY(e);
            e.preventDefault();
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
        this.camera.draw(this.ctx);
    };

    update() {
        var entitiesCount = this.entities.length;

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if(entity.isEnemy == true) {
                for(var j = 0; j < entitiesCount; j++) {
                    if(this.entities[j] instanceof Rutherford) {
                        entity.getEnemyPos(this.entities[j].x, this.entities[j].y);
                        break;
                    }
                }
            }

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
        this.camera.update();
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };
};