class Extras {
    constructor(game, x, y) {

        Object.assign(this, {game, x, y});

        //All assets for what we'll show.

        this.backgroundsheet = ASSET_MANAGER.getAsset("./sprites/GUI.png");

        this.ruthersheet = ASSET_MANAGER.getAsset("./sprites/rutherford-main.png");

        this.title = ASSET_MANAGER.getAsset("./sprites/Fusillade.png");

        this.fayeresheet = ASSET_MANAGER.getAsset("./sprites/Fayere.png");

        this.aissheet = ASSET_MANAGER.getAsset("./sprites/Ais.png");

        this.cyclopsheet = ASSET_MANAGER.getAsset("./sprites/Cyclops.png");

        this.bunnysheet = ASSET_MANAGER.getAsset("./sprites/bunny.png");

        this.wormysheet = ASSET_MANAGER.getAsset("./sprites/Wormy.png");

        this.bucksheet = ASSET_MANAGER.getAsset("./sprites/Buck.png");

        this.slippeysheet = ASSET_MANAGER.getAsset("./sprites/Slime.png");

        this.backgroundanimation = [];

        this.positions = [{currX: PARAMS.canvas_width*0.22, currY: PARAMS.canvas_height*0.523}, 
                          {currX: PARAMS.canvas_width*0.265, currY: PARAMS.canvas_height*0.573},
                          {currX: PARAMS.canvas_width*0.265, currY: PARAMS.canvas_height*0.573},
                          {currX: PARAMS.canvas_width*0.19, currY: PARAMS.canvas_height*0.33},
                          {currX: PARAMS.canvas_width*0.285, currY: PARAMS.canvas_height*0.573},
                          {currX: PARAMS.canvas_width*0.16, currY: PARAMS.canvas_height*0.363},
                          {currX: PARAMS.canvas_width*0.145, currY: PARAMS.canvas_height*0.353},
                          {currX: PARAMS.canvas_width*0.24, currY: PARAMS.canvas_height*0.48}] 

        //GIVE each character their own paramX and paramY.

        this.time = Date.now();

        this.removeFromWorld = false;

        this.attogglenum = 0;

        this.charAnimations = [];

        this.charStories = [rutherford, fayere, ais, cyclops, bunny, wormy, buck, slippey];

        this.loadAnimations();
    }

    loadAnimations() {
        //Background
        this.backgroundanimation[0] = new Animator(this.backgroundsheet, 112, 256, 80, 48, 1, 1, 0, false, true);

        //Back button
        this.backgroundanimation[1] = new Animator(this.backgroundsheet, 64, 241, 16, 16, 1, 1, 0, false, true);

        //Front button
        this.backgroundanimation[2] = new Animator(this.backgroundsheet, 128, 240, 16, 16, 1, 1, 0, false, true);

        //Home button
        this.backgroundanimation[3] = new Animator(this.backgroundsheet, 128, 225, 16, 16, 1, 1, 0, false, true);

        //Rutherford at 0
        this.charAnimations[0] = new Animator(this.ruthersheet, 0, 0, 50, 37, 4, 0.175, 0, false, true);

        //Fayere at 1
        this.charAnimations[1] = new Animator(this.fayeresheet, 6, 18, 18, 18, 7, 0.25, 14, false, true);

        //Ais at 2
        this.charAnimations[2] = new Animator(this.aissheet, 6, 18, 18, 18, 7, 0.25, 14, false, true);

        //Cyclops at 3
        this.charAnimations[3] = new Animator(this.cyclopsheet, 0, 0, 64, 64, 15, 0.25, 0, false, true);

        //Bunny at 4
        this.charAnimations[4] = new Animator(this.bunnysheet, 32, 0, 8, 8, 2, 0.25, 0, true, true);

        //Wormy at 5
        this.charAnimations[5] = new Animator(this.wormysheet, 2430, 0, 90, 90, 9, 0.15, 0, false, true);

        //Buck at 6
        this.charAnimations[6] = new Animator(this.bucksheet, 0, 0, 96, 96, 5, 0.25, 0, false, true);

        //Slippey at 7
        this.charAnimations[7] = new Animator(this.slippeysheet, 158, 0, 32, 25, 3, 0.25, 0, true, true);

    }

    update() {
        
    }

    draw(ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, PARAMS.canvas_width, PARAMS.canvas_height);

        //Draw background
        this.backgroundanimation[0].drawFrame(this.game.clockTick, ctx, 0, 0, 16);
        //Draw logo
        ctx.drawImage(this.title, PARAMS.canvas_width*0.385, PARAMS.canvas_height*0.07, 283.2, 116);
        //Button Left
        this.backgroundanimation[1].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width*0.075, PARAMS.canvas_height*0.5, 4);
        //Button Right
        this.backgroundanimation[2].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width*0.875, PARAMS.canvas_height*0.5, 4);
        //Home Button
        this.backgroundanimation[3].drawFrame(this.game.clockTick, ctx, PARAMS.canvas_width*0.475, PARAMS.canvas_height*0.88, 4);

        ctx.font = "Italic 18px Comic Sans";
        ctx.fillStyle = "#383838";
        let startingY = 0.32;
        let i = 0;
        this.charAnimations[this.attogglenum].drawFrame(this.game.clockTick, ctx, 
                this.positions[this.attogglenum].currX, this.positions[this.attogglenum].currY, 4);
        while(this.charStories[this.attogglenum][i] != undefined) {
            ctx.font = "Italic 18px Comic Sans";
            if(i == 0) {
                ctx.font = "Bold Italic 24px Comic Sans";
            }
            ctx.fillText(this.charStories[this.attogglenum][i], PARAMS.canvas_width * 0.542, PARAMS.canvas_height * startingY);
            i++;
            startingY += 0.05;
        }
    }   

    determineClick(e) {      
        if(e.x >= PARAMS.canvas_width*0.075 && e.x < PARAMS.canvas_width*0.18) {
            if(e.y >= PARAMS.canvas_height*0.47 && e.y < PARAMS.canvas_height*0.56) {
                if(this.attogglenum != 0) {
                    this.attogglenum += -1;
                }
            }
        }
        if(e.x >= PARAMS.canvas_width*0.875 && e.x < PARAMS.canvas_width*0.95) {
            if(e.y >= PARAMS.canvas_height*0.47 && e.y < PARAMS.canvas_height*0.56) {
                if(this.attogglenum != this.charStories.length - 1) {
                    this.attogglenum += +1;
                }
            }
        }

        if(e.x >= PARAMS.canvas_width*0.475 && e.x < PARAMS.canvas_width*0.525) {
            if(e.y >= PARAMS.canvas_height*0.88 && e.y < PARAMS.canvas_height*0.95) {
                this.game.extra = false;
                this.game.started = false;
                this.removeFromWorld = true;
            }
        }
    }
}

