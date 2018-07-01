const BaseBot = require('./BaseBot.js');

module.exports = class Vayrynen extends BaseBot {

    //
    // This is the actual logic executed when playing your turn. Just do your stuff 
    // and whenever you are done call `this.endTurn()` method.
    //
    playTurn() {

        console.log('Play turn.');

        // let pathfinder = new Pathfinder(this.status.arena);
        // pathfinder.find(this.status.robot.x, this.status.robot.y, this.status.enemy.x, this.status.enemy.y);
        
        this.endTurn();

    }    

    // Return true if enemy is in range.
    enemyInRange() {

        let enemy = status.enemies[0];

        if (Math.abs(enemy.x - status.robot.x) <= status.robot.weapon_range 
            && Math.abs(enemy.y - status.robot.y) <= status.robot.weapon_range) {
            return true;
        } else {
            return false;
        }

    }


}