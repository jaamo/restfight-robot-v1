const fetch = require('node-fetch');
const querystring = require('querystring');

// Server url.
let baseUrl = '';
if (process.argv.length > 2) {
    baseUrl = 'http://' + process.argv[2] + '/';
} else {
    baseUrl = 'http://127.0.0.1:8000/';    
}

// Robots id. This is set after joining the game.
let robotId = 0;

// Game status object returned from the server.
let status = {};

// Join the game.
function joinGame() {

    console.log('Join game.');

    // Props.
    const params = {
        engineLevel: 1,
        shieldLevel: 1,
        weaponLevel: 0
    };

    fetch(baseUrl + 'join?' + querystring.stringify(params)).then(response => {
        response.json().then(json => { 

            // Grab id.
            robotId = json.robot_id;
            console.log('Joined to game. Robot id is ' + robotId);

            // Now we have joined the game and it's to to start waiting for our turn.
            waitForTurn();

        });
    });    

}

 
// Now we just wait until it's our turn.
function waitForTurn() {

    console.log('Wait for turn...');

    // Request game status. Remember to pass robot ID to get more meaningful response.
    fetch(baseUrl + 'status?' + querystring.stringify({robot_id: robotId})).then(response => {
        response.json().then(json => {

            // Check if it's your turn. If not, wait for 5 seconds and retry.
            if (json.is_your_turn == 1) {
                getStatusAndPlayTurn();
            } else {
                setTimeout(() => {
                    waitForTurn();
                }, 5000)
            }

        });
    });

}

// Load game status and play the turn.
function getStatusAndPlayTurn() {

    console.log('Get status.');

    // Call status as we did above.
    fetch(baseUrl + 'status?' + querystring.stringify({robot_id: robotId})).then(response => {
        response.json().then(json => {

            // Save status.
            status = json;

            // Now run the actual decision making function.
            playTurn();

        });
    });    

}

// Magic.
function playTurn() {

    console.log('Play turn.');

    // Save enemy to it's own variable to keep the code cleaner.
    let enemy = status.enemies[0];

    // First we check if we are done.
    // If we can't move anymore or we are out of ammo we end our turn.
    if (status.robot.moves == 0 || status.robot.weapon_ammo == 0) {

        // Call end turn endpoint and then jump to waiting loop.
        fetch(baseUrl + 'endturn?' + querystring.stringify({robot_id: status.robot.robot_id})).then((response) => {
            response.text().then(text => {
                waitForTurn();
            });
        });

    } 
    // Check if our enemy is close enough and we can shoot.
    else if (enemyInRange()) {

        console.log('Shoot to location ' + enemy.x + ' x ' + enemy.y + '.');

        // Shoot enemy.
        let coords = {
            robot_id: status.robot.robot_id,
            x: enemy.x,
            y: enemy.y
        }        
        fetch(baseUrl + 'shoot?' + querystring.stringify(coords)).then((response) => {
            response.json().then(json => {
                getStatusAndPlayTurn();
            });
        });        

    } 
    // Move horizontally.
    else if (enemy.x != status.robot.x) {

        let coords = {
            robot_id: status.robot.robot_id,
            x: status.robot.x,
            y: status.robot.y
        }
        
        if (enemy.x < status.robot.x) {
            coords.x--;
        } else {
            coords.x++;
        }

        console.log('Move horizontally to location ' + coords.x + ' x ' + coords.y + '.');

        fetch(baseUrl + 'move?' + querystring.stringify(coords)).then((response) => {
            response.json().then(json => {
                getStatusAndPlayTurn();
            });
        });

    }     
    // Move vertically.
    else {

        console.log('Move vertically.');

        let coords = {
            robot_id: status.robot.robot_id,
            x: status.robot.x,
            y: status.robot.y
        }
        
        if (enemy.y < status.robot.y) {
            coords.y--;
        } else {
            coords.y++;
        }

        console.log('Move horizontally to location ' + coords.x + ' x ' + coords.y + '.');

        fetch(baseUrl + 'move?' + querystring.stringify(coords)).then((response) => {
            response.json().then(json => {
                getStatusAndPlayTurn();
            });
        });
        
    }
 
}


