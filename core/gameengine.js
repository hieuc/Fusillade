// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.entities = [];
        this.background = [];
        this.showOutlines = false;

        this.ctx = null;
        this.extra = false;
        this.click = null;
        this.hover = null;
        this.mouse = { x:0, y: 0 };
        this.wheel = null;
        this.left = false;
        this.right= false;
        this.up = false;
        this.down = false;
        this.gkey = false;
        this.spacekey = false;
        this.leftclick = false;
        this.ikey = false;

        this.started = false;
        this.ekey = false;
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

        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

            return { x: x, y: y };
        }

        this.ctx.canvas.addEventListener("keydown", e => {
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
                case ' ':
                    this.spacekey = true;
                    break;
                case 'e':
                    this.ekey = true;
                    break;
                case 'c':
                    that.camera.camlock = !that.camera.camlock;
                    break;
                case 'x': {
                    this.camera.offsetx = 0;
                    this.camera.offsety = 0;
                }
                case '1':
                    this.camera.inventory.current = 1;
                    break;
                case '2':
                    this.camera.inventory.current = 2;
                    break;
                case '3':
                    this.camera.inventory.current = 3;
                    break;
                case '4':
                    this.camera.inventory.current = 4;
                    break;
                case 'f':
                    this.camera.inventory.useItem();
                    break;
                case 'i':
                    this.ikey = !this.ikey;
                    break;
                default:
                    break;
                }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.key) {
                case 'd':
                    this.right = false;
                    break;
                case 'a':
                    this.left = false;
                    break;
                case 's':
                    this.down = false;
                    break;
                case 'w':
                    this.up = false;
                    break;
                case 'g':
                    this.gkey = false;
                    break;
                case ' ':
                    this.spacekey = false;
                    break;
                case 'e':
                    this.ekey = false;
                    break;
                default:
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("mousemove", e =>  {
            this.mouse = getXandY(e);
            if (this.started && !this.extra) {
                this.camera.merchant.determineHover(this.mouse);
            }

            if(!this.started) {
                this.hover = getXandY(e);
            }
        }, false);

        this.ctx.canvas.addEventListener("mousedown", e => {
            // only left click counts
            if (e.button === 0 && this.started) {
                this.click = getXandY(e);
                this.leftclick = true;
            }     
        }, false);

        this.ctx.canvas.addEventListener("mouseup", e => {
            // only left click counts
            if(e.button === 0 && this.started && !this.extra) {
                this.camera.merchant.determineClick(getXandY(e));
                this.leftclick = false;
            }

            if(!this.started && !this.extra) {
                this.click = getXandY(e);
            }

            if(this.extra) {
                this.entities[0].determineClick(getXandY(e));
            }
        }, false);

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.started ) {
                // scrolling up
                if (e.deltaY < 0 && !this.extra) {
                    this.camera.minimap.updateScale(-0.25);
                }
                // scrolling down
                else if (e.deltaY > 0 && !this.extra) {
                    this.camera.minimap.updateScale(0.25);
                }
            }

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

            if(this.extra && !entity.removeFromWorld) {
                entity.update();
            }

            if (this.camera.gameover) {
                if (entity === this.camera.char) {
                    entity.update();
                }
            } else {
                if (entity && !entity.removeFromWorld) {
                    entity.update();
                }
            }
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }

        // check when game over
        if (this.camera.gameover) {
            for (var i = this.background.length - 1; i >= 0; --i) {
                if (this.background[i].removeFromWorld) {
                    this.background.splice(i, 1);
                }
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