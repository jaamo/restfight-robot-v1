const assert = require('assert');
const Pathfinder2 = require('../Pathfinder2.js');

const arena = [[{"type":1,"x":0,"y":0,"robot":{"robot_id":1531200266760705000,"robot_index":0,"shield_level":1,"health":10,"max_health":10,"capacity":0,"max_capacity":10,"x":0,"y":0,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":0,"weapon_range":2,"weapon_power":2,"weapon_ammo":1}},{"type":0,"x":0,"y":1,"robot":null},{"type":0,"x":0,"y":2,"robot":null},{"type":0,"x":0,"y":3,"robot":null},{"type":0,"x":0,"y":4,"robot":null},{"type":0,"x":0,"y":5,"robot":null},{"type":0,"x":0,"y":6,"robot":null},{"type":0,"x":0,"y":7,"robot":null},{"type":0,"x":0,"y":8,"robot":null},{"type":0,"x":0,"y":9,"robot":null}],[{"type":0,"x":1,"y":0,"robot":null},{"type":0,"x":1,"y":1,"robot":null},{"type":0,"x":1,"y":2,"robot":null},{"type":0,"x":1,"y":3,"robot":null},{"type":0,"x":1,"y":4,"robot":null},{"type":0,"x":1,"y":5,"robot":null},{"type":0,"x":1,"y":6,"robot":null},{"type":0,"x":1,"y":7,"robot":null},{"type":0,"x":1,"y":8,"robot":null},{"type":0,"x":1,"y":9,"robot":null}],[{"type":0,"x":2,"y":0,"robot":null},{"type":0,"x":2,"y":1,"robot":null},{"type":0,"x":2,"y":2,"robot":null},{"type":0,"x":2,"y":3,"robot":null},{"type":0,"x":2,"y":4,"robot":null},{"type":0,"x":2,"y":5,"robot":null},{"type":0,"x":2,"y":6,"robot":null},{"type":0,"x":2,"y":7,"robot":null},{"type":0,"x":2,"y":8,"robot":null},{"type":0,"x":2,"y":9,"robot":null}],[{"type":0,"x":3,"y":0,"robot":null},{"type":2,"x":3,"y":1,"robot":null},{"type":2,"x":3,"y":2,"robot":null},{"type":2,"x":3,"y":3,"robot":null},{"type":0,"x":3,"y":4,"robot":null},{"type":0,"x":3,"y":5,"robot":null},{"type":0,"x":3,"y":6,"robot":null},{"type":0,"x":3,"y":7,"robot":null},{"type":0,"x":3,"y":8,"robot":null},{"type":0,"x":3,"y":9,"robot":null}],[{"type":0,"x":4,"y":0,"robot":null},{"type":0,"x":4,"y":1,"robot":null},{"type":0,"x":4,"y":2,"robot":null},{"type":0,"x":4,"y":3,"robot":null},{"type":0,"x":4,"y":4,"robot":null},{"type":0,"x":4,"y":5,"robot":null},{"type":0,"x":4,"y":6,"robot":null},{"type":0,"x":4,"y":7,"robot":null},{"type":0,"x":4,"y":8,"robot":null},{"type":0,"x":4,"y":9,"robot":null}],[{"type":0,"x":5,"y":0,"robot":null},{"type":0,"x":5,"y":1,"robot":null},{"type":0,"x":5,"y":2,"robot":null},{"type":0,"x":5,"y":3,"robot":null},{"type":0,"x":5,"y":4,"robot":null},{"type":0,"x":5,"y":5,"robot":null},{"type":0,"x":5,"y":6,"robot":null},{"type":0,"x":5,"y":7,"robot":null},{"type":0,"x":5,"y":8,"robot":null},{"type":0,"x":5,"y":9,"robot":null}],[{"type":0,"x":6,"y":0,"robot":null},{"type":0,"x":6,"y":1,"robot":null},{"type":0,"x":6,"y":2,"robot":null},{"type":0,"x":6,"y":3,"robot":null},{"type":0,"x":6,"y":4,"robot":null},{"type":0,"x":6,"y":5,"robot":null},{"type":2,"x":6,"y":6,"robot":null},{"type":2,"x":6,"y":7,"robot":null},{"type":2,"x":6,"y":8,"robot":null},{"type":0,"x":6,"y":9,"robot":null}],[{"type":0,"x":7,"y":0,"robot":null},{"type":0,"x":7,"y":1,"robot":null},{"type":0,"x":7,"y":2,"robot":null},{"type":0,"x":7,"y":3,"robot":null},{"type":0,"x":7,"y":4,"robot":null},{"type":0,"x":7,"y":5,"robot":null},{"type":0,"x":7,"y":6,"robot":null},{"type":0,"x":7,"y":7,"robot":null},{"type":0,"x":7,"y":8,"robot":null},{"type":0,"x":7,"y":9,"robot":null}],[{"type":0,"x":8,"y":0,"robot":null},{"type":0,"x":8,"y":1,"robot":null},{"type":0,"x":8,"y":2,"robot":null},{"type":0,"x":8,"y":3,"robot":null},{"type":0,"x":8,"y":4,"robot":null},{"type":0,"x":8,"y":5,"robot":null},{"type":0,"x":8,"y":6,"robot":null},{"type":0,"x":8,"y":7,"robot":null},{"type":0,"x":8,"y":8,"robot":null},{"type":0,"x":8,"y":9,"robot":null}],[{"type":0,"x":9,"y":0,"robot":null},{"type":0,"x":9,"y":1,"robot":null},{"type":0,"x":9,"y":2,"robot":null},{"type":0,"x":9,"y":3,"robot":null},{"type":0,"x":9,"y":4,"robot":null},{"type":0,"x":9,"y":5,"robot":null},{"type":0,"x":9,"y":6,"robot":null},{"type":0,"x":9,"y":7,"robot":null},{"type":0,"x":9,"y":8,"robot":null},{"type":1,"x":9,"y":9,"robot":{"robot_id":1531200269174899000,"robot_index":1,"shield_level":0,"health":6,"max_health":6,"capacity":0,"max_capacity":10,"x":9,"y":9,"engine_level":1,"max_moves":4,"moves":4,"weapon_level":1,"weapon_range":4,"weapon_power":4,"weapon_ammo":1}}]];

describe('Map', () => {
    it('have right coordinates', () => {

        assert.equal(arena[1][2].x, 1);
        assert.equal(arena[1][2].y, 2);

        assert.equal(arena[5][7].x, 5);
        assert.equal(arena[5][7].y, 7);

    });
});


describe('Pathfinder', () => {
    describe('.find(0, 0, 2, 5)', () => {
        const pathfinder = new Pathfinder2(arena);
        const route = pathfinder.find(0, 0, 2, 5);
        it('should return a route with 7 steps.', () => {
            assert.equal(route.length, 7);
        });
    });
    describe('.find(0, 0, 5, 0)', () => {
        const pathfinder = new Pathfinder2(arena);
        const route = pathfinder.find(0, 0, 5, 0);
        it('should return a route with 5 steps.', () => {
            assert.equal(route.length, 5);
        });
    });
    describe('.find(0, 0, 0, 4)', () => {
        const pathfinder = new Pathfinder2(arena);
        const route = pathfinder.find(0, 0, 0, 4);
        it('should return a route with 4 steps.', () => {
            assert.equal(route.length, 4);
        });
    });
    describe('.find(0, 0, 9, 9)', () => {
        const pathfinder = new Pathfinder2(arena);
        const route = pathfinder.find(0, 0, 9, 9);
        it('should return a route with 9 steps.', () => {
            assert.equal(route.length, 18);
        });
    });
});
