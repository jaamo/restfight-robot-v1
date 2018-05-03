const fetch = require('node-fetch');
const querystring = require('querystring');

// Server url.
const baseUrl = 'http://127.0.0.1:8000/';

// Robots id. This is set after joining the game.
let robotId = 0;

// Game status object returned from the server.
let status = {};

// This function joins the game.
function joinGame() {

    console.log('Join game.');

    // Props.
    const params = {
        engineLevel: 1,
        shieldLevel: 1,
        weaponLevel: 0
    };

    // Now it's time to make our first API call! We call `/join` endpoint with our parameters.
    fetch(baseUrl + 'join?' + querystring.stringify(params)).then(response => {
        response.json().then(json => { 

            // Robot object is returned as a response.
            // We save only the ID at this point for future usage.
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

// Our main AI has two functions. This first one loads the game status so that we have the latest
// information for our decision making logic.
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

// This function is the brains of the robot! Decisions are made here. 
// This function sequentially calls itself until there's nothing to do and it's time to end turn.
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

// Now we have defined everything. It's time to start the game!
joinGame();
