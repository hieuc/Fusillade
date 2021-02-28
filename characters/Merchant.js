class Merchant {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/merchan.png");

        this.textsheet = ASSET_MANAGER.getAsset("./sprites/GUI.png");

        this.potionsheet = ASSET_MANAGER.getAsset("./sprites/Meat.png");

        this.petsheet = ASSET_MANAGER.getAsset("./sprites/Dine-O.png");

        this.tickorxsheet = ASSET_MANAGER.getAsset("./sprites/projectiles.png");

        this.scale = 2;

        this.showTextTimer = Date.now();

        this.textIndex = 0;

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

        this.textappearDuration = 7500;

        this.animations = [];

        this.showtext = false;

        this.mainmenu = true;

        this.shop = false;

        this.textlocation = {textX: 680, textY: 380};

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

        //Textbox For Joining (lower half)
        this.animations[3] = new Animator(this.textsheet, 145, 68, 46, 13, 1, 1, 0, false, true);

        //Textbox for joining (upper half) 
        this.animations[4] = new Animator(this.textsheet, 145, 65, 46, 13, 1, 1, 0, false, true);

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
        ctx.fillStyle = "#53505e";
        //If right now, we have decided to hit "buy" show an "extended" dashboard that accomodates everything.
        if(this.currChoice == itemsToSell) {
            this.animations[4].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2 - 100, 8);
            this.animations[3].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2, 8);
            this.animations[3].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2+80, 8);
        } else {
            //Otherwise, show a normal dashboard for other cases.
            this.animations[2].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width/2 + 20, PARAMS.canvas_height/2 - 100, 9);
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
            ctx.fillStyle = "#53505e";
            if(this.hoveredtalk) {
                ctx.fillStyle = "#000000";
            }
            ctx.fillText(this.currChoice[2], this.textlocation.textX, this.textlocation.textY+50); 
            ctx.fillStyle = "#53505e"; 
            this.showTextTimer = Date.now(); 
        //If we are inside the "buy" option.
        } else if(this.currChoice === itemsToSell) {
            //Set main menu to be false and shop to be true.
                this.mainmenu = false;
                this.shop = true;
                if(this.hoveredbuy0) {
                    ctx.fillStyle = "#000000";
                }
                ctx.fillText(this.currChoice[this.textIndex], this.textlocation.textX+20, this.textlocation.textY);
                ctx.fillStyle = "#53505e"; 
                //Draw the small potion icon.
                ctx.drawImage(this.potionsheet, 3, 160, 14, 16, this.textlocation.textX, this.textlocation.textY-15, 16, 16);
                //If the purchase was successful, and THIS item 0 was purchased and the user hasn't immediately tried to buy again and it failed
                if(this.success && this.itemno == 0 && !this.failure) {
                    //Draw the tick to show it was successful.
                    ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY-15, 16, 16);
                    if(Date.now() - this.successtimer > 3000) {
                        this.success = false;
                    }
                //If the user tried to buy, but they weren't able to, show an X mark.
                } else if(this.failure && this.itemno == 0) {
                    ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY-15, 16, 16);
                    if(Date.now() - this.failuretimer > 3000) {
                        this.failure = false;
                        this.success = false;
                    }
                }
                if(this.currChoice[this.textIndex + 1] !== undefined)
                    if(this.hoveredbuy1) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 1], this.textlocation.textX+20, this.textlocation.textY+30);  
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.potionsheet, 3, 160, 14, 16, this.textlocation.textX, this.textlocation.textY+15, 16, 16);
                    if(this.success && this.itemno == 1 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+15, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 1) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+15, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 2] !== undefined)  
                    if(this.hoveredbuy2) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 2], this.textlocation.textX+20, this.textlocation.textY+60);
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.potionsheet, 34, 160, 16, 16, this.textlocation.textX, this.textlocation.textY+45, 16, 16);
                    if(this.success && this.itemno == 2 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+45, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 2) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+45, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 3] !== undefined)
                    if(this.hoveredbuy3) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 3], this.textlocation.textX+20, this.textlocation.textY+90);
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.potionsheet, 66, 160, 16, 16, this.textlocation.textX, this.textlocation.textY+75, 16,16);
                    if(this.success && this.itemno == 3 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+75, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 3) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+75, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 4] !== undefined) 
                    if(this.hoveredbuy4) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 4], this.textlocation.textX+20, this.textlocation.textY+120);
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.potionsheet, 50, 160, 16, 16, this.textlocation.textX, this.textlocation.textY+105, 16,16);
                    if(this.success && this.itemno == 4 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+105, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 4) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+105, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 5] !== undefined)
                    if(this.hoveredbuy5) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 5], this.textlocation.textX+20, this.textlocation.textY+150);
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.potionsheet, 82, 160, 16, 16, this.textlocation.textX, this.textlocation.textY+135, 16,16);
                    if(this.success && this.itemno == 5 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+135, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 5) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 230, this.textlocation.textY+135, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 6] !== undefined)  
                    if(this.hoveredbuy6) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 6], this.textlocation.textX+20, this.textlocation.textY+180);
                    ctx.fillStyle = "#53505e"; 
                    ctx.drawImage(this.petsheet, 0, 0, 24, 24, this.textlocation.textX-4, this.textlocation.textY+165, 24,24);
                    if(this.success && this.itemno == 6 && !this.failure) {
                        ctx.drawImage(this.tickorxsheet, 160, 304, 16, 16, this.textlocation.textX + 330, this.textlocation.textY+165, 16, 16);
                        if(Date.now() - this.successtimer > 3000) {
                            this.success = false;
                        }
                    } else if(this.failure && this.itemno == 6) {
                        ctx.drawImage(this.tickorxsheet, 176, 304, 16, 16, this.textlocation.textX + 330, this.textlocation.textY+165, 16, 16);
                        if(Date.now() - this.failuretimer > 3000) {
                            this.failure = false;
                            this.success = false;
                        }
                    }
                if(this.currChoice[this.textIndex + 7] !== undefined)  
                    if(this.hoveredback) {
                        ctx.fillStyle = "#000000";
                    }
                    ctx.fillText(this.currChoice[this.textIndex + 7], this.textlocation.textX+20, this.textlocation.textY+210);
                    ctx.fillStyle = "#53505e"; 
        } else {
            //THIS SECTION TRIGGERS ONLY WHEN YOU HIT 'TALK TO ME'
            this.mainmenu = false;
            this.shop = false;
            //We show 3 sentences at a time for textappearDuration i.e. 7.5 seconds.
            if(Date.now() - this.showTextTimer < this.textappearDuration) {
                ctx.fillText(this.currChoice[this.textIndex], this.textlocation.textX, this.textlocation.textY);
                if(this.currChoice[this.textIndex + 1] !== undefined)
                    ctx.fillText(this.currChoice[this.textIndex + 1], this.textlocation.textX, this.textlocation.textY+30);  
                if(this.currChoice[this.textIndex + 2] !== undefined)  
                    ctx.fillText(this.currChoice[this.textIndex + 2], this.textlocation.textX, this.textlocation.textY+60);  
            } else {
                this.textIndex += 3;
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
            if(e.x >= 690 && e.x < 780) {
                if(e.y >= 420 && e.y < 440) {
                    this.hoveredtalk = true;
                    console.log(canX);
                    console.log(canY);
                }
            }

            this.hoveredbuy = false;
            if(e.x >= 690 && e.x < 830) {
                if(e.y >= 390 && e.y < 415) {
                    this.hoveredbuy = true;
                }
            }
        }

        //If we're in the shop.
        if(this.shop) {
            this.hoveredbuy0 = false;
            if(e.x >= 690 && e.x < 960) {
                if(e.y >= 360 && e.y < 385) {
                    this.hoveredbuy0 = true;
                }
            }

            this.hoveredbuy1 = false;
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 390 && e.y < 415) {
                    this.hoveredbuy1 = true;
                }
            }

            this.hoveredbuy2 = false;
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 420 && e.y < 445) {
                    this.hoveredbuy2 = true;
                }
            }

            this.hoveredbuy3 = false;
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 450 && e.y < 475) {
                    this.hoveredbuy3 = true;
                }
            }

            this.hoveredbuy4 = false;
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 480 && e.y < 505) {
                    this.hoveredbuy4 = true;
                }
            }

            this.hoveredbuy5 = false;
            if(e.x >= 690 && e.x < 910) {
                if(e.y >= 510 && e.y < 535) {
                    this.hoveredbuy5 = true;
                }
            }

            this.hoveredbuy6 = false;
            if(e.x >= 690 && e.x < 1010) {
                if(e.y >= 540 && e.y < 565) {
                    this.hoveredbuy6 = true;
                }
            }

            this.hoveredback = false;
            if(e.x >= 690 && e.x < 768) {
                if(e.y >= 570 && e.y < 600) {
                    this.hoveredback = true;
                }
            }
        }
    }

    determineClick(e) {
        if(this.mainmenu) {
            if(e.x >= 690 && e.x < 780) {
                if(e.y >= 420 && e.y < 440) {
                    this.currChoice = firstEncounterStory;
                }
            }
            if(e.x >= 690 && e.x < 830) {
                if(e.y >= 390 && e.y < 415) {
                    this.currChoice = itemsToSell;
                }
            }
        }

        if(this.shop) {
            //INCREASE TOTAL HEALTH
            if(e.x >= 690 && e.x < 960) {
                if(e.y >= 360 && e.y < 385) {
                    if(this.game.camera.char.coins >= 10) {
                        this.game.camera.char.coins -= 10;
                        this.game.camera.char.hp.maxHealth += 150;
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
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 390 && e.y < 415) {
                    if(this.game.camera.char.coins >= 10) {
                        this.game.camera.char.coins -= 10;
                        this.game.camera.char.hp.maxMana += 150;
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
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 420 && e.y < 445) {
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
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 450 && e.y < 475) {
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
            if(e.x >= 690 && e.x < 890) {
                if(e.y >= 480 && e.y < 505) {
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
            if(e.x >= 690 && e.x < 910) {
                if(e.y >= 510 && e.y < 535) {
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
            if(e.x >= 690 && e.x < 1010) {
                if(e.y >= 540 && e.y < 565) {
                    if(this.game.camera.char.coins >= 20) {
                        this.game.camera.char.coins -= 20;
                        //Create a pet


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
            if(e.x >= 690 && e.x < 768) {
                if(e.y >= 570 && e.y < 600) {
                    this.currChoice = main;
                }
            }
        }
    }
}


var main = {
    0: "Young Rutherford, What can I help you with?",
    1: "Buy",
    2: "Talk to Me"
}

var itemsToSell = {
    0: "Increase Total Health x10 coins",
    1: "Increase Total Mana x10 coins",
    2: "Buy a Big Red Vial x5 coins",
    3: "Buy a Small Red Vial x3 coins",
    4: "Buy a Big Blue Vial x5 coins",
    5: "Buy a Small Blue Vial x3 coins",
    6: "Get a Pet (Fights and mana regen inc.) x20 coins",
    7: "BACK"
}

var firstEncounterStory = 
{
    0: "Young Rutherford...After you left this place, this",
    1: "strange man approached our King, and offered to work ",
    2: "under him. However, slowly the King started to do", 
    3: "questionable things. It started with an attempt to",
    4: "conquer this Forest. However, he withdrew for some ",
    5: "reason. He started fortifying his defences and ",
    6: "becoming shrewd in his ways. Eventually, the spell",
    7: "fell over everyone, and now everyone is acting weird.",
    8: "Of course, as you can see, I am unaffected as I am an",
    9: "Apparition, however, I have always served the King so",
    10: "I cannot go against him. Hoho! Don't be sad. I'm not",
    11: "necessarily against you Young Rutherford. I want our",
    12: "old King to return as well. I will assist",
    13: "you with information and what I have here to sell.",
    14: "Of course I can't give them to you for free;",
    15: "When I was alive I used to be a Prodigy in Business.",
    16: "Just up ahead, you'll be facing Buck, the forest's",
    17: "Protector. You should Buck-le up, Hoho, even after", 
    18: "all these years, I haven't lost my sense of humor.",
    19: "Let us talk more later."
}
