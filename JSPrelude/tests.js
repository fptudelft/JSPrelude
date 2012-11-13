/**
 * This is the testsuite. Here are tests covering the entire prelude. 
 * First tests covering the helper functions are provided.
 */

var InfiniteLists = require("./infinite.js");

// The helper functions
var Operators = require("./operators.js");
//The Prelude
var Prelude = require("./prelude.js");
// Assert
var assert = require("assert");

/*
 * Helper functions test cases
 */

// Less than
assert.equal(Operators.lt(5)(6),false);
assert.equal(Operators.lt(5)(4),true);
assert.equal(Operators.lt(5)(5),false);

// Greater than
assert.equal(Operators.gt(5)(6),true);
assert.equal(Operators.gt(5)(4),false);
assert.equal(Operators.gt(5)(5),false);

// Multiply by 2
assert.equal(Operators.multiply(2)(3),6);
assert.equal(Operators.multiply(2)(0),0);
assert.equal(Operators.multiply(2)(-3),-6);

// Is even number
assert.equal(Operators.isEven(5), false);
assert.equal(Operators.isEven(4), true);
assert.equal(Operators.isEven(0), true);
assert.equal(Operators.isEven(-3), false);
assert.equal(Operators.isEven(4.0), true);
assert.equal(Operators.isEven(4.0000001), false);

// Sum over three numbers
assert.equal(Operators.sum3(0)(0)(0), 0);
assert.equal(Operators.sum3(1)(0)(-1), 0);
assert.equal(Operators.sum3(1)(8)(-1), 8);
assert.equal(Operators.sum3(-1)(-6)(-1), -8);

// Subtract
assert.equal(Operators.subtract(1)(0), 1);
assert.equal(Operators.subtract(1)(-1), 2);
assert.equal(Operators.subtract(0)(0), 0);
assert.equal(Operators.subtract(-1)(4), -5);

// Array of expressions with array input
assert.equal(Operators.expressionListArray([]), 0);
assert.equal(Operators.expressionListArray([1]), 1);
assert.equal(Operators.expressionListArray([1, 1, 1]), 3);

// Array of expressions with element input
assert.deepEqual(Operators.expressionArray(1), [1, 1/2, 2]);
assert.deepEqual(Operators.expressionArray(0), [0, 0, 0]);
assert.deepEqual(Operators.expressionArray(-2), [-2, -1, -4]);
assert.deepEqual(Operators.expressionArray(-0.3), [-0.3, -0.15, -0.6]);

// Division 
assert.equal(Operators.divide(4)(2), 2);
assert.equal(Operators.divide(0)(2), 0);
assert.equal(Operators.divide(4)(-2), -2);
assert.equal(Operators.divide(-4)(-0.5), 8);

/*
 * Operator functions
 */

// Eq
assert.equal(Operators.eq(true)(true), true);
assert.equal(Operators.eq(true)(false), false);
assert.equal(Operators.eq(5)(5), true);
assert.equal(Operators.eq(5)(4), false);
assert.equal(Operators.eq(0)(null), false);

// Neq
assert.equal(Operators.neq(true)(true), false);
assert.equal(Operators.neq(true)(false), true);
assert.equal(Operators.neq(5)(5), false);
assert.equal(Operators.neq(5)(4), true);
assert.equal(Operators.neq(0)(null), true);
 
// Or
assert.equal(Operators.or(true)(true), true);
assert.equal(Operators.or(true)(false), true);
assert.equal(Operators.or(false)(false), false);

// And
assert.equal(Operators.and(true)(true), true);
assert.equal(Operators.and(true)(false), false);
assert.equal(Operators.and(false)(false), false);
 
// Sum
assert.equal(Operators.add(0)(0), 0);
assert.equal(Operators.add(0)(1), 1);
assert.equal(Operators.add(-1)(0), -1);
assert.equal(Operators.add(-3)(5), 2);

