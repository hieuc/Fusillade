function createPerlinMap(w, h) {
    var m = [];
    noise.seed(Math.random());
    for (var i = 0; i < h; i++) {
        m[i] = [];
        for (var j = 0; j < w; j++) {
            m[i][j] = Math.abs( noise.perlin2( i * 0.1 , j * 0.1) );
        }
    }
    return m;
}

/**
 * lock the room with obstacles
 * return an array of newly created obstacles
 * (useful for releasing lock after)
 * 
 * @param {*} game 
 * @param {*} room 
 * @param {*} m 
 * @param {*} p property of obstacles
 */
function lockRoom(game, room, m, p) {
    var r = [];
    // 4 loops, locking 4 sides
    // locking top side
    for(var i = 0; i <= room.w; i++) {
        // if open space, lock it
        if (m[room.y-1][room.x + i] === 1) {
            var e = new Obstacle(game, (room.x + i)*64, (room.y-1)*64, p);
            game.addEntity(e);
            r.push(e);
        }
    }

    // locking bottom side
    for(var i = 0; i <= room.w; i++) {
        // if open space, lock it
        if (m[room.y + room.h][room.x + i] === 1) {
            var e = new Obstacle(game, (room.x + i)*64, (room.y + room.h)*64, p);
            game.addEntity(e);
            r.push(e);
        }
    }

    // locking left side
    for(var i = 0; i <= room.h; i++) {
        // if open space, lock it
        if (m[room.y + i][room.x-1] === 1) {
            var e = new Obstacle(game, (room.x-1)*64, (room.y + i)*64, p);
            game.addEntity(e);
            r.push(e);
        }
    }

    // locking right side
    for(var i = 0; i <= room.h; i++) {
        // if open space, lock it
        if (m[room.y + i][room.x + room.w] === 1) {
            var e = new Obstacle(game, (room.x + room.w)*64, (room.y + i)*64, p);
            game.addEntity(e);
            r.push(e);
        }
    }
    console.log(r.length);
    return r;
}

/**
 * Attach rooms object with enemy names + amount
 * 
 * @param {*} rooms 
 */
function fillEnemiesLevel1(rooms) {
    //var pool = [];

    rooms.forEach(e => {
        if (e.key === "miniboss") {
            e.enemies = [["cyclops", 1]];
        } else if (e.key === "boss") {
            e.enemies = [["buck", 1]];
        } else {
            e.enemies = [["fayere", randomInt(5)+1], ["ais", randomInt(5) + 1]];
        }
    });
}

function applyEdgePadding(m, rooms) {
    var r = [];
    // padding
    var p = 10;

    // pad the room positions
    rooms.forEach(e => {
        e.x += p;
        e.y += p;
    });
    
    // pad left and right
    for (var i = 0; i < m.length; i++) {
        var temp = [];
        for (var j = 0; j < p; j++) {
            temp.push(0);
        }
        m[i] = temp.concat(m[i]);
        for (var j = 0; j < p; j++) {
            m[i].push(0);
        }
    }

    // pad top and bottom
    for (var i = 0; i < p; i++) {
        r[i] = [];
        var temp = [];
        for (var j = 0; j < m[0].length; j++) {
            r[i][j] = 0;
            temp.push(0);
        }
        m.push(temp);
    }
    r = r.concat(m);

    return r;
}

/**
 * Apply Diffusion Limited Aggregation to an existing map.
 * Preferredly maps with rooms.
 * The map should be a 2d array where every element is either
 * 0 (obstacles) and 1 (empty space),
 * 
 * @param {*} m map 
 * @param pad padding for boss room
 */
function applyDLA(m, pad) {
    var goal = 600;
    var success = 0;
    // infinite loop protection
    var trials = 0;
    var max = goal * 4;

    // check surround, if any neighbor is open space (collided)
    var isCollided = function (x, y, m) {
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j < y + 1; j++) {
                if (m[j] !== undefined && m[j][i] !== undefined && 
                        Math.abs(i - x) + Math.abs(j - y) != 2 && m[j][i] === 1) {
                    return true;
                }
            }
        }
        return false;
    }

    var isOutBound = function (x, y, m) {
        return x < 0 || y < pad || x >= m[0].length || y >= m.length;
    }

    while (success < goal && trials < max) {
        // pick a random location
        var x = randomInt(m[0].length-1);
        var y = randomInt(m.length-1 - pad) + pad;

        // if spawn on existing location, skip
        if (m[y][x] === 1) {
            trials++;
            continue;
        }

        // pick a random velocity
        var vx = 0;
        var vy = 0;
        while (vx === 0 && vy === 0) {
            vx = randomInt(3) - 1;
            vy = randomInt(3) - 1;
        }

        // shoot the particle
        while (!isCollided(x, y, m) && !isOutBound(x, y, m)) {
            x += vx;
            y += vy;
        }

        if (isCollided(x, y, m)) {
            var particlesize = 1;
            // surround to be value of 1
            for (var i = x - particlesize; i <= x + particlesize; i++) {
                for (var j = y - particlesize; j < y + particlesize; j++) {
                    if (m[j] !== undefined && m[j][i] !== undefined)
                        m[j][i] = 1;
                }
            }
            success++;
        }
        trials++;
    }
}

