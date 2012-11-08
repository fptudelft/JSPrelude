if( Object.create === undefined ) {
	Object.create = function( o ) {
    	function F(){}
    	F.prototype = o;
    	return new F();
	};
}

var LazyList = function(){
	this.length = Infinity;
}

LazyList.prototype.get = function(pos){
	var list = this;
	var val = null;
	
	for(var i=0; i <= pos; i++){
		val = prelude.head(list);
		list = prelude.tail(list);
	}
	
	return val;
}

LazyList.prototype.hasNext = function(){
	return true;
}

LazyList.prototype.toString = function(){
	return "[InfiniteList]"
}


/**
 * An infinite list of repeated applications of f to x
 * 
 * @param f The function
 * @param x The start value
 */
var Iterate = function(f, x){
	LazyList.call(this);
	this.val = x;
	this.func = f;
}

Iterate.prototype = Object.create(LazyList.prototype);

Iterate.prototype.head = function(){
	return this.val;
}

Iterate.prototype.tail = function(){
	return new Iterate(this.func, this.func(this.val));
}

Iterate.prototype.get = function(pos){
	var base = this.val;
	
	for(var i=0; i < pos; i++)
		base = this.func(base);
	
	return base;
}


/**
 * ties a finite list into a circular one, or equivalently, the infinite repetition of the original list.
 * It is the identity on infinite lists. 
 */
var Cycle = function(ls, offset){
	LazyList.call(this);
	this.ls = ls;
	
	if(offset)
		this.offset = offset % ls.length;
	else this.offset = 0;
	this.length = Infinity;
}

Cycle.prototype = Object.create(LazyList.prototype);

Cycle.prototype.get = function(pos){
	return this.ls[this.offset + pos % this.ls.length];
}

Cycle.prototype.head = function(){
	return this.ls[this.offset];
}

Cycle.prototype.tail = function(){
	return new Cycle(this.ls, this.offset + 1);
}

var Repeat = function (x){
	Cycle.call(this, [x]);
};

Repeat.prototype = Object.create(Cycle.prototype);

var MappedList = function(f, infiniteList){
	LazyList.call(this);
	this.ls = infiniteList;
	this.f = f;
	this.length = infiniteList.length;
}

MappedList.prototype = Object.create(LazyList.prototype);

MappedList.prototype.head = function(){
	return this.f(prelude.head(this.ls));
}

MappedList.prototype.tail = function(){
	return new MappedList(this.f, prelude.tail(this.ls));
}

MappedList.prototype.get = function(pos){
	return this.f(prelude.get(this.ls)(pos));
}

var FilteredList = function(infiniteList, filter){
	LazyList.call(this);
	this.ls = infiniteList;
	this.f = filter;
}

FilteredList.prototype = Object.create(LazyList.prototype);

FilteredList.prototype.head = function(){
	while(!this.f(prelude.head(this.ls))){
		this.ls = prelude.tail(this.ls);
	}
	
	return prelude.head(this.ls);
}

FilteredList.prototype.tail = function(){
	this.head();
	return new FilteredList(prelude.tail(this.ls), this.f);
}

FilteredList.prototype.get = function(pos){
	var val = this.head();
	
	var list = this;
	for(var i = 1; i <= pos; i++){
		list = list.tail();
		val = list.head();
	}
	
	return val;
}

var ConcatenatedList = function(as, bs){
	if(as.length == Infinity)
		throw new ListNotFiniteException();
	
	LazyList.call(this);
	
	this.as = as;
	this.bs = bs;
}

ConcatenatedList.prototype = Object.create(LazyList.prototype);

ConcatenatedList.prototype.head = function(){
	var prelude = new require("./prelude.js");
	return prelude.head(this.as);
}

ConcatenatedList.prototype.tail = function(){
	var prelude = new require("./prelude.js");
	
	if(this.as.length > 1)
		return new ConcatenatedList(prelude.tail(this.as), this.bs);
	else if(this.as.length == 1)
		return this.bs;
}

ConcatenatedList.prototype.get = function(pos){
	if(pos < this.as.length)
		return prelude.get(this.as)(pos);
	else return prelude.get(this.bs)(pos - this.as.length + 1);
}

var ZippedList = function(){
	LazyList.call(this);
	
	var args = Array.prototype.slice.call(arguments);
	
	this.f = args[0];
	
	this.lists = args.slice(1);
	
	if(this.lists.length < 2 || this.lists.length > 3)
		throw new Exception("Only 2 or 3 lists are supported at the time");
}

ZippedList.prototype = Object.create(LazyList.prototype);

ZippedList.prototype.head = function(){
	var result = [];
	
	if(this.lists.length == 2)
		return this.f(prelude.head(this.lists[0]))(prelude.head(this.lists[1]));
	else if(this.lists.length == 3)
		return this.f(prelude.head(this.lists[0]))(prelude.head(this.lists[1]))(prelude.head(this.lists[2]));
	else throw new Exception("Only 2 or 3 lists are supported at the time"); 
}

ZippedList.prototype.tail = function(){	
	var args  = [this.f];
	
	if(this.lists.length == 2)
		return new ZippedList(this.f, prelude.tail(this.lists[0]), prelude.tail(this.lists[1]));
	else if(this.lists.length == 3)
		return new ZippedList(this.f, prelude.tail(this.lists[0]), prelude.tail(this.lists[1]), prelude.tail(this.lists[2]));
	else throw new Exception("Only 2 or 3 lists are supported at the time");
}

var TakeWhileList = function(predicate, list){
	LazyList.call(this);
	
	this.list = list;
	this.p = predicate;
}

TakeWhileList.prototype = Object.create(LazyList.prototype);

TakeWhileList.prototype.hasNext = function(){
	return this.p(prelude.head(this.list));
}

TakeWhileList.prototype.head = function(){
	var head = prelude.head(this.list);
	
	return this.p(head) ? head : [];
}

TakeWhileList.prototype.tail = function(){
	return new TakeWhileList(this.p, prelude.tail(this.list));
}

var DropWhileList = function(predicate, list){
	LazyList.call(this);
	
	this.list = list;
	this.p = predicate;
}

DropWhileList.prototype = Object.create(LazyList.prototype);

DropWhileList.prototype.head = function(){
	while(this.p(prelude.head(this.list))){
		this.list = prelude.tail(this.list);
	}
	
	return prelude.head(this.list);
}

DropWhileList.prototype.tail = function(){
	this.head();

	return new DropWhileList(this.p, prelude.tail(this.list));
}

var ConcatMapList = function(f, list, results, cursor){
	LazyList.call(this);
	
	this.f = f;
	this.list = list;
	
	this.results = results ? results : f(prelude.head(list));
	this.cursor = cursor ? cursor : 0;
}

ConcatMapList.prototype = Object.create(LazyList.prototype);
ConcatMapList.prototype.head = function(){
	return this.results[this.cursor];
}

ConcatMapList.prototype.tail = function(){
	var cursor = this.cursor + 1;
	
	// We have results left
	if(cursor < this.results.length)
		return new ConcatMapList(this.f, this.list, this.results, cursor);
	
	// We dont have results left, go to next result
	else return new ConcatMapList(this.f, prelude.tail(this.list));
}

module.exports = {
		Cycle: Cycle,
		Iterate: Iterate,
		Repeat: Repeat,
		MappedList: MappedList,
		FilteredList: FilteredList,
		ConcatenatedList: ConcatenatedList,
		ZippedList: ZippedList,
		TakeWhileList: TakeWhileList,
		DropWhileList: DropWhileList,
		ConcatMapList:ConcatMapList,
		LazyList: LazyList
}

var prelude = new require("./prelude.js");