// Product
assert.equal(Operators.multiply(0)(0), 0);
assert.equal(Operators.multiply(0)(1), 0);
assert.equal(Operators.multiply(-1)(1), -1);
assert.equal(Operators.multiply(-3)(5), -15);

// Max
assert.equal(Operators.max(0)(0), 0);
assert.equal(Operators.max(0)(1), 1);
assert.equal(Operators.max(-1)(1), 1);
assert.equal(Operators.max(-3)(5), 5);

// Min
assert.equal(Operators.min(0)(0), 0);
assert.equal(Operators.min(0)(1), 0);
assert.equal(Operators.min(-1)(1), -1);
assert.equal(Operators.min(-3)(5), -3);


/*
 * The prelude test cases
 */

/*
 * List Operations: map, (++) ~ append, filter, head, last, tail, init, null, length, (!!) ~ get, reverse
 */

// Map
assert.deepEqual(Prelude.map(Operators.lt(5))([]), []);
assert.deepEqual(Prelude.map(Operators.lt(5))([4]), [true]);
assert.deepEqual(Prelude.map(Operators.lt(5))([0,5,7]), [true,false,false]);
assert.deepEqual(Prelude.map(Operators.multiply(2))([10,11,12,13]),[20,22,24,26]);
assert.deepEqual(Prelude.map(Prelude.take(2))([[1,2,3],[4,5,6],[7,8,9]]), [[1,2],[4,5],[7,8]]);
assert.deepEqual(Prelude.map(Prelude.drop(1))([[1,2,3],[4,5,6],[7,8,9]]), [[2,3],[5,6],[8,9]]);

// Append
assert.deepEqual(Prelude.append([])([]), []);
assert.deepEqual(Prelude.append([1])([]), [1]);
assert.deepEqual(Prelude.append([])([1]), [1]);
assert.deepEqual(Prelude.append([1])([1]), [1,1]);
assert.deepEqual(Prelude.append([true])([false]), [true,false]);
assert.deepEqual(Prelude.append([1,2])([1,2,3,4]), [1,2,1,2,3,4]);

// Filter
assert.deepEqual(Prelude.filter(Operators.lt(5))([]),[]);
assert.deepEqual(Prelude.filter(Operators.lt(5))([4]),[4]);
assert.deepEqual(Prelude.filter(Operators.lt(5))([6]),[]);
assert.deepEqual(Prelude.filter(Operators.lt(5))([3,12]),[3]);
assert.deepEqual(Prelude.filter(Operators.lt(5))([10,12,6,3,8,4]),[3,4]);
assert.deepEqual(Prelude.filter(Operators.isEven)([6,5]),[6]);
assert.throws(function(){Prelude.filter(Operators.multiply(2))([6,5])}, Error);	// The function does not return a boolean

// head
assert.throws(function(){Prelude.head([])});							// Empty list
assert.equal(Prelude.head([10]),10);	
assert.deepEqual(Prelude.head([[10,5,4]]),[10,5,4]);
assert.deepEqual(Prelude.head([Operators.divide(2)(1),Operators.subtract(4)(2)]),Operators.divide(2)(1));
assert.equal(Prelude.head([10,11,12,13]),10);

// last
assert.throws(function(){Prelude.last([])});							// Empty list
assert.equal(Prelude.last([10]),10);
assert.equal(Prelude.last([10,5]),5);
assert.deepEqual(Prelude.last([[10,5],[3,4]]),[3,4]);
assert.equal(Prelude.last([true,false,true]),true);

// tail
assert.throws(function(){Prelude.tail([])});							// Empty list
assert.deepEqual(Prelude.tail([10]),[]);
assert.deepEqual(Prelude.tail([[10,5,4]]),[]);
assert.deepEqual(Prelude.tail([Operators.divide(2)(1),Operators.subtract(4)(2)]),[Operators.subtract(4)(2)]);
assert.deepEqual(Prelude.tail([10,11,12,13]),[11,12,13]);

