var id_empty;
var num_moves;
var is_locked = false;

var nums = [1,2,3,4,5,6,7,8,9];

function initialize_puzzle() {
    num_moves = 0;

    //generate a solvable puzzle
    randomized_nums = nums.sort(function () { return (Math.round(Math.random())-0.5);});
    while(!Problem.prototype.is_solvable(randomized_nums)) {
        randomized_nums = nums.sort(function () { return (Math.round(Math.random())-0.5);});
    }

    for(var i=0; i < 9; i++) {
        var tmp = document.getElementById(i);
        if(randomized_nums[i] == 9) {
            tmp.className = "cell empty";
            tmp.innerHTML = "";
            id_empty = i;
        }
        else
            tmp.innerHTML = randomized_nums[i];
    }

}

function handle_cell_click(x)
{
    if(is_locked)
        return;

    if(x.id != id_empty+'') {
        var i_empty = Math.floor(id_empty/3);
        var j_empty = id_empty % 3;
        var id_selected = Number(x.id);
        var i_selected = Math.floor(id_selected/3);
        var j_selected = id_selected % 3;

        //if empty and selected are adjacent, swap them
        if((Math.abs(i_empty - i_selected) == 1 && j_empty == j_selected) ||
           (Math.abs(j_empty - j_selected) == 1 && i_empty == i_selected)) {

            document.getElementById(id_empty).className = "cell";
            document.getElementById(id_empty).innerHTML = x.innerHTML;
            
            x.className = "cell empty";
            x.innerHTML = '';
            
            id_empty = id_selected;
            num_moves++;
            
            if(is_done())
                on_finish();
        }
    }
}

function is_done() {
    return document.getElementById('0').innerHTML == '1' &&
        document.getElementById('1').innerHTML == '2' &&
        document.getElementById('2').innerHTML == '3' &&
        document.getElementById('3').innerHTML == '4' &&
        document.getElementById('4').innerHTML == '5' &&
        document.getElementById('5').innerHTML == '6' &&
        document.getElementById('6').innerHTML == '7' &&
        document.getElementById('7').innerHTML == '8';
}

function on_finish() {
    is_locked = true;
    document.getElementById("result").innerHTML = "You finished in " + num_moves + " moves. Please" +
        " refresh the page to play again.";
}


function handle_solve_click() {
    var curr_state = get_current_state();
    //alert(curr_state);
    var problem = new Problem(curr_state);
    //console.profile('solver profile data');
    var sol = Solver.a_star_search(problem);
    //alert(curr_state);
    //console.profileEnd();
    var result = "<ol>";
    for(var i = 0; i < sol.length; i++) {
        var n = find_number_to_move(sol[i],curr_state);
        curr_state = problem.result(sol[i],curr_state);
        result += "<li>move " + n + "</li>";
    }
    result += "</ol>";
    document.getElementById("steps").innerHTML = result;
}


function get_current_state() {
    var result = [];
    for(var i = 0; i < 9; i++) {
        var tmp = document.getElementById(String(i)).innerHTML;
        if(tmp == '') {
            result[i] = 9;
        }
        else {
            result[i] = Number(tmp);
        }
    }
    return result;
}

function find_number_to_move(action,state) {
    var i = state.indexOf(9);
    switch(action) {
    case Action.up:
        return state[Util.index(Util.x(i),Util.y(i) - 1)];
    case Action.down:
        return state[Util.index(Util.x(i),Util.y(i) + 1)];
    case Action.right:
        return state[Util.index(Util.x(i) + 1,Util.y(i))];
    case Action.left:
        return state[Util.index(Util.x(i) - 1,Util.y(i))];
    }
}