/**
 * Create a map with rooms.
 * 
 * The returning map is a 2d array where every element is either
 * 0 (obstacles) and 1 (empty space),
 * 
 * @param {*} w 
 * @param {*} h 
 */
function createDungeon(w, h) {
    var rooms = createRooms(w, h);
    
    // boss room will be at location (w * 0.1, 0), width, height = 30;
    // saving 50 space
    rooms.forEach(e => {
        e.y += 50;

        if (e.path)
            e.path.forEach(p => {
                p.y1 += 50;
                p.y2 += 50;
            })
    });

    var boss = new Room(Math.floor(w * 0.1), 0, 30, 30, "boss");
    createPath(rooms[0], boss, true);
    rooms[0].key = "miniboss";
    //rooms[7].key = "miniboss"; // delete this line since it was just for placing Cyclops next to Rutherford for debugging purposes
    rooms.push(boss);

    fillEnemiesLevel1(rooms);

    var m = [];

    // init map with obstacles
    for (var i = 0; i < h + 50; i++) {
        m[i] = [];
        for (var j = 0; j < w + 50; j++) {
            m[i][j] = 0;
        }
    }

    for (var i = 0; i < rooms.length; i++) {
        // fill the room area
        for (var a = 0; a < rooms[i].h; a++) {
            for (var b = 0; b < rooms[i].w; b++) {
                m[rooms[i].y + a][rooms[i].x + b] = 1;
            }
        }

        // fill the paths
        if (rooms[i].path)
            rooms[i].path.forEach(e => {
                // if going in x direction
                if (e.x2 - e.x1 !== 0) {
                    var v = (e.x2 - e.x1) / Math.abs(e.x2 - e.x1);
                    for (var a = 0; a < Math.abs(e.x2 - e.x1); a++) {
                        // width of path is 5
                        //m[e.y1 - 2][e.x1 + a*v] = 1;
                        m[e.y1 - 1][e.x1 + a*v] = 1;
                        m[e.y1][e.x1 + a*v] = 1;
                        m[e.y1 + 1][e.x1 + a*v] = 1;
                        //m[e.y1 + 2][e.x1 + a*v] = 1;
                    }
                } else {
                    var v = (e.y2 - e.y1) / Math.abs(e.y2 - e.y1);
                    for (var a = 0; a < Math.abs(e.y2 - e.y1); a++) {
                        // width of path is 5
                        //m[e.y1 + a*v][e.x1 - 2] = 1;
                        m[e.y1 + a*v][e.x1 - 1] = 1;
                        m[e.y1 + a*v][e.x1] = 1;
                        m[e.y1 + a*v][e.x1 + 1] = 1;
                        //m[e.y1 + a*v][e.x1 + 2] = 1;
                    }
                }
            });
    }

    applyDLA(m, 50);
    m = applyEdgePadding(m, rooms);
    
    return [m, rooms];
}

/**
 * Create a list of rooms.
 * Will connect rooms with paths.
 * 
 * @param {*} w 
 * @param {*} h 
 */