// init
assert.throws(function(){Prelude.init([])});							// Empty list
assert.deepEqual(Prelude.init([10]),[]);
assert.deepEqual(Prelude.init([[10,5,4]]),[]);
assert.deepEqual(Prelude.init([Operators.divide(2)(1),Operators.subtract(4)(2)]),[Operators.divide(2)(1)]);
assert.deepEqual(Prelude.init([10,11,12,13]),[10,11,12]);

// null
assert.equal(Prelude.null([]),true);
assert.equal(Prelude.null([5]),false);

// length
assert.equal(Prelude.length([]),0);
assert.equal(Prelude.length([5]),1);
assert.equal(Prelude.length([[5,3,4]]),1);
assert.equal(Prelude.length([[5,3,4],[5,3,4]]),2);
assert.equal(Prelude.length([5,3,4]),3);

// get
assert.equal(Prelude.get([])(0),null);
assert.equal(Prelude.get([5])(0),5);
assert.equal(Prelude.get([true])(0),true);
assert.deepEqual(Prelude.get([[[5,4]]])(0),[[5,4]]);
assert.equal(Prelude.get([5,4,3,2,1])(2),3);
assert.equal(Prelude.get([5,4,3,2,1])(4),1);
assert.equal(Prelude.get([5,4,3,2,1])(5),null);

// reverse
assert.deepEqual(Prelude.reverse([]),[]);
assert.deepEqual(Prelude.reverse([1]),[1]);
assert.deepEqual(Prelude.reverse([[1,2]]),[[1,2]]);
assert.deepEqual(Prelude.reverse([1,2]),[2,1]);
assert.deepEqual(Prelude.reverse([5,4,3,2,1]),[1,2,3,4,5]);


/*
 * Folds: foldl, foldr, foldl1, foldr1
 */

// foldl
assert.equal(Prelude.foldl(Operators.add)(0)([]), 0);
assert.equal(Prelude.foldl(Operators.add)(5)([]), 5);
assert.equal(Prelude.foldl(Operators.add)(5)([3]), 8);
assert.equal(Prelude.foldl(Operators.add)(0)([0,0,0,0]), 0);
assert.equal(Prelude.foldl(Operators.add)(0)([1,2,3,4]), 10);
assert.equal(Prelude.foldl(Operators.subtract)(3)([1,2,3,4]), -7);

// foldr
assert.equal(Prelude.foldr(Operators.add)(0)([]), 0);
assert.equal(Prelude.foldr(Operators.add)(5)([]), 5);
assert.equal(Prelude.foldr(Operators.add)(5)([3]), 8);
assert.equal(Prelude.foldr(Operators.add)(0)([0,0,0,0]), 0);
assert.equal(Prelude.foldr(Operators.add)(0)([1,2,3,4]), 10);
assert.equal(Prelude.foldr(Operators.subtract)(0)([1,2,3,4]), -2);			// (1 -(2-(3-(4-0)))) = 0-(1-(2-(-1))) = 1 - 3 = -2
assert.equal(Prelude.foldr(Operators.subtract)(3)([1,2,3,4]), 1);

// foldl1
assert.throws(function(){Prelude.foldl1(Operators.add)([])});				// Empty list
assert.equal(Prelude.foldl1(Operators.add)([3]), 3);
assert.equal(Prelude.foldl1(Operators.add)([0,0,0,0]), 0);
assert.equal(Prelude.foldl1(Operators.add)([1,2,3,4]), 10);
assert.equal(Prelude.foldl1(Operators.subtract)([1,2,3,4]), -8);			// 1-2-3-4=-8

// foldr1
assert.throws(function(){Prelude.foldr1(Operators.add)([])});				// Empty list
assert.equal(Prelude.foldr1(Operators.add)([3]), 3);
assert.equal(Prelude.foldr1(Operators.add)([0,0,0,0]), 0);
assert.equal(Prelude.foldr1(Operators.add)([1,2,3,4]), 10);
assert.equal(Prelude.foldr1(Operators.subtract)([1,2,3,4]), -2);			// 4-3-2-1=-2