// Return true if enemy is in range.
function enemyInRange() {

    let enemy = status.enemies[0];

    if (Math.abs(enemy.x - status.robot.x) <= status.robot.weapon_range 
        && Math.abs(enemy.y - status.robot.y) <= status.robot.weapon_range) {
        return true;
    } else {
        return false;
    }

}


/**
 * Find the shortest path between two points.
 */
class Pathfinder {

    constructor(arena) {

        // Arena.
        this.arena = arena;

        // All unfinished paths.
        this.unresolvedPaths = [];
        
        // All paths.
        this.resolvedPaths = [];
        
        // Current shortest path.
        this.shortestPath = false;

        // Hard coded max path length.
        this.maxPathLength = 20;

    }

    /**
     * Return a shortest route from point a to point b.
     * 
     * @param {*} fromX 
     * @param {*} fromY 
     * @param {*} toX 
     * @param {*} toY 
     */
    find(fromX, fromY, toX, toY) {

        this.toX = toX;
        this.toY = toY;
        const maxIterations = 10000000;
        let iterations = 0;

        // Add first path to unresolved paths.
        this.unresolvedPaths.push([{x: fromX, y: fromY}]);

        const start = (new Date()).getTime();

        // Loop as long as we have paths.
        while (this.unresolvedPaths.length > 0) {

            // console.log('We currently have ' + this.unresolvedPaths.length + ' paths to resolve.');

            // Pop out the last path.
            let path = this.unresolvedPaths.shift();

            // Resolve path.
            let success = this.nextStep(path, 0);

            // UUUJEAH! We found a path and it's shorted that what we have atm.
            if (success && (this.shortestPath == false || path.length < this.shortestPath.length)) {
                this.shortestPath = path;
            }

            // Add to resolved.
            this.resolvedPaths.push(path);

            if (++iterations == maxIterations) {
                return;
            }
            
        }

        const end = (new Date()).getTime();

        console.log('Paths resolved: ' + this.resolvedPaths.length);        
        console.log('Time elapsed: ' + Math.round((end - start) / 1000) + ' seconds');
        console.log('Shortest path: ');
        console.log(this.shortestPath);

    }

    /**
     * Process next step.
     * 
     * @param {*} path 
     * @param {*} depth 
     */
    nextStep(path, depth) {

        if (depth > 100) {
            console.log('Max depth exceed.');
            return false;
        }

        // We have already found a succesful shorted path. No point to continue this path.
        if (path.length > this.maxPathLength || (this.shortestPath != false && path.length > this.shortestPath.length)) {
            // console.log('Path too long (' + path.length + ', shortest is ' + this.shortestPath.length + '), resolving cancelled.');
            return false;
        }

        // Take latest item out from the current path.
        const x = path[path.length - 1].x;
        const y = path[path.length - 1].y;

        // Enemy found?
        if (x == this.toX && y == this.toY) {
            // console.log("Found target at location " + x + " x " + y + ". Path length " + path.length);
            return true;
        }

        // Get all possible alternatives.
        let alternatives = this.getAlternatives(x, y, path);

        // Nothing found. Dead end.
        if (alternatives.length == 0) {
            // console.log("Dead end");
            return false;
        }
        
        // Pick the first one.
        let nextPoint = alternatives.shift();

        // Add other alternatives as new paths.
        alternatives.forEach((alternative) => {

            // Deep clone current path.
            let newPath = JSON.parse(JSON.stringify(path));

            // Add new alternative and add to unresolved list.
            newPath.push(alternative);
            this.unresolvedPaths.push(newPath);

            // console.log(newPath);

        })

        // Add point to path.
        path.push(nextPoint);

        // Recursively continue traversing.
        return this.nextStep(path, ++depth);

    }

    /**
     * Get possible directions around given point. 
     * Current path is required to prevent path "crossing itself".
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} path
     */
    getAlternatives(x, y, path) {

        let alternatives = [];

        // Check surroundings.
        [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}].forEach((offset) => {

            let newX = x + offset.x;
            let newY = y + offset.y;

            // Check if the new point is outside of the arena.
            if (newX < 0 || newX >= this.arena.length || newY < 0 || newY >= this.arena[0].length) {
                return;
            }

            // Check if the new point is colliding with an obstacle.
            if (this.arena[newX][newY].type == 2) {
                return;
            }

            // Check if the new point is already on the current path.
            if (path.find(cell => cell.x == newX && cell.y == newY)) {
                return;
            }

            // OUJEAH! The new point is inside arena and empty non-traversed cell.
            alternatives.push({x: newX, y: newY});
        
        });

