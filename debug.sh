#!/bin/bash
# Simple debug script to reset the game and throw in two robots.

curl http://127.0.0.1:8000/new

node index.js &
sleep 1
node index.js