/*
 * Special folds: and, or, any, all, sum, product, concat, concatMap, maximum, minimum
 */

// and
assert.throws(function(){Prelude.and([0])});						// List contains other elements than booleans
assert.throws(function(){Prelude.or([true, 5, 2])});				// List contains other elements than booleans
assert.equal(Prelude.and([false]), false);
assert.equal(Prelude.and([true]), true);
assert.equal(Prelude.and([true, true]), true);
assert.equal(Prelude.and([true, true, true, false]), false);
assert.equal(Prelude.and([false, true, true, true]), false);
assert.equal(Prelude.and([false, false, false, true]), false);
assert.equal(Prelude.and([true, false, false, false]), false);
assert.equal(Prelude.and([true, true, true, true]), true);

// or 
assert.throws(function(){Prelude.or([0])});							// List contains other elements than booleans
assert.throws(function(){Prelude.or([true, 5, 2])});				// List contains other elements than booleans
assert.equal(Prelude.or([true]), true);
assert.equal(Prelude.or([false]), false);
assert.equal(Prelude.or([true, false, false, false]), true);
assert.equal(Prelude.or([false, true, false]), true);
assert.equal(Prelude.or([false, false]), false);
assert.equal(Prelude.or([false, false, true]), true);

// any
assert.throws(function(){Prelude.any(Operators.multiply(2))([2])}); 			// The function does not return a boolean
assert.equal(Prelude.any(Operators.lt(3))([]), false);
assert.equal(Prelude.any(Operators.lt(3))([4]), false);
assert.equal(Prelude.any(Operators.lt(3))([2,3,4]), true);
assert.equal(Prelude.any(Operators.lt(1))([2,3,4]), false);
assert.equal(Prelude.any(Operators.gt(3))([2,3,4]), true);

// all
assert.throws(function(){Prelude.all(Operators.multiply(2))([2])}); 			// The function does not return a boolean
assert.equal(Prelude.all(Operators.lt(3))([]), true);
assert.equal(Prelude.all(Operators.lt(3))([4]), false);
assert.equal(Prelude.all(Operators.gt(3))([4]), true);
assert.equal(Prelude.all(Operators.lt(3))([2,3,4]), false);
assert.equal(Prelude.all(Operators.lt(1))([2,3,4]), false);
assert.equal(Prelude.all(Operators.gt(3))([2,3,4]), false);
assert.equal(Prelude.all(Operators.lt(5))([2,3,4]), true);

// sum
assert.equal(Prelude.sum([]), 0);
assert.equal(Prelude.sum([42]), 42);
assert.equal(Prelude.sum([21,21]), 42);
assert.equal(Prelude.sum([-21,21]), 0);
assert.equal(Prelude.sum([-21.5,21]), -0.5);

// product
assert.equal(Prelude.product([]), 1);
assert.equal(Prelude.product([42]), 42);
assert.equal(Prelude.product([2,21]), 42);
assert.equal(Prelude.product([0.5,42]), 21);
assert.equal(Prelude.product([-2,21]), -42);
assert.equal(Prelude.product([2,3,4,5]), 120);

// concat
assert.deepEqual(Prelude.concat([]), []);
assert.deepEqual(Prelude.concat([[]]), []);
assert.deepEqual(Prelude.concat([[], []]), []);
assert.deepEqual(Prelude.concat([[], [1]]), [1]);
assert.deepEqual(Prelude.concat([[], [1, 2]]), [1, 2]);
assert.deepEqual(Prelude.concat([[3], [1, 2]]), [3, 1, 2]);
assert.deepEqual(Prelude.concat([[3], [], [1, 2]]), [3, 1, 2]);
assert.deepEqual(Prelude.concat([[3], [], [1, 2], []]), [3, 1, 2]);
assert.deepEqual(Prelude.concat([[1],[2,3,4],[5,6]]), [1,2,3,4,5,6]);