function createRooms(w, h) {
    
    var m = [];
    // partition space
    new Space(0, 0, w, h, 3, m);

    // assign rooms to space
    for (var i = 0; i < m.length; i++) {
        var e = m[i];
        if (i === 7 || i === 0) {
            e.room = new Room(e.x + Math.floor(e.w * 0.1), e.y + Math.floor(e.h * 0.1), Math.floor(e.w * 0.75), Math.floor(e.h * 0.75), "normal");
        } else {
            // room will occupy 50-60% area of space
            var w = Math.floor(e.w * (randomInt(11) + 50) / 100);
            var h = Math.floor(e.h * (randomInt(11) + 50) / 100);
            // position will also be randomized, but always within space bound
            var x = e.x + randomInt(Math.floor((e.w - w) * 0.8)) + Math.floor((e.w - w) * 0.1);
            var y = e.y + randomInt(Math.floor((e.h - h) * 0.8)) + Math.floor((e.h - h) * 0.1);
            
            e.room = new Room(x, y, w, h, "normal");
        }
    };

    // create paths between rooms
    
    // generate distance between rooms
    var dist = [];
    var verticies = [];
    for (var i = 0; i < m.length; i++) {
        verticies.push(i);
        for (var j = i + 1; j < m.length; j++) {
            // distance is calculated by from room center point
            var x1 = m[i].room.x + m[i].room.w/2;
            var y1 = m[i].room.y + m[i].room.h/2;
            var x2 = m[j].room.x + m[j].room.w/2;
            var y2 = m[j].room.y + m[j].room.h/2;
            dist.push({ r1: i, r2: j, d: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))});
        }
    }
    // sort distance
    dist.sort( (a, b) => {return a.d - b.d;} );
    
    // build spanning tree
    var connection = new UnionFind(verticies);
    for (var i = 0; i < dist.length; i++) {
        if (!connection.allConnected()) {
            if(!connection.connected(dist[i].r1, dist[i].r2)) {
                createPath(m[dist[i].r1].room, m[dist[i].r2].room);
                connection.union(dist[i].r1, dist[i].r2);
            }
        } else {
            break;
        }
    }
    // do a second pass
    for (var i = 0; i < dist.length; i++) {
        if (!connection.allConnected()) {
            if(!connection.connected(dist[i].r1, dist[i].r2)) {
                createPath(m[dist[i].r1].room, m[dist[i].r2].room);
                connection.union(dist[i].r1, dist[i].r2);
            }
        } else {
            break;
        }
    }
    for (var i = 0; i < m.length; i++) {
        m[i] = m[i].room;
    }
    return m;
}

/**
 * Create a z path between 2 rooms
 * 
 * @param {*} r1 room 1
 * @param {*} r2 room 2
 */
function createPath(r1, r2, boss) {
    if (!r1.path)
        r1.path = [];

    var pathFullyInBox = function (p, e) {
        return p.x1 < e.x + e.w && p.x1 > e.x && p.y1 < e.y + e.h && p.y1 > e.y &&
            p.x2 < e.x + e.w && p.x2 > e.x && p.y2 < e.y + e.h && p.y2 > e.y;
    };

    var pathInBox = function (p, e) {
        return p.x1 < e.x + e.w && p.x1 > e.x && p.y1 < e.y + e.h && p.y1 > e.y ||
            (p.x2 < e.x + e.w && p.x2 > e.x && p.y2 < e.y + e.h && p.y2 > e.y);
    }

    // pick 2 random points in 2 rooms
    var x1 = r1.x + randomInt(r1.w -2) + 2; if (boss) x1 = r1.x + 2;
    var y1 = r1.y + randomInt(r1.h -2) + 2; if (boss) y1 = r1.y;
    var x2 = r2.x + randomInt(r2.w -2) + 2;
    var y2 = r2.y + randomInt(r2.h -2) + 2;
    // determine direction vector from 2 previous points
    var vx = x2 - x1;
    var vy = y2 - y1;

    // distance from 2 points
    var distx = Math.abs(vx);
    var disty = Math.abs(vy);

    vx /= distx;
    vy /= disty;

    var p = r1.path;
    // draw a z
    if (distx > disty) {

        var midpoint = x1 + (randomInt(distx * 0.4) + Math.floor(distx * 0.4)) * vx;
        
        var path = { x1: x1, y1: y1, x2: midpoint, y2: y1 };
        p.push(path);

        path = { x1 : midpoint, y1: y1, x2: midpoint, y2: y2};
        p.push(path);

        if (midpoint !== x2) {
            p.push({ x1: midpoint, y1: y2, x2: x2, y2: y2});
        }
    } else {
        var midpoint = y1 + randomInt(disty * 0.8) * vy;

        var path = { x1: x1, y1: y1, x2: x1, y2: midpoint };
        p.push(path);

        path = { x1 : x1, y1: midpoint, x2: x2, y2: midpoint};
        p.push(path);

        if (midpoint !== y2) {
            p.push({ x1: x2, y1: midpoint, x2: x2, y2: y2});
        }
    }

    // trim paths
    // remove paths fully inside room
    for (var j = p.length - 1; j >= 0; j--) {
        if (pathFullyInBox(p[j], r1) || pathFullyInBox(p[j], r2)) {
            p.splice(j, 1);
        }
    }
    /*
    // trim the rest
    for (var j = 0; j < p.length; j++) {
        if (pathInBox(p[j], r1) || pathInBox(p[j], r2)) {
            // if moving in x direction
            if (p[j].x1 - p[j].x2 !== 0) {
                // if path moving left to right
                if (p[j].x2 - p[j].x1 >= 0) {
                    if (pathInBox(p[j], r1) && p[j].x1 < r1.x + r1.w) {
                        p[j].x1 = r1.x + r1.w;
                    }
                    if (pathInBox(p[j], r2) && p[j].x2 > r2.x) {
                        p[j].x2 = r2.x;
                    }
                } else {
                    if (pathInBox(p[j], r1) && p[j].x1 > r1.x) {
                        p[j].x1 = r1.x;
                    }
                    if (pathInBox(p[j], r2) && p[j].x2 < r2.x + r2.w) {
                        p[j].x2 = r2.x + r2.w;
                    }
                }
            } else {
                // if path moving top to bottom
                if (p[j].y2 - p[j].y1 >= 0) {
                    if (pathInBox(p[j], r1) && p[j].y1 < r1.y + r1.h) {
                        p[j].y1 = r1.y + r1.h;
                    }
                    if (pathInBox(p[j], r2) && p[j].y2 > r2.y) {
                        p[j].y2 = r2.y;
                    }
                } else {
                    if (pathInBox(p[j], r1) && p[j].y1 > r1.y) {
                        p[j].y1 = r1.y;
                    }
                    if (pathInBox(p[j], r2) && p[j].y2 < r2.y + r2.h) {
                        p[j].y2 = r2.y + r2.h;
                    }
                }
            }
        }
    }
    */
}


