
/**
 * Find the shortest path between two points. Brute force algrorithm from my head.
 * Can be veeeeery slow.
 * 
 * Usage:
 * 
 * 1. Init object by providing arena-array: let pathfinder = new Pathfinder(arena);
 * 2. Find a shortest path between two points: pathfinder.find(0, 0, 5, 5);
 * 
 * find-method returns an array of coordinates of the shortest path:
 * 
 * [ { x: 0, y: 0 },
 *   { x: 0, y: 1 },
 *   { x: 0, y: 2 },
 *   { x: 0, y: 3 },
 *   { x: 0, y: 4 },
 *   { x: 0, y: 5 },
 *   { x: 1, y: 5 },
 *   { x: 2, y: 5 },
 *   { x: 3, y: 5 },
 *   { x: 4, y: 5 },
 *   { x: 5, y: 5 } ] 
 * 
 */
module.exports = class Pathfinder {

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
        this.maxPathLength = 30;

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

            console.log('We currently have ' + this.unresolvedPaths.length + ' paths to resolve. Shortest path at the moment: ' + (this.shortestPath ? this.shortestPath.length : 'N/A'));

            // Pop out the last path.
            let path = this.unresolvedPaths.shift();

            // Resolve path.
            let success = this.nextStep(path, 0);

            // UUUJEAH! We found a path and it's shorted that what we have atm.
            if (success && (this.shortestPath == false || path.length < this.shortestPath.length)) {
                this.shortestPath = path;
            }

            // Ooooookeeee so we have shortest path and seems that we have shit load of unresolved paths.
            // What if we just fuck off?
            if (this.shortestPath && this.unresolvedPaths.length > 10000) {
                break;
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
        return this.shortestPath;

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

        // We have already found a succesful shorter path. No point to continue this path.
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