// concatMap
assert.deepEqual(Prelude.concatMap(Operators.expressionArray)([]), []);
assert.deepEqual(Prelude.concatMap(Operators.expressionArray)([2]), [2, 1, 4]);
assert.deepEqual(Prelude.concatMap(Operators.expressionListArray)([[],[]]), [0, 0]);
assert.deepEqual(Prelude.concatMap(Operators.expressionListArray)([[3, 2],[3, 4, 5]]), [2, 3]);
assert.deepEqual(Prelude.concatMap(Operators.expressionArray)([3, 5, 7, 8]), [3, 1.5, 6, 5, 2.5, 10, 7, 3.5, 14, 8, 4, 16]);

// maximum
assert.throws(function(){Prelude.maximum([])});				// Empty list
assert.equal(Prelude.maximum([16]),16);
assert.equal(Prelude.maximum([10,15,16,13]),16);

// minimum
assert.throws(function(){Prelude.minimum([])});				// Empty list
assert.equal(Prelude.minimum([10]),10);
assert.deepEqual(Prelude.minimum([10,15,16,13]),10);

/*
 * Building lists: scanl, scanl1, scanr, scanr1
 */

// scanl
assert.deepEqual(Prelude.scanl(Operators.add)(1)([]), [1]);
assert.deepEqual(Prelude.scanl(Operators.add)(1)([1]), [1, 2]);
assert.deepEqual(Prelude.scanl(Operators.add)(1)([2,3,4]), [1,3,6,10]);
assert.deepEqual(Prelude.scanl(Operators.and)(true)([true,true,false]), [true,true,true,false]);

// scanl1
assert.throws(function(){Prelude.scanl1(Operators.add)([])});				// Empty list
assert.deepEqual(Prelude.scanl1(Operators.add)([1]), [1]);
assert.deepEqual(Prelude.scanl1(Operators.add)([1, 2]), [1, 3]);
assert.deepEqual(Prelude.scanl1(Operators.add)([1,2,3,4]), [1,3,6,10]);

// scanr
assert.deepEqual(Prelude.scanr(Operators.add)(1)([]), [1]);
assert.deepEqual(Prelude.scanr(Operators.add)(1)([1]), [2, 1]);
assert.deepEqual(Prelude.scanr(Operators.divide)(2)([8,12,24,4]), [8,1,12,2,2]);
assert.deepEqual(Prelude.scanr(Operators.and)(true)([false,true,true]), [false,true,true,true]);

// scanr1
assert.throws(function(){Prelude.scanr1(Operators.add)([])});				// Empty list
assert.deepEqual(Prelude.scanr1(Operators.add)([1]), [1]);
assert.deepEqual(Prelude.scanr1(Operators.add)([1, 2]), [3, 2]);
assert.deepEqual(Prelude.scanr1(Operators.divide)([8,12,24,4,2]), [8,1,12,2,2]);

/*
 * Sublists: take, drop, splitAt, takeWhile, dropWhile, span, break
 */

// take
assert.deepEqual(Prelude.take(-1)([]),[]);
assert.deepEqual(Prelude.take(6)([]),[]);
assert.deepEqual(Prelude.take(0)([1,2]),[]);
assert.deepEqual(Prelude.take(5)([1,2]),[1,2]);
assert.deepEqual(Prelude.take(3)([1,2,3,4,5]),[1,2,3]);
assert.deepEqual(Prelude.take(-1)([1,2,3]),[]);
assert.deepEqual(Prelude.take(5)("Hello world!"), "Hello");

