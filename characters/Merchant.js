class Merchant {
    constructor(game, x, y, level) {
        Object.assign(this, {game, x, y, level});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/merchan.png");

        this.textsheet = ASSET_MANAGER.getAsset("./sprites/GUI.png");

        this.potionsheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");

        this.petsheet = ASSET_MANAGER.getAsset("./sprites/Dine-O.png");

        this.tickorxsheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");

        this.ss = 80;

        this.playonce = true;

        this.playsoundtimer = Date.now();

        this.playfirst = true;

        this.playsecond = true;

        this.scale = 2;

        this.showTextTimer = Date.now();

        this.textIndex = 0;

        this.dialoguenum = this.level == 1? firstEncounterStory: this.level == 2? secondEncounterStory: thirdEncounterStory;

        /**
         * ALL THE HOVERING CHECKS ARE HERE.
         */

        this.hoveredbuy = false;

        this.hoveredtalk = false;

        this.hoveredbuy0 = false;

        this.hoveredbuy1 = false;
        
        this.hoveredbuy2 = false;

        this.hoveredbuy3 = false;
        
        this.hoveredbuy4 = false;

        this.hoveredbuy5 = false;

        this.hoveredbuy6 = false;

        this.hoveredback = false;

        /**
         * TO HERE
         */

        this.currChoice = main;

        this.success = false;

        this.itemno = 0;

        this.successtimer = Date.now();

        this.failure = false;
        
        this.failuretimer = Date.now();

        this.textappearDuration = 15000;

        this.animations = [];

        this.showtext = false;

        this.mainmenu = true;

        this.shop = false;

        this.textlocation = {textX: PARAMS.canvas_width*0.557, textY: PARAMS.canvas_height*0.47};

        this.textlocationbuy = {textX: PARAMS.canvas_width*0.57, textY: PARAMS.canvas_height*0.445};

        this.rutherpos = this.game.camera.char.x; //Don't need to know Y.

        this.face = 0;

        this.bound = new BoundingBox(this.game, this.x-40, this.y-40, 240, 240);

        this.loadAnimations();
    }

    loadAnimations() {
        //Facing right
        this.animations[0] = new Animator(this.spritesheet, 480, 80, 80, 80, 4, 1.9, 0, true, true);

        //Facing left 
        this.animations[1] = new Animator(this.spritesheet, 0, 0, 80, 80, 4, 1.9, 0, false, true);

        //Textbox
        this.animations[2] = new Animator(this.textsheet, 145, 65, 46, 15, 1, 1, 0, false, true);

        //Textbox For Joining (upper half)
        this.animations[4] = new Animator(this.textsheet, 0, 96, 48, 13, 1, 1, 0, false, true);

        this.animations[5] = new Animator(this.textsheet, 0, 96, 48, 33, 1, 1, 0, false, true);

    }

    update() {
        //Get rutherford's position.
        this.rutherpos = this.game.camera.char.x;
        this.decideDir();

        //Are we close enough to talk
        this.showtext = false;
        
        this.checkCollisions();

        //If we are not in range, then reset everything to normal.
        if(!this.showtext) {    
            this.mainmenu = false;
            this.shop = false;
            this.currChoice = main;
            this.textIndex = 0;
            this.showTextTimer = Date.now();
        }
    }

    draw(ctx) {
        if (PARAMS.debug) {
            this.bound.draw();
        }

        //If we are in talking range, call this method.
        if(this.showtext) {
            this.writeText(this.currChoice);
        }
        this.animations[this.face].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
    }

    decideDir() {
        if(this.x - this.rutherpos+50> 0) {
            this.face = 1;
        } else {
            this.face = 0;
        }
    }

    checkCollisions() {
        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity.bound && that.bound.collide(entity.bound)) {
                if(entity instanceof Rutherford) {
                    that.showtext = true;
                    that.mainmenu = true;

                } 
            }
        })
    }

    writeText() {
        //Get the canvas
        var canvas = document.getElementById("gameWorld");
        var ctx = canvas.getContext("2d");
        //THIS IS THE COLOR OF THE FONT.
        ctx.fillStyle = "#ffffff";
        //If right now, we have decided to hit "buy" show an "extended" dashboard that accomodates everything.
        if(this.currChoice == itemsToSell) {
            this.animations[5].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2 - 130, 11);
            this.animations[4].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 27, PARAMS.canvas_height/2 - 175, 6);
        } else {
            //Otherwise, show a normal dashboard for other cases.
            if(this.currChoice != main) {
                this.animations[5].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2 - 100, 10);
            } else {
                this.animations[5].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20 , PARAMS.canvas_height/2 - 100, 8.3);
            }
        }
        //Font style
        ctx.font = "Bold 14px Trebuchet MS";

        //If we are in main right now.
        if(this.currChoice === main) {
            //Lock down all the other things.
            this.shop = false;
            ctx.fillText(this.currChoice[0], this.textlocation.textX, this.textlocation.textY);
            if(this.hoveredbuy) {
                ctx.fillStyle = "#000000";
            }
            ctx.fillText(this.currChoice[1], this.textlocation.textX, this.textlocation.textY+30);
            ctx.fillStyle = "#ffffff";
            if(this.hoveredtalk) {
                ctx.fillStyle = "#000000";
            }
            ctx.fillText(this.currChoice[2], this.textlocation.textX, this.textlocation.textY+50); 
            ctx.fillStyle = "#ffffff"; 
            ctx.fillText(this.currChoice[3], this.textlocation.textX, this.textlocation.textY+70); 
            this.showTextTimer = Date.now(); 
        //If we are inside the "buy" option.
        } else if(this.currChoice === itemsToSell) {
            //Set main menu to be false and shop to be true.
                this.mainmenu = false;
                this.shop = true;
                ctx.font = "Bold 18px Trebuchet MS";
                ctx.fillStyle = "#FFD700";
                ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+12, this.textlocationbuy.textY-90, 50, 37);
                ctx.fillText(this.game.camera.char.coins, this.textlocationbuy.textX+70, this.textlocationbuy.textY-65);
                ctx.fillStyle = "#ffffff"; 
                ctx.font = "Bold 14px Trebuchet MS";
                if(this.hoveredbuy0) {
                    ctx.fillStyle = "#000000";
                }
                ctx.fillText(this.currChoice[this.textIndex], this.textlocationbuy.textX+20, this.textlocationbuy.textY);
                ctx.fillStyle = "#ffffff"; 
                //Draw the small potion icon.
                ctx.drawImage(this.potionsheet, 3, 160, 14, 16, this.textlocationbuy.textX, this.textlocationbuy.textY-15, 16, 16);
                //Draw coin
                ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+197, this.textlocationbuy.textY-15, 24, 18);
                //If the purchase was successful, and THIS item 0 was purchased and the user hasn't immediately tried to buy again and it failed
                if(this.success && this.itemno == 0 && !this.failure) {
                    //Draw the tick to show it was successful.
                    ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY-15, 16, 16);
                    if(Date.now() - this.successtimer > 3000) {
                        this.success = false;
                    }
                //If the user tried to buy, but they weren't able to, show an X mark.
                } else if(this.failure && this.itemno == 0) {
                    ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY-15, 16, 16);
                    if(Date.now() - this.failuretimer > 3000) {
                        this.failure = false;
                        this.success = false;
                    }
                }
                if(this.currChoice[this.textIndex + 1] !== undefined)
                    if(this.hoveredbuy1) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 1], this.textlocationbuy.textX+20, this.textlocationbuy.textY+30);  
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.potionsheet, 3, 160, 14, 16, this.textlocationbuy.textX, this.textlocationbuy.textY+15, 16, 16);
                    //coin image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+189, this.textlocationbuy.textY+15, 24, 18);
                    if(this.success && this.itemno == 1 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+15, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 1) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+15, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 2] !== undefined)  
                    if(this.hoveredbuy2) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 2], this.textlocationbuy.textX+20, this.textlocationbuy.textY+60);
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.potionsheet, 34, 160, 16, 16, this.textlocationbuy.textX, this.textlocationbuy.textY+45, 16, 16);
                    //coin image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+172, this.textlocationbuy.textY+45, 24, 18);
                    if(this.success && this.itemno == 2 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+45, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 2) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+45, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 3] !== undefined)
                    if(this.hoveredbuy3) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 3], this.textlocationbuy.textX+20, this.textlocationbuy.textY+90);
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.potionsheet, 66, 160, 16, 16, this.textlocationbuy.textX, this.textlocationbuy.textY+75, 16,16);
                    //coin image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+187, this.textlocationbuy.textY+75, 24, 18);
                    if(this.success && this.itemno == 3 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+75, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 3) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+75, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 4] !== undefined) 
                    if(this.hoveredbuy4) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 4], this.textlocationbuy.textX+20, this.textlocationbuy.textY+120);
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.potionsheet, 50, 160, 16, 16, this.textlocationbuy.textX, this.textlocationbuy.textY+105, 16,16);
                    //coin image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+182, this.textlocationbuy.textY+105, 24, 18);
                    if(this.success && this.itemno == 4 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+105, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 4) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+105, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 5] !== undefined)
                    if(this.hoveredbuy5) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 5], this.textlocationbuy.textX+20, this.textlocationbuy.textY+150);
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.potionsheet, 82, 160, 16, 16, this.textlocationbuy.textX, this.textlocationbuy.textY+135, 16,16);
                    //coin image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+192, this.textlocationbuy.textY+135, 24, 18);
                    if(this.success && this.itemno == 5 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+135, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 5) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 230, this.textlocationbuy.textY+135, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 6] !== undefined)  
                    if(this.hoveredbuy6) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 6], this.textlocationbuy.textX+20, this.textlocationbuy.textY+180);
                    ctx.fillStyle = "#ffffff"; 
                    ctx.drawImage(this.petsheet, 0, 0, 24, 24, this.textlocationbuy.textX-4, this.textlocationbuy.textY+165, 24,24);
                    //coi image
                    ctx.drawImage(this.potionsheet, 160, 132, 33, 24, this.textlocationbuy.textX+310, this.textlocationbuy.textY+165, 24, 18);
                    if(this.success && this.itemno == 6 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocationbuy.textX + 340, this.textlocationbuy.textY+165, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 6) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocationbuy.textX + 340, this.textlocationbuy.textY+165, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 7] !== undefined)  
                    if(this.hoveredback) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 7], this.textlocationbuy.textX+20, this.textlocationbuy.textY+210);
                    ctx.fillStyle = "#ffffff"; 
        } else {
            //THIS SECTION TRIGGERS ONLY WHEN YOU HIT 'TALK TO ME'
            this.mainmenu = false;
            this.shop = false;
            //We show 3 sentences at a time for textappearDuration i.e. 7.5 seconds.
            if(Date.now() - this.showTextTimer < this.textappearDuration) {
                if(this.level == 2 && Date.now() - this.playsoundtimer > this.textappearDuration*3+400) {
                    if(this.playonce)
                        ASSET_MANAGER.playAsset("./sounds/sfx/ohmygod.mp3", 4);
                        this.playonce = false;
                } 

                if(this.playfirst) {
                    if(this.level == 3 && Date.now() - this.playsoundtimer > this.textappearDuration) {
                        ASSET_MANAGER.playAsset("./sounds/sfx/merchantpop.mp3", 4);
                        this.playfirst = false;
                    }
                } 

                if(this.playsecond) {
                    if(this.level == 3 && Date.now() - this.playsoundtimer > this.textappearDuration + 5000) {
                        ASSET_MANAGER.playAsset("./sounds/sfx/rutherfordpop.mp3", 4);
                        this.playsecond = false;
                    }
                }
                ctx.fillText(this.currChoice[this.textIndex], this.textlocation.textX+10, this.textlocation.textY+10);
                if(this.currChoice[this.textIndex + 1] !== undefined)
                    ctx.fillText(this.currChoice[this.textIndex + 1], this.textlocation.textX+10, this.textlocation.textY+40);  
                if(this.currChoice[this.textIndex + 2] !== undefined)  
                    ctx.fillText(this.currChoice[this.textIndex + 2], this.textlocation.textX+10, this.textlocation.textY+70);  
                if(this.currChoice[this.textIndex + 3] !== undefined)
                    ctx.fillText(this.currChoice[this.textIndex + 3], this.textlocation.textX+10, this.textlocation.textY+100);  
                if(this.currChoice[this.textIndex + 4] !== undefined)  
                    ctx.fillText(this.currChoice[this.textIndex + 4], this.textlocation.textX+10, this.textlocation.textY+130);
                if(this.currChoice[this.textIndex + 5] !== undefined)  
                    ctx.fillText(this.currChoice[this.textIndex + 5], this.textlocation.textX+10, this.textlocation.textY+160);   
            } else {
                this.textIndex += 6;
                //At the end of his conversation, go back to main menu.
                if(this.currChoice[this.textIndex] === undefined) {
                    this.currChoice = main;
                    this.mainmenu = true;
                    this.textIndex = 0;
                }
                this.showTextTimer = Date.now();
            }
        }
    }

    /**
     * Determines if we should darken any text depending on if the mouse is hovering over it.
     * @param {e} e mouse hover event. 
     */
    determineHover(e) {
        //If we're in main menu.
        if(this.mainmenu) {
            //Reset to false, if otherwise proven true.
            this.hoveredtalk = false;
            if(e.x >= PARAMS.canvas_width*0.55 && e.x < PARAMS.canvas_width*0.65) {
                if(e.y >= PARAMS.canvas_height*0.52 && e.y < PARAMS.canvas_height*0.55) {
                    this.hoveredtalk = true;
                }
            }

            this.hoveredbuy = false;
            if(e.x >= PARAMS.canvas_width*0.55 && e.x < PARAMS.canvas_width*0.65) {
                if(e.y >= PARAMS.canvas_height*0.49 && e.y < PARAMS.canvas_height*0.52) {
                    this.hoveredbuy = true;
                }
            }
        }

        //If we're in the shop.
        if(this.shop) {
            this.hoveredbuy0 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY-15 && e.y < this.textlocationbuy.textY+10) {
                    this.hoveredbuy0 = true;
                }
            }

            this.hoveredbuy1 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+15 && e.y < this.textlocationbuy.textY+40) {
                    this.hoveredbuy1 = true;
                }
            }

            this.hoveredbuy2 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+45 && e.y < this.textlocationbuy.textY+70) {
                    this.hoveredbuy2 = true;
                }
            }

            this.hoveredbuy3 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+75 && e.y < this.textlocationbuy.textY+100) {
                    this.hoveredbuy3 = true;
                }
            }

            this.hoveredbuy4 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+105 && e.y < this.textlocationbuy.textY+130) {
                    this.hoveredbuy4 = true;
                }
            }

            this.hoveredbuy5 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+135 && e.y < this.textlocationbuy.textY+160) {
                    this.hoveredbuy5 = true;
                }
            }

            this.hoveredbuy6 = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+260) {
                if(e.y >= this.textlocationbuy.textY+165 && e.y < this.textlocationbuy.textY+190) {
                    this.hoveredbuy6 = true;
                }
            }

            this.hoveredback = false;
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+100) {
                if(e.y >= this.textlocationbuy.textY+195 && e.y < this.textlocationbuy.textY+220) {
                    this.hoveredback = true;
                }
            }
        }
    }

    determineClick(e) {
        if(this.mainmenu) {
            if(e.x >= PARAMS.canvas_width*0.55 && e.x < PARAMS.canvas_width*0.65) {
                if(e.y >= PARAMS.canvas_height*0.52 && e.y < PARAMS.canvas_height*0.55) {
                    this.currChoice = this.dialoguenum;
                    this.playsoundtimer = Date.now();
                    this.playfirst = true;
                    this.playsecond = true;
                    this.playonce = true;
                }
            }
            if(e.x >= PARAMS.canvas_width*0.55 && e.x < PARAMS.canvas_width*0.65) {
                if(e.y >= PARAMS.canvas_height*0.49 && e.y < PARAMS.canvas_height*0.52) {
                    this.currChoice = itemsToSell;
                }
            }
        }

        if(this.shop) {
            //INCREASE TOTAL HEALTH
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY-15 && e.y < this.textlocationbuy.textY+10) {
                    if(this.game.camera.char.coins >= 10) {
                        this.game.camera.char.coins -= 10;
                        this.game.camera.char.hp.maxHealth += 70;
                        this.game.camera.char.hp.current = this.game.camera.char.hp.maxHealth;
                        this.success = true;
                        this.itemno = 0;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 0;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //INCREASE TOTAL MANA
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+15 && e.y < this.textlocationbuy.textY+40) {
                    if(this.game.camera.char.coins >= 10) {
                        this.game.camera.char.coins -= 10;
                        this.game.camera.char.hp.maxMana += 120;
                        this.game.camera.char.hp.current = this.game.camera.char.hp.maxMana;
                        this.success = true;
                        this.itemno = 1;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 1;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //BUY A BIG RED VIAL
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+45 && e.y < this.textlocationbuy.textY+70) {
                    if(this.game.camera.char.coins >= 5) {
                        this.game.camera.char.coins -= 5;
                        this.game.camera.inventory.slots[0]++;
                        this.success = true;
                        this.itemno = 2;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 2;
                        this.failuretimer = Date.now();
                    }
                } 
            }
            //BUY A SMALL RED VIAL
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+75 && e.y < this.textlocationbuy.textY+100) {
                    if(this.game.camera.char.coins >= 3) {
                        this.game.camera.char.coins -= 3;
                        this.game.camera.inventory.slots[1]++;
                        this.success = true;
                        this.itemno = 3;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 3;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //BUY A BIG BLUE VIAL
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+105 && e.y < this.textlocationbuy.textY+130) {
                    if(this.game.camera.char.coins >= 5) {
                        this.game.camera.char.coins -= 5;
                        this.game.camera.inventory.slots[2]++;
                        this.success = true;
                        this.itemno = 4;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 4;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //BUY A SMALL BLUE VIAL
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+160) {
                if(e.y >= this.textlocationbuy.textY+135 && e.y < this.textlocationbuy.textY+160) {
                    if(this.game.camera.char.coins >= 3) {
                        this.game.camera.char.coins -= 3;
                        this.game.camera.inventory.slots[3]++;
                        this.success = true;
                        this.itemno = 5;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 5;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //BUY A PET
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+260) {
                if(e.y >= this.textlocationbuy.textY+165 && e.y < this.textlocationbuy.textY+190) {
                    if(this.game.camera.char.coins >= 20 && !this.game.camera.char.pet) {
                        this.game.camera.char.coins -= 20;
                        this.game.camera.char.hasapet = true;
                        this.success = true;
                        this.itemno = 6;
                        this.successtimer = Date.now();
                    } else {
                        this.failure = true;
                        this.itemno = 6;
                        this.failuretimer = Date.now();
                    }
                }
            }
            //BACK
            if(e.x >= this.textlocationbuy.textX+20 && e.x < this.textlocationbuy.textX+100) {
                if(e.y >= this.textlocationbuy.textY+195 && e.y < this.textlocationbuy.textY+220) {
                    this.currChoice = main;
                }
            }
        }
    }
}


var main = {
    0: "Young Rutherford, What can I help you with?",
    1: "Buy",
    2: "Talk to Me",
    3: "Proceed to the final room"
}

var itemsToSell = {
    0: "Increase Total Health x 10",
    1: "Increase Total Mana x 10",
    2: "Buy a Big Red Vial x 5",
    3: "Buy a Small Red Vial x 3",
    4: "Buy a Big Blue Vial x 5",
    5: "Buy a Small Blue Vial x 3",
    6: "Get a Pet (Fights and mana regen inc.) x 20",
    7: "BACK"
}

var firstEncounterStory = 
{
    0: "Young Rutherford...How happy I am to see you here!",
    1: "Just a week ago, this strange cloaked man came ",
    2: "to our King. The King fought valiantly but alas", 
    3: "he could barely scratch the man. He called himself",
    4: "Raven and he mentioned that he will change this",
    5: "Kingdom to his liking before you even manage to",
    6: "return. As you can see, he has poisoned the entire",
    7: "Kingdom and made them his pawns. The only one",
    8: "unaffected is me, Buck, and Drumbuck. Apparently I",
    9: "was unaffected because I am an apparition. Buck",
    10: "and Drumbuck's sheer fortitude resisted the effect.",
    11: "When Raven found out, he took his army of Wols",
    12: "and decided to destroy this forest. Drumbuck",
    13: "fought with valor, but even he failed to stop them.",
    14: "So he offered his unwavering loyalty to Raven,",
    15: "in exchange for the Forest's peace. Drumbuck",
    16: "now serves as his commander, while Buck became",
    17: "the new Forest Protector engulfed in guilt that", 
    18: "he wasn't able to save his brother. Well, I",
    19: "don't wanna be you, because you'll face him",
    20: "just up ahead Hohoho. Buy from me what you",
    21: "Let us talk more later."
}

var secondEncounterStory = 
{
    0: "Ah, so we meet again in this Eerie dungeon, Hoho.",
    1: "If you made it this far, then you beat both the ",
    2: "Buck Aroo brothers. It really was painful to", 
    3: "watch that fight. You could see Drumbuck really",
    4: "wanted a savior such as yourself but he couldn't",
    5: "go back on his promise of unwavering loyalty to",
    6: "Raven. I would believe he will be happy that he",
    7: "lost once he regains consciousness. Hm?........",
    8: "You want to know more about me? Okay then, I was",
    9: "summoned by the King 10 years ago and bound me in",
    10: "a contract that stated that I must obey the King.",
    11: "Unfortunately, that means that if the King changes,",
    12: "my master changes too. Ever since our King was",
    13: "dethroned, Raven has become my active master.",
    14: "But, I don't really approve of him. I can't",
    15: "directly help you due to my soul-contract, so",
    16: "I decided to help you by selling improvements,",
    17: "and providing information. Hoho I see you're glad", 
    18: "to hear that. Oh and by the way, I am also",
    19: "the Dungeon's Gatekeeper so you'll be facing me",
    20: "eventually.......!! Don't be sad, I can't",
    21: "let you pass simply because our goals are the same.",
    22: "Think of it this way, if you cannot beat me, then",
    23: "you definitely won't be able to beat Raven.",
    24: "Buy from me what you want and be prepared for when",
    25: "we meet again."
}

var thirdEncounterStory = 
{
    0: "Alright that is enough! You win. I've done my",
    1: "part of defending the King, so I will not perish",
    2: "anymore by letting you pass. I must say you're",
    3: "strong. Raven is looking forward to facing you.",
    4: ".....? You're feeling nervous? At times like these",
    5: "you have to encourage yourself loudly. Here:",
    6: "                                              ",
    7: "",
    8: "",
    9: "",
    10: "",
    11: "",
    12: "See? That fired you up right! There you go",
    13: "Good luck Young Rutherford, the whole",
    14: "Kingdom's fate is in your hand. Don't fail",
    15: "on us. \"After talking to Polnariff, you are,",
    16: "filled with determination\"."
}
