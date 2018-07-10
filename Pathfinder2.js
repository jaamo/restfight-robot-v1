//
// Path finding based on sample algorithm:
// https://en.wikipedia.org/wiki/Pathfinding
//
module.exports = class Pathfinder2 {


    constructor(arena) {

        // Arena.
        this.arena = arena;

        // Queue
        this.queue = [];
        this.queueIndex = 0;

        // Final route.
        this.route = [];

        // Safety thingie.
        this.findShortestRouteCount = 0;

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

        this.startCoordinate = {
            x: fromX,
            y: fromY,
            weight: 0
        };

        this.targetCoordinate = {
            x: toX,
            y: toY,
            weight: 0
        };

        // Push end coordinate to the queue. Add weight 0.
        this.queue.push(this.targetCoordinate);

        // Recursively process coordinates.
        this.processNextCoordinate();

        // console.log('\nArena:');
        // this.printArena();

        const start = this.getCoordinateFromQueue(this.startCoordinate.x, this.startCoordinate.y);
        // this.route.push(start);
        this.findShortestRoute(this.startCoordinate.x, this.startCoordinate.y, start.weight);

        // console.log('\nRoute:');
        // this.printRoute();
        // console.log('\n');
        // console.log(this.route);

        return this.route;

    }


    processNextCoordinate() {

        // console.log('Queue:');
        // console.log(this.queue);

        // We are done.
        if (this.queueIndex >= this.queue.length) {
            // console.log('No cells left in queue.');
            return false;
        }

        // Current coordinate.
        const coordinate = this.queue[this.queueIndex];
        const newWeight = coordinate.weight + 1;

        // Current coordinate is our target. We found it!
        if (coordinate.x == this.startCoordinate.x && coordinate.y == this.startCoordinate.y) {
            return true;
        }

        // New cells.
        let newCells = [];

        // Get surrounding cells and check their availability.
        [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}].forEach((offset) => {

            // New coordinates.
            const newCoordinate = {
                x: coordinate.x + offset.x, 
                y: coordinate.y + offset.y, 
                weight: newWeight
            };

            // Add to list.
            if (this.isCellAvailable(newCoordinate.x, newCoordinate.y, newCoordinate.weight)) {
                newCells.push(newCoordinate);
            }

        });

        // Add new cells to queue.
        this.queue = this.queue.concat(newCells);

        this.queueIndex++;
        this.processNextCoordinate();

    }


    //
    // Find the shortest route from the list.
    // 
    findShortestRoute(x, y, weight) {

        this.findShortestRouteCount++;
        if (this.findShortestRouteCount == 1000) {
            return false;
        }

        // Now search for queue for start.
        const lowestSurrounding = this.findLowestSurrounding(x, y, weight);

        if (lowestSurrounding) {
            this.route.push(lowestSurrounding);
            this.findShortestRoute(lowestSurrounding.x, lowestSurrounding.y, lowestSurrounding.weight);
        } else {
            return true;
        }

    }


    // 
    // Find surrounding cell with lowest weight.
    //
    findLowestSurrounding(x, y, weight) {

        let lowestCoordinate = false;

        [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}].forEach((offset) => {

            // Find coordinate on given point (if exists).
            const candidate = this.getCoordinateFromQueue(x + offset.x, y + offset.y);

            if (candidate) {
                if (candidate.weight < weight) {
                    lowestCoordinate = candidate;
                }
            }

        });

        return lowestCoordinate;

    }


    //
    // Get item from queue.
    //
    getCoordinateFromQueue(x, y) {
        
        const candidate = this.queue.filter((coordinate) => {
            return coordinate.x == x && coordinate.y == y
        })

        if (candidate.length > 0) {
            return candidate[0];
        } else {
            return false;
        }

    }
    

    // Checks whether give cell is free or not. Also check If there is not an 
    // element in the main list with the same coordinate and a less than 
    // or equal counter.
    // 
    // Returns true or false.
    isCellAvailable(x, y, weight) {

        // Find same coordinates from the queue with weight less or equal.
        const matches = this.queue.filter((coordinate, i) => {
            return coordinate.x == x && coordinate.y == y && coordinate.weight <= weight;
        });

        // Point is not available.
        return typeof(this.arena[y]) != 'undefined' 
            && typeof(this.arena[y][x]) != "undefined"
            && this.arena[y][x].type == 0
            && matches.length == 0;

    }


    //
    // Print arena and weights.
    //
    printArena() {

        for (let x = 0; x < this.arena.length; x++) {
            let row = '';
            for (let y = 0; y < this.arena[x].length; y++) {

                let character = ' _';

                const coordinate = this.getCoordinateFromQueue(x, y);
                if (coordinate) {
                    character = coordinate.weight < 10 ? '0' + coordinate.weight : coordinate.weight;
                }
                if (this.arena[y][x].type != 0) {
                    character = ' #';
                }

                row += character + ' ';

            }
            console.log(row);
        }

    }


    //
    // Print arena and route.
    //
    printRoute() {

        for (let x = 0; x < this.arena.length; x++) {
            let row = '';
            for (let y = 0; y < this.arena[x].length; y++) {

                let character = '_';

                const candidate = this.route.filter((coordinate) => {
                    return coordinate.x == x && coordinate.y == y
                });
                if (candidate.length > 0) {
                    character = 'X';
                }     

                if (this.arena[y][x].type != 0) {
                    character = '#';
                }

                row += character + ' ';

            }
            console.log(row);
        }

    }    



}