// drop
assert.deepEqual(Prelude.drop(-1)([]),[]);
assert.deepEqual(Prelude.drop(6)([]),[]);
assert.deepEqual(Prelude.drop(0)([1,2]),[1,2]);
assert.deepEqual(Prelude.drop(5)([1,2]),[]);
assert.deepEqual(Prelude.drop(3)([1,2,3,4,5]),[4,5]);
assert.deepEqual(Prelude.drop(-1)([1,2,3]),[1,2,3]);
assert.deepEqual(Prelude.drop(5)("Hello world!"), " world!");

// splitAt
assert.deepEqual(Prelude.splitAt(-1)([]),[[], []]);
assert.deepEqual(Prelude.splitAt(0)([]),[[], []]);
assert.deepEqual(Prelude.splitAt(5)([]),[[], []]);
assert.deepEqual(Prelude.splitAt(0)([1,2,3]),[[],[1,2,3]]);
assert.deepEqual(Prelude.splitAt(-1)([1,2,3]),[[],[1,2,3]]);
assert.deepEqual(Prelude.splitAt(3)([1,2,3,4,5]),[[1,2,3],[4,5]]);
assert.deepEqual(Prelude.splitAt(5)([1,2,3,4,5]),[[1,2,3,4,5],[]]);
assert.deepEqual(Prelude.splitAt(5)("Hello world!"),["Hello", " world!"]);

// takeWhile
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([]),[]);
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([1]),[1]);
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([1,3]),[1]);
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([1,2,3,4,5,6]),[1,2]);
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([1,2,1,3,2,1]),[1,2,1]);
assert.deepEqual(Prelude.takeWhile(Operators.lt(3))([3,1,2,3,4,5,6]),[]);

// dropWhile
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([]),[]);
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([1]),[]);
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([1,3]),[3]);
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([1,2,1,3,2,1]),[3,2,1]);
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([4,1,2,3,4,5,6]),[4,1,2,3,4,5,6]);
assert.deepEqual(Prelude.dropWhile(Operators.lt(3))([1,2,3,4,5,6]),[3,4,5,6]);

// span
assert.deepEqual(Prelude.span(Operators.lt(3))([]),[[],[]]);
assert.deepEqual(Prelude.span(Operators.lt(3))([1]),[[1],[]]);
assert.deepEqual(Prelude.span(Operators.lt(3))([5]),[[],[5]]);
assert.deepEqual(Prelude.span(Operators.lt(3))([2,5]),[[2],[5]]);
assert.deepEqual(Prelude.span(Operators.lt(3))([5,1,2]),[[],[5,1,2]]);
assert.deepEqual(Prelude.span(Operators.lt(3))([1,2,3,4,5,6]),[[1,2],[3,4,5,6]]);
assert.deepEqual(Prelude.span(Operators.lt(4))([1,2,3,4,5,6]),[[1,2,3],[4,5,6]]);


// break
assert.deepEqual(Prelude.break(Operators.lt(3))([]),[[],[]]);
assert.deepEqual(Prelude.break(Operators.lt(3))([1]),[[],[1]]);
assert.deepEqual(Prelude.break(Operators.lt(3))([5]),[[5],[]]);
assert.deepEqual(Prelude.break(Operators.lt(3))([2,5]),[[],[2,5]]);
assert.deepEqual(Prelude.break(Operators.lt(3))([5,1,2]),[[5],[1,2]]);
assert.deepEqual(Prelude.break(Operators.lt(3))([1,2,3,4,5,6]),[[],[1,2,3,4,5,6]]);
assert.deepEqual(Prelude.break(Operators.gt(4))([1,2,3,4,5,6]),[[1,2,3,4],[5,6]]);
assert.deepEqual(Prelude.break(Operators.gt(3))([1,2,3,4,1,2,3,4]),[[1,2,3],[4,1,2,3,4]]);

/*
 * Searching lists
 */
 