        return alternatives;

    }

}

// Now we have defined everything. It's time to start the game!
// joinGame();

// let arena = [[{"type":1,"x":0,"y":0,"robot":{"robot_id":1526404745787585981,"robot_index":0,"shield_level":1,"health":10,"max_health":10,"capacity":0,"max_capacity":10,"x":0,"y":0,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":0,"weapon_range":2,"weapon_power":2,"weapon_ammo":1}},{"type":0,"x":0,"y":1,"robot":null},{"type":0,"x":0,"y":2,"robot":null},{"type":0,"x":0,"y":3,"robot":null},{"type":0,"x":0,"y":4,"robot":null},{"type":0,"x":0,"y":5,"robot":null},{"type":0,"x":0,"y":6,"robot":null},{"type":0,"x":0,"y":7,"robot":null},{"type":0,"x":0,"y":8,"robot":null},{"type":0,"x":0,"y":9,"robot":null}],[{"type":0,"x":1,"y":0,"robot":null},{"type":0,"x":1,"y":1,"robot":null},{"type":0,"x":1,"y":2,"robot":null},{"type":0,"x":1,"y":3,"robot":null},{"type":0,"x":1,"y":4,"robot":null},{"type":0,"x":1,"y":5,"robot":null},{"type":0,"x":1,"y":6,"robot":null},{"type":0,"x":1,"y":7,"robot":null},{"type":0,"x":1,"y":8,"robot":null},{"type":0,"x":1,"y":9,"robot":null}],[{"type":0,"x":2,"y":0,"robot":null},{"type":0,"x":2,"y":1,"robot":null},{"type":0,"x":2,"y":2,"robot":null},{"type":0,"x":2,"y":3,"robot":null},{"type":0,"x":2,"y":4,"robot":null},{"type":0,"x":2,"y":5,"robot":null},{"type":0,"x":2,"y":6,"robot":null},{"type":0,"x":2,"y":7,"robot":null},{"type":0,"x":2,"y":8,"robot":null},{"type":0,"x":2,"y":9,"robot":null}],[{"type":0,"x":3,"y":0,"robot":null},{"type":2,"x":3,"y":1,"robot":null},{"type":2,"x":3,"y":2,"robot":null},{"type":2,"x":3,"y":3,"robot":null},{"type":0,"x":3,"y":4,"robot":null},{"type":0,"x":3,"y":5,"robot":null},{"type":0,"x":3,"y":6,"robot":null},{"type":0,"x":3,"y":7,"robot":null},{"type":0,"x":3,"y":8,"robot":null},{"type":0,"x":3,"y":9,"robot":null}],[{"type":0,"x":4,"y":0,"robot":null},{"type":0,"x":4,"y":1,"robot":null},{"type":0,"x":4,"y":2,"robot":null},{"type":0,"x":4,"y":3,"robot":null},{"type":0,"x":4,"y":4,"robot":null},{"type":0,"x":4,"y":5,"robot":null},{"type":0,"x":4,"y":6,"robot":null},{"type":0,"x":4,"y":7,"robot":null},{"type":0,"x":4,"y":8,"robot":null},{"type":0,"x":4,"y":9,"robot":null}],[{"type":0,"x":5,"y":0,"robot":null},{"type":0,"x":5,"y":1,"robot":null},{"type":0,"x":5,"y":2,"robot":null},{"type":0,"x":5,"y":3,"robot":null},{"type":0,"x":5,"y":4,"robot":null},{"type":0,"x":5,"y":5,"robot":null},{"type":0,"x":5,"y":6,"robot":null},{"type":0,"x":5,"y":7,"robot":null},{"type":0,"x":5,"y":8,"robot":null},{"type":0,"x":5,"y":9,"robot":null}],[{"type":0,"x":6,"y":0,"robot":null},{"type":0,"x":6,"y":1,"robot":null},{"type":0,"x":6,"y":2,"robot":null},{"type":0,"x":6,"y":3,"robot":null},{"type":0,"x":6,"y":4,"robot":null},{"type":0,"x":6,"y":5,"robot":null},{"type":2,"x":6,"y":6,"robot":null},{"type":2,"x":6,"y":7,"robot":null},{"type":2,"x":6,"y":8,"robot":null},{"type":0,"x":6,"y":9,"robot":null}],[{"type":0,"x":7,"y":0,"robot":null},{"type":0,"x":7,"y":1,"robot":null},{"type":0,"x":7,"y":2,"robot":null},{"type":0,"x":7,"y":3,"robot":null},{"type":0,"x":7,"y":4,"robot":null},{"type":0,"x":7,"y":5,"robot":null},{"type":0,"x":7,"y":6,"robot":null},{"type":0,"x":7,"y":7,"robot":null},{"type":0,"x":7,"y":8,"robot":null},{"type":0,"x":7,"y":9,"robot":null}],[{"type":0,"x":8,"y":0,"robot":null},{"type":0,"x":8,"y":1,"robot":null},{"type":0,"x":8,"y":2,"robot":null},{"type":0,"x":8,"y":3,"robot":null},{"type":0,"x":8,"y":4,"robot":null},{"type":0,"x":8,"y":5,"robot":null},{"type":0,"x":8,"y":6,"robot":null},{"type":0,"x":8,"y":7,"robot":null},{"type":0,"x":8,"y":8,"robot":null},{"type":0,"x":8,"y":9,"robot":null}],[{"type":0,"x":9,"y":0,"robot":null},{"type":0,"x":9,"y":1,"robot":null},{"type":0,"x":9,"y":2,"robot":null},{"type":0,"x":9,"y":3,"robot":null},{"type":0,"x":9,"y":4,"robot":null},{"type":0,"x":9,"y":5,"robot":null},{"type":0,"x":9,"y":6,"robot":null},{"type":0,"x":9,"y":7,"robot":null},{"type":0,"x":9,"y":8,"robot":null},{"type":1,"x":9,"y":9,"robot":{"robot_id":1527356902469459472,"robot_index":1,"shield_level":0,"health":6,"max_health":6,"capacity":0,"max_capacity":10,"x":9,"y":9,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":1,"weapon_range":4,"weapon_power":4,"weapon_ammo":1}}]];
let arena = [[{"type":1,"x":0,"y":0,"robot":{"robot_id":1526404745787585981,"robot_index":0,"shield_level":1,"health":10,"max_health":10,"capacity":0,"max_capacity":10,"x":0,"y":0,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":0,"weapon_range":2,"weapon_power":2,"weapon_ammo":1}},{"type":0,"x":0,"y":1,"robot":null},{"type":0,"x":0,"y":2,"robot":null},{"type":0,"x":0,"y":3,"robot":null},{"type":0,"x":0,"y":4,"robot":null},{"type":0,"x":0,"y":5,"robot":null},{"type":0,"x":0,"y":6,"robot":null},{"type":0,"x":0,"y":7,"robot":null},{"type":0,"x":0,"y":8,"robot":null},{"type":0,"x":0,"y":9,"robot":null}],[{"type":0,"x":1,"y":0,"robot":null},{"type":0,"x":1,"y":1,"robot":null},{"type":0,"x":1,"y":2,"robot":null},{"type":0,"x":1,"y":3,"robot":null},{"type":0,"x":1,"y":4,"robot":null},{"type":0,"x":1,"y":5,"robot":null},{"type":0,"x":1,"y":6,"robot":null},{"type":0,"x":1,"y":7,"robot":null},{"type":0,"x":1,"y":8,"robot":null},{"type":0,"x":1,"y":9,"robot":null}],[{"type":0,"x":2,"y":0,"robot":null},{"type":0,"x":2,"y":1,"robot":null},{"type":0,"x":2,"y":2,"robot":null},{"type":0,"x":2,"y":3,"robot":null},{"type":0,"x":2,"y":4,"robot":null},{"type":0,"x":2,"y":5,"robot":null},{"type":0,"x":2,"y":6,"robot":null},{"type":0,"x":2,"y":7,"robot":null},{"type":0,"x":2,"y":8,"robot":null},{"type":0,"x":2,"y":9,"robot":null}],[{"type":0,"x":3,"y":0,"robot":null},{"type":0,"x":3,"y":1,"robot":null},{"type":0,"x":3,"y":2,"robot":null},{"type":0,"x":3,"y":3,"robot":null},{"type":0,"x":3,"y":4,"robot":null},{"type":0,"x":3,"y":5,"robot":null},{"type":0,"x":3,"y":6,"robot":null},{"type":0,"x":3,"y":7,"robot":null},{"type":0,"x":3,"y":8,"robot":null},{"type":0,"x":3,"y":9,"robot":null}],[{"type":0,"x":4,"y":0,"robot":null},{"type":0,"x":4,"y":1,"robot":null},{"type":0,"x":4,"y":2,"robot":null},{"type":0,"x":4,"y":3,"robot":null},{"type":0,"x":4,"y":4,"robot":null},{"type":0,"x":4,"y":5,"robot":null},{"type":0,"x":4,"y":6,"robot":null},{"type":0,"x":4,"y":7,"robot":null},{"type":0,"x":4,"y":8,"robot":null},{"type":0,"x":4,"y":9,"robot":null}],[{"type":0,"x":5,"y":0,"robot":null},{"type":0,"x":5,"y":1,"robot":null},{"type":0,"x":5,"y":2,"robot":null},{"type":0,"x":5,"y":3,"robot":null},{"type":0,"x":5,"y":4,"robot":null},{"type":0,"x":5,"y":5,"robot":null},{"type":0,"x":5,"y":6,"robot":null},{"type":0,"x":5,"y":7,"robot":null},{"type":0,"x":5,"y":8,"robot":null},{"type":0,"x":5,"y":9,"robot":null}],[{"type":0,"x":6,"y":0,"robot":null},{"type":0,"x":6,"y":1,"robot":null},{"type":0,"x":6,"y":2,"robot":null},{"type":0,"x":6,"y":3,"robot":null},{"type":0,"x":6,"y":4,"robot":null},{"type":0,"x":6,"y":5,"robot":null},{"type":0,"x":6,"y":6,"robot":null},{"type":0,"x":6,"y":7,"robot":null},{"type":0,"x":6,"y":8,"robot":null},{"type":0,"x":6,"y":9,"robot":null}],[{"type":0,"x":7,"y":0,"robot":null},{"type":0,"x":7,"y":1,"robot":null},{"type":0,"x":7,"y":2,"robot":null},{"type":0,"x":7,"y":3,"robot":null},{"type":0,"x":7,"y":4,"robot":null},{"type":0,"x":7,"y":5,"robot":null},{"type":0,"x":7,"y":6,"robot":null},{"type":0,"x":7,"y":7,"robot":null},{"type":0,"x":7,"y":8,"robot":null},{"type":0,"x":7,"y":9,"robot":null}],[{"type":0,"x":8,"y":0,"robot":null},{"type":0,"x":8,"y":1,"robot":null},{"type":0,"x":8,"y":2,"robot":null},{"type":0,"x":8,"y":3,"robot":null},{"type":0,"x":8,"y":4,"robot":null},{"type":0,"x":8,"y":5,"robot":null},{"type":0,"x":8,"y":6,"robot":null},{"type":0,"x":8,"y":7,"robot":null},{"type":0,"x":8,"y":8,"robot":null},{"type":0,"x":8,"y":9,"robot":null}],[{"type":0,"x":9,"y":0,"robot":null},{"type":0,"x":9,"y":1,"robot":null},{"type":0,"x":9,"y":2,"robot":null},{"type":0,"x":9,"y":3,"robot":null},{"type":0,"x":9,"y":4,"robot":null},{"type":0,"x":9,"y":5,"robot":null},{"type":0,"x":9,"y":6,"robot":null},{"type":0,"x":9,"y":7,"robot":null},{"type":0,"x":9,"y":8,"robot":null},{"type":1,"x":9,"y":9,"robot":{"robot_id":1527356902469459472,"robot_index":1,"shield_level":0,"health":6,"max_health":6,"capacity":0,"max_capacity":10,"x":9,"y":9,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":1,"weapon_range":4,"weapon_power":4,"weapon_ammo":1}}]];

let pathfinder = new Pathfinder(arena);
pathfinder.find(0, 0, 5, 5);
