// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.entities = [];
        this.background = [];
        this.showOutlines = false;

        this.ctx = null;
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.left = false;
        this.right= false;
        this.up = false;
        this.down = false;
        this.gkey = false;
        this.qkey = false;

        this.started = false;
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
            if (!this.started) {
                this.started = true;
                this.camera.loadLevel1();
            } else {
                switch (e.key) {
                    case 'd':
                        that.right = true;
                        break;
                    case 'a':
                        that.left = true;
                        break;
                    case 's':
                        that.down = true;
                        break;
                    case 'w':
                        that.up = true;
                        break;
                    case 'g':
                        this.gkey = true;
                        break;
                    case 'q':
                        this.qkey = true;
                        break;
                    case 'c':
                        that.camera.camlock = !that.camera.camlock;
                        break;
                    case 'x': {
                        that.camera.offsetx = 0;
                        that.camera.offsety = 0;
                    }
                    default:
                        break;
                }
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.key) {
                case 'd':
                    that.right = false;
                    break;
                case 'a':
                    that.left = false;
                    break;
                case 's':
                    that.down = false;
                    break;
                case 'w':
                    that.up = false;
                    break;
                case 'g':
                    this.gkey = false;
                    break;
                case 'q':
                    this.qkey = false;
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
            if (that.started)
                that.camera.char.startAttack(that.click);
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

    // add background
    addBg(bg) {
        this.background.push(bg);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        for (var i = 0; i < this.background.length; i++) {
            if (this.isInWindow(this.background[i]))
                this.background[i].draw(this.ctx);
        }

        for (var i = 0; i < this.entities.length; i++) {
            if (this.isInWindow(this.entities[i]))
                this.entities[i].draw(this.ctx);
        }
        this.camera.draw(this.ctx);
    };

    // check if entity is on screen, relative to camera
    isInWindow(e) {
        var padding = 100;
        return e.x - this.camera.x > -padding && e.x - this.camera.x < PARAMS.canvas_width + padding
        && e.y - this.camera.y > -padding && e.y - this.camera.y < PARAMS.canvas_height + padding;
    }

    update() {
        var entitiesCount = this.entities.length;

        // background needs no update

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