// elem
assert.equal(Prelude.elem(0)([]), false);
assert.equal(Prelude.elem([])([]), false);
//assert.equal(Prelude.elem([])([[]]), true);					 This works in Haskell, but [] == [] is false.
//assert.equal(Prelude.elem([5])([[2],[5]]), true);				 This works in Haskell, but [5] == [5] is false.
assert.equal(Prelude.elem(4)([1,2,3]), false);
assert.equal(Prelude.elem(4)([1,2,3,4]), true);
assert.equal(Prelude.elem(false)([false,true]), true);

// notElem
assert.equal(Prelude.notElem(0)([]), true);
assert.equal(Prelude.notElem([])([]), true);
//assert.equal(Prelude.notElem([])([[]]), false); 				This works in Haskell, but [] == [] is false.
//assert.equal(Prelude.notElem([5])([[2],[5]]), false);			This works in Haskell, but [5] == [5] is false.
assert.equal(Prelude.notElem(4)([1,2,3]), true);
assert.equal(Prelude.notElem(4)([1,2,3,4]), false);
assert.equal(Prelude.notElem(true)([false,true]), false);

// lookup
assert.equal(Prelude.lookup(1)([]), null);
assert.equal(Prelude.lookup(1)([[1,2],[3,4]]), 2);
assert.equal(Prelude.lookup(1)([[1,"2"],["3",4]]), "2");
assert.equal(Prelude.lookup("3")([[1,"2"],["3",4]]), 4);
assert.equal(Prelude.lookup(1)([[1,2],[3,4],[1,5],[1,6]]), 2);
assert.equal(Prelude.lookup("city")([["country","holland"],["city","rotterdam"]]), "rotterdam");
assert.equal(Prelude.lookup("street")([["country","holland"],["city","rotterdam"]]), null);

/*
 * Zipping and unzipping lists: zip, zip3, zipWith, zipWith3, unzip
 */

// zip
assert.deepEqual(Prelude.zip([])([]),[]);
assert.deepEqual(Prelude.zip([])([1]),[]);
assert.deepEqual(Prelude.zip([1])([]),[]);
assert.deepEqual(Prelude.zip([1])([2]),[[1,2]]);
assert.deepEqual(Prelude.zip([1])([2,3]),[[1,2]]);
assert.deepEqual(Prelude.zip([1,2,3])([2]),[[1,2]]);
assert.deepEqual(Prelude.zip([1,2,3])([4,5]),[[1,4],[2,5]]);
assert.deepEqual(Prelude.zip([1,2,3])([4,5,6]),[[1,4],[2,5],[3,6]]);

// zip3
assert.deepEqual(Prelude.zip3([])([])([]),[]);
assert.deepEqual(Prelude.zip3([])([1])([1]),[]);
assert.deepEqual(Prelude.zip3([1])([1])([1]),[[1,1,1]]);
assert.deepEqual(Prelude.zip3([1,2])([1,3])([1]),[[1,1,1]]);
assert.deepEqual(Prelude.zip3([1,2])([1,3])([1,4]),[[1,1,1],[2,3,4]]);
assert.deepEqual(Prelude.zip3([1,2,3])([4,5,6])([7,8,9]),[[1,4,7],[2,5,8],[3,6,9]]);

// zipWith
assert.deepEqual(Prelude.zipWith(Operators.add)([])([]),[]);
assert.deepEqual(Prelude.zipWith(Operators.add)([])([1]),[]);
assert.deepEqual(Prelude.zipWith(Operators.add)([1])([1]),[2]);
assert.deepEqual(Prelude.zipWith(Operators.add)([1])([1,2]),[2]);
assert.deepEqual(Prelude.zipWith(Operators.add)([1,3])([1,2]),[2,5]);
assert.deepEqual(Prelude.zipWith(Operators.and)([true])([true]),[true]);
assert.deepEqual(Prelude.zipWith(Operators.add)([1,2,3])([4,5,6]),[5,7,9]);

