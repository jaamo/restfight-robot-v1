const fetch = require('node-fetch');
const querystring = require('querystring');


// 
// BaseBot that pretty much abstracts all communication with the backend.
// 
module.exports = class BaseBot {


    constructor(baseUrl = "") {

        // Baseurl defaults to local server but can be overriden.
        this.baseUrl = baseUrl == "" ? "http://127.0.0.1:8000/" : "http://" + process.argv[2] + "/";

        // Init variables.
        this.robotId = 0;
        this.status = [];    
        
        this.init();

    }    


    //
    // Join the game.
    //
    joinGame() {

        console.log('Join the game on server: ' + this.baseUrl);

        // Props.
        const params = {
            engineLevel: 1,
            shieldLevel: 1,
            weaponLevel: 0
        };

        // Call join REST endpoint.
        fetch(this.baseUrl + 'join?' + querystring.stringify(params)).then(response => {
            response.json().then(json => { 

                // Save robot id.
                this.robotId = json.robot_id;
                console.log('Joined to game. Robot id is ' + this.robotId);

                // Now we have joined the game and it's to to start waiting for our turn.
                this.waitForTurn();

            });
        });    

    }



    //
    // Wait for turn.
    //
    waitForTurn() {

        console.log('Wait for turn...');

        // Request game status. Remember to pass robot ID to get more meaningful response.
        fetch(this.baseUrl + 'status?' + querystring.stringify({robot_id: this.robotId})).then(response => {
            response.json().then(json => {

                // Check if it's your turn. If not, wait for 5 seconds and retry.
                if (json.is_your_turn == 1) {
                    this.getStatusAndPlayTurn();
                } else {
                    setTimeout(() => {
                        this.waitForTurn();
                    }, 1000)
                }

            });
        });

    }


    //
    // Load game status and play the turn.
    // 
    getStatusAndPlayTurn() {

        console.log('Get status and play turn.');

        // Get status just before our turn to make sure we have the latest info.
        fetch(this.baseUrl + 'status?' + querystring.stringify({robot_id: this.robotId})).then(response => {
            response.json().then(json => {

                // Save status.
                this.status = json;

                // Now run the actual decision making function.
                this.playTurn();

            });
        });    

    }


    //
    // Do whatever init stuff you want to do like init variables etc.
    //
    init() {

    }


    //
    // This is the actual logic executed when playing your turn. Just do your stuff 
    // and whenever you are done call `this.endTurn()` method.
    //
    playTurn() {

        console.log('Play turn.');

        this.endTurn();

    }


    //
    // End turn and start waiting for aa new one.
    // 
    endTurn() {

        console.log('Endturn.');

        fetch(this.baseUrl + 'endturn?' + querystring.stringify({robot_id: this.robotId})).then((response) => {
            response.text().then(text => {
                this.waitForTurn();
            });
        });

    }


    // 
    // Move.
    //
    move(x, y) {

        return new Promise((resolve, reject) => {

            let coords = {
                robot_id: this.robotId,
                x: x,
                y: y
            }
        
            fetch(this.baseUrl + 'move?' + querystring.stringify(coords)).then((response) => {
                if (response.status == 200) {
                    resolve();
                } else {
                    reject();
                }
            });
    
        });

        
    }

}