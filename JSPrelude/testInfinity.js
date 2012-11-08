var InfiniteLists = require("./infinite.js");

// The helper functions
var hf = require("../prelude/helper_functions.js");
//The Prelude
var Prelude = require("../prelude/prelude.js");
// Assert
var assert = require("assert");

var NaturalNumbers = new InfiniteLists.Iterate(hf.op_sum(1),0);

// Iterate Infinite List
assert.equal(Prelude.head(NaturalNumbers),0);
assert.equal(Prelude.head(Prelude.tail(NaturalNumbers)),1);

// Cycles
assert.equal(Prelude.head(new InfiniteLists.Cycle([1,2,3,4,5])),1);
assert.equal(Prelude.get(new InfiniteLists.Cycle([1,2,3,4,5]))(10),1);
assert.equal(Prelude.head(Prelude.tail(new InfiniteLists.Cycle([1,2,3,4,5]))),2);
assert.equal(Prelude.length(new InfiniteLists.Cycle([1,2,3,4,5])), Infinity);

// Repeats (special case of cycle)
assert.equal(Prelude.head(new InfiniteLists.Repeat(Math.PI)), Math.PI);
assert.equal(Prelude.head(Prelude.tail(new InfiniteLists.Repeat(Math.PI))), Math.PI);
assert.equal(Prelude.get(new InfiniteLists.Repeat(Math.PI))(1000), Math.PI);

// Replicate (not actually infinite)
assert.deepEqual(Prelude.replicate(5)(Math.PI),[Math.PI, Math.PI, Math.PI, Math.PI, Math.PI]);

// Take
assert.deepEqual(Prelude.take(10)(NaturalNumbers),[0,1,2,3,4,5,6,7,8,9]);

// Map
assert.deepEqual(Prelude.take(5)(Prelude.map(hf.op_sum(10))(NaturalNumbers)),[10,11,12,13,14]);
assert.deepEqual(Prelude.take(10)(Prelude.map(hf.lt(5))(NaturalNumbers)),[true,true,true,true,true,false,false,false,false,false]);

// Filter
assert.deepEqual(Prelude.take(5)(Prelude.filter(hf.lt(5))(NaturalNumbers)),[0,1,2,3,4]);

// Get
assert.deepEqual(Prelude.get(Prelude.filter(hf.isEven)(NaturalNumbers))(1),2);

// Zip
assert.deepEqual(Prelude.take(5)(Prelude.zip(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers))),[[0,10],[1,11],[2,12],[3,13],[4,14]]);
assert.deepEqual(Prelude.get(Prelude.zip(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers)))(4),[4,14]);
assert.deepEqual(Prelude.take(5)(Prelude.zip3(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers))(Prelude.map(hf.op_sum(20))(NaturalNumbers))),[[0,10,20],[1,11,21],[2,12,22],[3,13,23],[4,14,24]]);

// Unzip
var zipped = Prelude.zip(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers));
var unzipped = Prelude.unzip(zipped);
assert.deepEqual(Prelude.take(5)(unzipped[0]),[0,1,2,3,4]);
assert.deepEqual(Prelude.take(5)(unzipped[1]),[10,11,12,13,14]);

var zipped3 = Prelude.zip3(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers))(Prelude.map(hf.op_sum(20))(NaturalNumbers));
var unzipped3 = Prelude.unzip3(zipped3);
assert.deepEqual(Prelude.take(5)(unzipped3[0]),[0,1,2,3,4]);
assert.deepEqual(Prelude.take(5)(unzipped3[1]),[10,11,12,13,14]);
assert.deepEqual(Prelude.take(5)(unzipped3[2]),[20,21,22,23,24]);

// Concat
assert.deepEqual(Prelude.take(10)(Prelude.concat([[10,9,8,7], NaturalNumbers])),[10,9,8,7,0,1,2,3,4,5]);
assert.deepEqual(Prelude.take(10)(Prelude.concat([new InfiniteLists.Repeat(1),[10,9,8,7]])),[1,1,1,1,1,1,1,1,1,1]);
assert.deepEqual(Prelude.take(10)(Prelude.concat([NaturalNumbers,[10,9,8,7]])),[0,1,2,3,4,5,6,7,8,9]);

// ConcatMap
assert.deepEqual(Prelude.take(9)(Prelude.concatMap(hf.expressionArray)(NaturalNumbers)),[0,0,0,1,0.5,2,2,1,4]);

// Special folds
assert.equal(Prelude.any(hf.gt(4))(NaturalNumbers), true);
assert.equal(Prelude.or(new InfiniteLists.Iterate(hf.negate, false)), true);
assert.equal(Prelude.and(new InfiniteLists.Iterate(hf.negate, false)), false);
assert.equal(Prelude.all(hf.isEven)(NaturalNumbers), false);

// Searching
var zipped = Prelude.zip(NaturalNumbers)(Prelude.map(hf.op_sum(10))(NaturalNumbers));
assert.equal(Prelude.elem(9)(NaturalNumbers), true);
assert.equal(Prelude.notElem(9)(NaturalNumbers), false);
assert.equal(Prelude.lookup(4)(zipped), 14);

// Drop & Take While
assert.deepEqual(Prelude.take(10)(Prelude.dropWhile(hf.lt(5))(NaturalNumbers)),[5,6,7,8,9,10,11,12,13,14]);
assert.deepEqual(Prelude.take(15)(Prelude.takeWhile(hf.lt(10))(Prelude.concat([[0,1,2,3,4], new InfiniteLists.Iterate(hf.op_sum(1),0)]))),[0,1,2,3,4,0,1,2,3,4,5,6,7,8,9]);

// splitAt
assert.deepEqual(Prelude.splitAt(5)(NaturalNumbers)[0],[0,1,2,3,4]);
assert.deepEqual(Prelude.take(5)(Prelude.splitAt(5)(NaturalNumbers)[1]),[5,6,7,8,9]);

// Span & Break
assert.deepEqual(Prelude.take(5)(Prelude.span(hf.lt(5))(NaturalNumbers)[0]),[0,1,2,3,4]);
assert.deepEqual(Prelude.take(5)(Prelude.break(hf.gt(5))(NaturalNumbers)[1]),[6,7,8,9,10]);
assert.deepEqual(Prelude.take(5)(Prelude.span(hf.lt(0))(NaturalNumbers)[0]),[]);