// zipWith3
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([])([])([]),[]);
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([])([1])([]),[]);
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([1])([1])([1]),[3]);
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([1])([1,2])([2,5]),[4]);
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([1,3])([1,2])([3,6]),[5,11]);
assert.deepEqual(Prelude.zipWith3(Operators.sum3)([1,2,3])([4,5,6])([7,8,9]),[12,15,18]);

// unzip
assert.deepEqual(Prelude.unzip([]), [[],[]]);
assert.deepEqual(Prelude.unzip([[1,1]]), [[1],[1]]);
assert.deepEqual(Prelude.unzip([[1,2],[3,4]]), [[1,3],[2,4]]);
assert.deepEqual(Prelude.unzip([[1,4],[2,5],[3,6]]), [[1,2,3],[4,5,6]]);

// unzip3
assert.deepEqual(Prelude.unzip3([]), [[],[],[]]);
assert.deepEqual(Prelude.unzip3([[1,1,1]]), [[1],[1],[1]]);
assert.deepEqual(Prelude.unzip3([[1,1,1],[2,3,4]]), [[1,2],[1,3],[1,4]]);
assert.deepEqual(Prelude.unzip3([[1,4,7],[2,5,8],[3,6,9]]), [[1,2,3],[4,5,6],[7,8,9]]);


/*
 * Functions on strings: lines, words, unlines, unwords
 */

// String lines function
assert.deepEqual(Prelude.lines(""), [""]);
assert.deepEqual(Prelude.lines("\n"), ["",""]);
assert.deepEqual(Prelude.lines("\n\n"), ["","",""]);
assert.deepEqual(Prelude.lines("asdf"), ["asdf"]);
assert.deepEqual(Prelude.lines("asdf\n"), ["asdf",""]);
assert.deepEqual(Prelude.lines("asdf\n\n"), ["asdf","",""]);
assert.deepEqual(Prelude.lines("asdf\nhjlk"), ["asdf","hjlk"]);
assert.deepEqual(Prelude.lines("asdf\nhjlk\nsd"), ["asdf","hjlk","sd"]);

// String words function
assert.deepEqual(Prelude.words(""), [""]);
assert.deepEqual(Prelude.words(" "), ["",""]);
assert.deepEqual(Prelude.words("  "), ["","",""]);
assert.deepEqual(Prelude.words("asdf"), ["asdf"]);
assert.deepEqual(Prelude.words("asdf "), ["asdf",""]);
assert.deepEqual(Prelude.words("asdf  "), ["asdf","",""]);
assert.deepEqual(Prelude.words("asdf hjlk"), ["asdf","hjlk"]);
assert.deepEqual(Prelude.words("asdf hjlk sd"), ["asdf","hjlk","sd"]);

//String unlines function
assert.deepEqual(Prelude.unlines([]), "");
assert.deepEqual(Prelude.unlines([""]), "");
assert.deepEqual(Prelude.unlines(["",""]), "\n");
assert.deepEqual(Prelude.unlines(["asdf"]), "asdf");
assert.deepEqual(Prelude.unlines(["asdf",""]), "asdf\n");
assert.deepEqual(Prelude.unlines(["asdf","",""]), "asdf\n\n");
assert.deepEqual(Prelude.unlines(["asdf","hjlk"]), "asdf\nhjlk");
assert.deepEqual(Prelude.unlines(["asdf","hjlk","sd"]), "asdf\nhjlk\nsd");

// String unwords function
assert.deepEqual(Prelude.unwords([]), "");
assert.deepEqual(Prelude.unwords([""]), "");
assert.deepEqual(Prelude.unwords(["",""]), " ");
assert.deepEqual(Prelude.unwords(["asdf"]), "asdf");
assert.deepEqual(Prelude.unwords(["asdf",""]), "asdf ");
assert.deepEqual(Prelude.unwords(["asdf","",""]), "asdf  ");
assert.deepEqual(Prelude.unwords(["asdf","hjlk"]), "asdf hjlk");
assert.deepEqual(Prelude.unwords(["asdf","hjlk","sd"]), "asdf hjlk sd");