var rutherford = {
    0: "Rutherford",
    1: "Born in the Sacturi Kingdom and often considered one",
    2: "of the best fighter among all. This is no small feat,",
    3: "as the Kingdom is home to Monsters and Humans.",
    4: "Rutherford, at age 15 pledged his loyalty to the King",
    5: "after he was moved by the King's compassion. He",
    6: "climbed ranks and became the King's right-hand man,",
    7: "but, Rutherford decided to relinquish his titles and",
    8: "go on a journey to become stronger. He returns 2",
    9: "years later, to find the Kingdom upside down. \"If It",
    10: "means defeating the King to save my home, I will do it.\""
}

var fayere = {
    0: "Fayere",
    1: "Fayere is one of the less significant creature that",
    2: "lives in the forest. He is the fire variation of his ",
    3: "Fridgi species. Fayere has been helping people in the ",
    4: "Kingdom and the forest to cook food by being a source",
    5: "flame. Fayere is often regarded weak, but when rumor",
    6: "spread to one bright Fayere, he replied by saying ",
    7: "\"Strength isn't brute, but it comes with numbers\"." 
}

var ais = {
    0: "Ais",
    1: "Ais, the ice variation of the Fridgi species is a ",
    2: "lifesaver for people during the warm days.Among all",
    3: "the monster-human relationships, Ais have always been",
    4: "shown to be the most happiest by far. Ais have been ",
    5: "known to be stragetic in their way of combat, slowly ",
    6: "blocking off area for their enemy before going in for",
    7: "the hit. It's long been rumored that Ais can become ",
    8: "Watere when it melts, however, no scientific evidence",
    9: "has been found of such phenomenon."
}

var cyclops = {
    0: "Sikelops",
    1: "Sikelops, the one eyed beast, or so it is often thought.",
    2: "Sikelops in reality has 2 eyes, one on the front,",
    3: "and one behind his head. This trickery has earned",
    4: "them the title of Sikelops. Sikelops often help",
    5: "the townsfolks with heavy lifting and construction",
    6: "due to their sheer muscle mass. However, their real",
    7: "appeal comes in the form of their eye, which can",
    8: "fire a laser at lightning speed. Due to this, they're",
    9: "often brought along for hunting trips."
}

var bunny = {
    0: "Bunny",
    1: "A simple rabbit found in the Lukinlupin Forest.",
    2: "They're often kept as pets and relatively passive",
    3: "in how they behave. But, if provoked too much,",
    4: "lunge at their foe in a state of madness. This",
    5: "exact reason is why almost everyone in Sacturi",
    6: "Kingdom has bunny, to protect themselves. Well,",
    7: "that and the fact they are adorable."
}

var wormy = {
    0: "Wormy",
    1: "Wormy was always a lonely type. He had a certain habit",
    2: "of only coming out when it was sunny. Where he used to ",
    3: "live it usually rained most of the time and he would stay",
    4: "in one spot waiting for the sun to come out. So,",
    5: "eventually, Wormy decided to travel to the forest of",
    6: "Lukinlupin where the sun was always out and Wormy",
    7: "could be free! Wormy usually guards a certain area",
    8: "because he loves having his own space to spend time in.",
    9: "Wormy is known to attack anything resembling a human",
    10: "being, though the reason remains unclear to this day..."
}

var buck = {
    0: "Buck",
    1: "Buck, full name Buck Aroo, is the Forest Protector",
    2: "after the disappearance of his brother, Drumbuck.",
    3: "He has managed to protect the forest from the King's",
    4: "rogue advancements, ever since then. Buck suffers", 
    5: "from guilt of not being strong enough to protect his",
    6: "who he believes died in the clash. Buck learned the",
    7: "tricks of portals from Drumbuck just so he could live",
    8: "within them, but he realized they were too small. On",
    9: "the side, Buck is a champion of Hide 'n Seek, simply",
    10: "because he threthens to beat up anyone who finds him."
}

var slippey = {
    0: "Slippey",
    1: "This slime monster is one of the most annoying ever",
    2: "found in the Kingdom. It all started when one oozed",
    3: "into the kingdom through the pipes and divided. They",
    4: "eventually went berserk, taking the form of their foe,",
    5: "but taking on talents that the foe was bad in. A slippey",
    6: "clone of a swordsman would be an archer and the skill of",
    7: "that archer would be equivalent to the swordsman. All the",
    8: "Slippey eventually made it to the throne room, but the",
    9: "King ended all resistence. The slimes could not transfrom",
    10: "because the King was great at everything he did."
}