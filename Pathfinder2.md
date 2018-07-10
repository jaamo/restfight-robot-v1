=== Sample algorithm ===

This is a fairly simple and easy-to-understand pathfinding algorithm for tile-based maps. To start off, you have a map, a start coordinate and a destination coordinate. The map will look like this, <tt>X</tt> being walls, <tt>S</tt> being the start, <tt>O</tt> being the finish and <tt>_</tt> being open spaces, the numbers along the top and right edges are the column and row numbers:

```
   1 2 3 4 5 6 7 8
 X X X X X X X X X X
 X _ _ _ X X _ X _ X 1
 X _ X _ _ X _ _ _ X 2
 X S X X _ _ _ X _ X 3
 X _ X _ _ X _ _ _ X 4
 X _ _ _ X X _ X _ X 5
 X _ X _ _ X _ X _ X 6
 X _ X X _ _ _ X _ X 7
 X _ _ O _ X _ _ _ X 8
 X X X X X X X X X X
 ```

First, create a list of coordinates, which we will use as a queue. The queue will be initialized with one coordinate, the end coordinate. Each coordinate will also have a counter variable attached (the purpose of this will soon become evident). Thus, the queue starts off as ((3,8,0)).

Then, go through every element in the queue, including elements added to the end over the course of the algorithm, and to each element, do the following:

* Create a list of the four adjacent cells, with a counter variable of the current element's counter variable + 1 (in our example, the four cells are ((2,8,1),(3,7,1),(4,8,1),(3,9,1)))
* Check all cells in each list for the following two conditions:
   * If the cell is a wall, remove it from the list
   * If there is an element in the main list with the same coordinate and a less than or equal counter, remove it from the cells list
* Add all remaining cells in the list to the end of the main list
* Go to the next item in the list

Thus, after turn 1, the list of elements is this: ((3,8,0),(2,8,1),(4,8,1))
* After 2 turns: ((3,8,0),(2,8,1),(4,8,1),(1,8,2),(4,7,2))
* After 3 turns: (...(1,7,3),(4,6,3),(5,7,3))
* After 4 turns: (...(1,6,4),(3,6,4),(6,7,4))
* After 5 turns: (...(1,5,5),(3,5,5),(6,6,5),(6,8,5))
* After 6 turns: (...(1,4,6),(2,5,6),(3,4,6),(6,5,6),(7,8,6))
* After 7 turns: ((1,3,7)) – problem solved, end this stage of the algorithm – note that if you have multiple units chasing the same target (as in many games – the finish to start approach of the algorithm is intended to make this easier), you can continue until the entire map is taken up, all units are reached or a set counter limit is reached

Now, map the counters onto the map, getting this:

```
   1 2 3 4 5 6 7 8
 X X X X X X X X X X
 X _ _ _ X X _ X _ X 1
 X _ X _ _ X _ _ _ X 2
 X S X X _ _ _ X _ X 3
 X 6 X 6 _ X _ _ _ X 4
 X 5 6 5 X X 6 X _ X 5
 X 4 X 4 3 X 5 X _ X 6
 X 3 X X 2 3 4 X _ X 7
 X 2 1 0 1 X 5 6 _ X 8
 X X X X X X X X X X
 ```

Now, start at S (7) and go to the nearby cell with the lowest number (unchecked cells cannot be moved to). The path traced is (1,3,7) -> (1,4,6) -> (1,5,5) -> (1,6,4) -> (1,7,3) -> (1,8,2) -> (2,8,1) -> (3,8,0). In the event that two numbers are equally low (for example, if S was at (2,5)), pick a random direction – the lengths are the same. The algorithm is now complete.
