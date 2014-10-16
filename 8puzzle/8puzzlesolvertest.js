/* Unit test, using QUnit, for 8puzzlesolver.js */

QUnit.init();

module("Array-Prototypes");

test("test-clone", function() {
    var orig = [1,2,3,4];
    var clone = orig.clone();
    same(orig,clone,"");

    orig[0] = 5;
    same(clone,[1,2,3,4],"");
});

test("test-swap", function() {
    same([1,2,3,4].swap(0,3),[4,2,3,1],"" );
});

test("test-has", function() {
    var a = ["hi","bye"];
    ok(a.has("hi"),"");
    ok(a.has("bye"),"");
    ok(!a.has("random"),"");
});

test("test-insertAt", function() {
    var a = [1,3,5];
    a.insertAt(2,4);
    same(a,[1,3,4,5],"");
    a.insertAt(1,2);
    same(a,[1,2,3,4,5],"");
    a.insertAt(5,6);
    same(a,[1,2,3,4,5,6],"");
});

module("Utility-Functions");

test("test-is-valid-index", function() {
    ok(Util.is_valid_index(0),"is 0 valid?");
    ok(Util.is_valid_index(1),"is 1 valid?");
    ok(Util.is_valid_index(2),"is 2 valid?");
    ok(!Util.is_valid_index(3),"is 3 valid?");
});

test("test-index", function() {
    equal(Util.index(1,2),7,"");
});

test("test-x-y", function() {
    var i = 7;
    equal(Util.x(7),1,"");
    equal(Util.y(7),2,"");
});

module("Problem");

test("test-is-goal", function() {
    ok(Problem.prototype.is_goal([1,2,3,4,5,6,7,8,9]),"arg:[1,2,3,4,5,6,7,8,9]");
    ok(!Problem.prototype.is_goal([1,2,3,4,5,6,7,9,8]),"arg:[1,2,3,4,5,6,7,9,8]");
});

test("test-approx-cost-to-goal", function() {
    equals(Problem.prototype.approx_cost_to_goal([1,2,3,4,5,6,9,7,8]),2,"");
});

test("test-actions", function() {
    var curr_state = [9,1,2,3,4,5,6,7,8];
    same(Problem.prototype.actions(curr_state),[Action.right,Action.down],"");

    curr_state = [1,2,3,4,9,6,7,8,5];
    same(Problem.prototype.actions(curr_state),[Action.left,Action.right,Action.up,Action.down],"");
});

test("test-result", function() {
    same(Problem.prototype.result(Action.right,[9,1,2,3,4,5,6,7,8]),[1,9,2,3,4,5,6,7,8],"");
    same(Problem.prototype.result(Action.down,[9,1,2,3,4,5,6,7,8]),[3,1,2,9,4,5,6,7,8],"");
});

test("test-is-solvable", function() {
    ok(!Problem.prototype.is_solvable([9,1,4,3,2,7,6,8,5]),"unsolvable test");
    ok(Problem.prototype.is_solvable([1,9,3,5,2,6,4,7,8]),"solvable test");
});

module("Solver");

test("test-Priority-Q", function() {
    var q = new PriorityQueue(function(x,y) { return x - y; });
    ok(q.is_empty(),"checking if empty?");
    q.insert(3);
    ok(!q.is_empty(),"checking if non-empty?");
    q.insert(1);
    q.insert_all([4,2,9,8]);
    equal(q.remove_first(),1,"");
    equal(q.remove_first(),2,"");
    equal(q.remove_first(),3,"");
    equal(q.remove_first(),4,"");
    
});


test("test-a-star-search", function() {
    var problem = new Problem([6,9,2,5,7,8,4,3,1]);
    //[4,7,9,1,6,2,3,8,5]
    var solution = Solver.a_star_search(problem);
    same(solution, [Action.down,Action.down,Action.right,Action.up,Action.left,Action.down,Action.left,Action.up,Action.right,Action.up,Action.left,Action.down,Action.right,Action.up,Action.right,Action.down,Action.left,Action.down,Action.left,Action.up,Action.right,Action.down,Action.right],"")
});
