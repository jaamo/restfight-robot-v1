const BaseBot = require('./BaseBot.js');
const Pathfinder = require('./Pathfinder.js');

module.exports = class Vayrynen extends BaseBot {    

    init() {

        this.decisions = {
            MOVE: 'MOVE',
            SHOOT: 'SHOOT',
            ENDTURN: 'ENDTURN'
        }
        
    }

    //
    // Brains.
    //
    // 
    //
    playTurn() {

        console.log('Play turn: ' + this.robotId);

        const decision = this.makeDecision();
        console.log('Decision: ' + decision);

        switch(decision) {
            case this.decisions.SHOOT:

                // this.shoot(this.status.enemy.x, this.status.enemy.y).then(() => {
                //     this.getStatusAndPlayTurn();
                // });

                break;
            case this.decisions.MOVE:

                // Find the shortest path.
                let pathfinder = new Pathfinder(this.status.arena);
                console.log('Finding shortest path from ' + this.status.robot.x + 'x' + this.status.robot.y + ' to ' + this.status.enemies[0].x + 'x' + this.status.enemies[0].y);
                const path = pathfinder.find(this.status.robot.x, this.status.robot.y, this.status.enemies[0].x, this.status.enemies[0].y);
                console.log('Ok!')
                console.log(path);

                // For some reason there's now path?! 
                if (path.length <= 2) {
                    console.log('No path...');
                    this.endTurn();
                    break;
                }

                console.log('Move to ' + path[1].x + 'x' + path[1].y);
                this.move(path[1].x, path[1].y).then(() => {
                    this.getStatusAndPlayTurn();
                });
        
                break;
            default:
                this.endTurn();
                break;
        }


    }
    
    //
    // Make decision.
    // 
    // MOVE - move closer the the enemy
    // SHOOT - shoot the enemy
    // ENDTURN - nothing to do so quit
    //
    makeDecision() {

        // Enemy is in range => shoot
        if (this.enemyInRange() && this.status.robot.weapon_ammo > 0) {
            return this.decisions.SHOOT;
        } else if (this.status.robot.moves > 0) {
            return this.decisions.MOVE;
        } else {
            return this.decisions.ENDTURN;
        }

    }

    // Return true if enemy is in range.
    enemyInRange() {

        const enemy = this.status.enemies[0];
        const robot = this.status.robot;

        if (Math.abs(enemy.x - robot.x) <= robot.weapon_range 
            && Math.abs(enemy.y - robot.y) <= robot.weapon_range) {
            return true;
        } else {
            return false;
        }

    }


}