/* This solver uses A* algorithm with manhatten distance heuristic
 * @author Himanshu Gupta<g.himanshu@gmail.com>
 *
 * It assumes that 8puzzle is represented with a 1 dim array of 9
 * elements 1-9 with 9 being the empty square, so any permutation
 * of [1,2,3,4,5,6,7,8,9] is one instance of the puzzle.
 */

//Adding some utilities to Array prototype
Array.prototype.clone = function() { return this.slice(0); };
Array.prototype.swap = function(i1,i2) {
    var copy = this.clone();
    var tmp = copy[i1];
    copy[i1] = copy[i2];
    copy[i2] = tmp;
    return copy;
};


//Array.prototype.indexOf, present in firefox but not on IE 
if(!Array.prototype.hasOwnProperty("indexOf")) {
    Array.prototype.indexOf = function(x) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] == x)
                return i;
        }
        return -1;
    }
}

//Array.prototype.map, present in firefox but not on IE
if(!Array.prototype.hasOwnProperty("map")) {
    Array.prototype.map = function(f) {
        var result = [];
        for(var i = 0; i < this.length; i++) {
            result[i] = f(this[i]);
        }
        return result;
    }
}

Array.prototype.has = function(e) { return this.indexOf(e) >= 0; };
Array.prototype.insertAt = function(i,x) {
    this.splice(i,0,x);
};


//Some Utility functions to/from convert indexes in 1 dim array
//to row, column in 2d rep of the puzzle
var Util = {};
Util.is_valid_index = function(i) { return i >= 0 && i <= 2; };
Util.index = function(x,y) { return 3*y + x; };
Util.x = function(index) { return index % 3; };
Util.y = function(index) { return Math.floor(index/3); };

//Actions
var Action = {up: "up", down: "down", right: "right", left: "left"};

//======== Functions to manipulate/analyze 8puzzle state ==========

//The 8-puzzle problem factory -
// create new instance using it e.g., 
//var problem = new Problem([1,2,3,4,5,6,7,8,9])
var Problem = function(start_state) {
    this.init_state = start_state;
    return this;
}
Problem.prototype.is_goal = function(state) {
    if(state.length != 9) return false;
    
    for(var i = 0; i < 9; i++) {
        if(state[i] != i+1) return false;
    }
    return true;
}
//Manhatten distance heuristic
Problem.prototype.approx_cost_cache = [];
Problem.prototype.approx_cost_to_goal = function(state) {
    var index = state.toString();
    var cached = this.approx_cost_cache[index];
    if(cached == null) {
        var cost = 0;
        for(var i = 0; i < 9; i++) {
            if(state[i] != i+1 && state[i] != 9) {
                var tmp = state[i]-1;
                cost = cost + Math.abs(Util.x(tmp) - Util.x(i)) + Math.abs(Util.y(tmp) - Util.y(i));
            }
        }
        this.approx_cost_cache[index] = cost;
        return cost;
    }
    else {
        return cached;
    }
}
Problem.prototype.actions = function(state) {
    var result = [];
    var count = 0;

    var i = state.indexOf(9);
    var ix = Util.x(i);
    var iy = Util.y(i);

    var newx = ix - 1;
    if(Util.is_valid_index(newx)) {
        result[count++] = Action.left;
    }

    newx = ix + 1;
    if(Util.is_valid_index(newx)) {
        result[count++] = Action.right;
    }

    var newy = iy - 1;
    if(Util.is_valid_index(newy)) {
        result[count++] = Action.up;
    }

    newy = iy + 1;
    if(Util.is_valid_index(newy)) {
        result[count] = Action.down;
    }

    return result;    
}
Problem.prototype.result = function(action,state) {
    var i1 = state.indexOf(9);
    var x = Util.x(i1);
    var y = Util.y(i1);

    switch(action) {
    case Action.up:
        return state.swap(i1,Util.index(x,y-1));
    case Action.down:
        return state.swap(i1,Util.index(x,y+1));
    case Action.right:
        return state.swap(i1,Util.index(x+1,y));
    case Action.left:
        return state.swap(i1,Util.index(x-1,y));
    }
}

Problem.prototype.step_cost = function(from,to) { return 1; }

Problem.prototype.is_solvable = function(start) {
    start = start.clone();
    //move empty square to bottom-right
    start.splice(start.indexOf(9), 1);
    start[8] = 9;
    //count the number of physical swaps to reach goal
    var count = 0;
    for(var i = 0; i < 8; i++) {
        if(start[i] != i+1) {
            count++;
            var j = start.indexOf(i+1);
            start[j] = start[i];
            start[i] = i+1;
        }
    }

    //solvable if count is even or else unsolvable
    return count % 2 == 0;
}

//============== The A* Solver ============================
var Solver = {};
Solver.build_solution = function(node) {
    var result = [];
    while(node.hasOwnProperty("action")) {
        result[result.length] = node.action;
        node = node.parent;
    }
    result.reverse();
    return result;
};
Solver.graph_search = function(problem, frontier) {

    frontier.insert({state: problem.init_state, cost: 0});
    var explored = [];
    var node;

    while(true) {
        if(!frontier.is_empty()) {
            node = frontier.remove_first();
            if(problem.is_goal(node.state))
                return Solver.build_solution(node);
            else {
                if(!explored.has(node.state.toString())) {
                    frontier.insert_all(problem.actions(node.state).map(function(a) { 
                        var new_state = problem.result(a,node.state);
                        return {state: new_state, parent: node, cost: node.cost+problem.step_cost(node.state,new_state), action: a}; }));
                    explored[explored.length] = node.state.toString();
                }
            }
        }
        else
            return "failed";
    }
}


//Factory for PriorityQueue
function PriorityQueue(sortfunc) {
    this.contents = [];
    this.is_empty = function() { return this.contents.length == 0; };
    this.remove_first = function() { return this.contents.shift(); };

    //-- inserts --
    //find, using binary search, where to insert x inside
    //sortedarray so that it stays sorted
    this.find_index = function(x, sortedarray, sortfunc) {
        if(sortedarray.length == 0) {
            return 0;
        }
        var i1 = 0;
        var i2 = sortedarray.length-1;

        while(true) {
            
            if(i1 > i2) {
                return i1;
            }

            var i = Math.ceil((i1+i2)/2);
            var c = sortfunc(x,sortedarray[i]);
            if(c < 0) {
                i2 = i-1;
            } else {
                i1 = i+1;
            }
        }
    }
    this.insert = function(x) {
        var i = this.find_index(x, this.contents, sortfunc);
        this.contents.insertAt(i,x);
    };
    this.insert_all = function(arr) {
        for(var i = 0; i < arr.length; i++) {
            this.insert(arr[i]);
        }
    }
}

Solver.a_star_search = function(problem) {
    return this.graph_search(problem, new PriorityQueue( function(n1,n2) {
        return (n1.cost + problem.approx_cost_to_goal(n1.state)) - (n2.cost + problem.approx_cost_to_goal(n2.state));
    }))};