/**
 * Represents a map space during BSP generation, NOT IN GAME.
 * 
 * collection (array): after BSP generation, all the lowest level
 * Space object are recorded in this object. 
 * Expect n^level elements in array.
 */
class Space {
    constructor (x, y, w, h, level, collection) {
        Object.assign(this, {x, y, w, h, level, collection});
        
        // create children if level > 0
        if (level > 0) {
            this.children = [];
            // split on the larger dimension, randomize 0.4 - 0.6 of length
            if (this.w > this.h) {
                var v = randomInt(Math.floor(this.w * 0.1) + 1) * Math.pow(-1, randomInt(2)) + Math.floor(this.w * 0.5);

                this.children[0] = new Space(x, y, v, h, level - 1, collection);
                this.children[1] = new Space(x + v, y, w - v, h, level - 1, collection);
            } else {
                var v = randomInt(Math.floor(this.h * 0.1) + 1) * Math.pow(-1, randomInt(2)) + Math.floor(this.h * 0.5);

                this.children[0] = new Space(x, y, w, v, level - 1, collection);
                this.children[1] = new Space(x, y + v, w, h - v, level - 1, collection);
            }
        } else {
            this.collection.push(this);
        }
    }
}

/**
 * The Room object that contains location, size, enemies, loot.
 * Representative of a location in game.
 */
class Room {
    constructor (x, y, w, h, key) {
        Object.assign(this, { x, y, w, h, key});

        
    }
}

class UnionFind {
    constructor(elements) {
        this.elements = elements;

       // Number of disconnected components
       this.count = elements.length;
 
       // Keep Track of connected components
       this.parent = {};
 
       // Initialize the data structure such that all
       // elements have themselves as parents
       elements.forEach(e => (this.parent[e] = e));
    }
 
    union(a, b) {
       let rootA = this.find(a);
       let rootB = this.find(b);
 
       // Roots are same so these are already connected.
       if (rootA === rootB) return;
 
       // Always make the element with smaller root the parent.
       if (rootA < rootB) {
          if (this.parent[b] != b) this.union(this.parent[b], a);
          this.parent[b] = this.parent[a];
       } else {
          if (this.parent[a] != a) this.union(this.parent[a], b);
          this.parent[a] = this.parent[b];
       }
    }
 
    // Returns final parent of a node
    find(a) {
       while (this.parent[a] !== a) {
          a = this.parent[a];
       }
       return a;
    }
 
    // Checks connectivity of the 2 nodes
    connected(a, b) {
       return this.find(a) === this.find(b);
    }

    allConnected() {
        for (var i = 0; i < this.count - 1; i++) {
            if (this.find(this.elements[i]) !== this.find(this.elements[i+1]))
                return false;
        }
        return true;
    }
 }