if( Object.create === undefined ) {
	Object.create = function( o ) {
    	function F(){}
    	F.prototype = o;
    	return new F();
	};
}

/**
 * The base prototype for all Lazily Evaluated Lists
 * A LazyList MUST implement at least the head() and tail() functions.
 */
var LazyList = function(){
	this.length = Infinity;
}

/**
 * Get value at position by evaluating the list, this is O(n) without caching!
 * Other objects may implement more efficient O(1) implementations
 */
LazyList.prototype.get = function(pos){
	var list = this;
	var val = null;
	
	for(var i=0; i <= pos; i++){
		val = Prelude.head(list);
		list = Prelude.tail(list);
	}
	
	return val;
}

/**
 * Real infinite lists always have a next value. See TakeWhileList for a special case, it may not be infinite!
 */
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

/**
 * Gets the tail of the list by constructing a new Iterate list object containing the new base value f(value), with the same function f as the current list
 */
Iterate.prototype.tail = function(){
	return new Iterate(this.func, this.func(this.val));
}

/**
 * Bit more efficient implementation of the get function, since it does not create objects all the time;
 */
Iterate.prototype.get = function(pos){
	var base = this.val;
	
	for(var i=0; i < pos; i++)
		base = this.func(base);
	
	return base;
}


/**
 * ties a finite list into a circular one, or equivalently, the infinite repetition of the original list.
 * It is the identity on infinite lists. 
 * 
 * @param ls The FINITE list to create an infinite cycle of
 * @param offset Is the offset in the infinite list, it defaults to 0, it is used to get the tail of an infinite list.
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

/**
 * Fast O(1) get override
 */ 
Cycle.prototype.get = function(pos){
	return this.ls[this.offset + pos % this.ls.length];
}

/**
 * Return the head of the list
 */
Cycle.prototype.head = function(){
	return this.ls[this.offset];
}

/**
 * Returns the tail by creating a new Cycle with the offset incremented
 */
Cycle.prototype.tail = function(){
	return new Cycle(this.ls, this.offset + 1);
}

/**
 * Repeats an element infinite times, extends the Cycle prototype
 */
var Repeat = function (x){
	Cycle.call(this, [x]);
};

Repeat.prototype = Object.create(Cycle.prototype);

/**
 * A lazily evaluated list which maps a function over the elements on evaluation
 */
var MappedList = function(f, infiniteList){
	LazyList.call(this);
	this.ls = infiniteList;
	this.f = f;
	this.length = infiniteList.length;
}

MappedList.prototype = Object.create(LazyList.prototype);

/**
 * Gets the head of the wrapped list and applies f to it before returning it.
 */
MappedList.prototype.head = function(){
	return this.f(Prelude.head(this.ls));
}

/**
 * Returns the tail by creating a new MappedList using the tail of the wrapped list and the mapping function f
 */
MappedList.prototype.tail = function(){
	return new MappedList(this.f, Prelude.tail(this.ls));
}

/**
 * Optimised get, just as optimal as the get function of the wrapped list
 */
MappedList.prototype.get = function(pos){
	return this.f(Prelude.get(this.ls)(pos));
}

/**
 * A lazily filtered list where the list is filtered on evaluation (when head() or tail() is called)
 */
var FilteredList = function(infiniteList, filter){
	LazyList.call(this);
	this.ls = infiniteList;
	this.f = filter;
}

FilteredList.prototype = Object.create(LazyList.prototype);

/**
 * Gets the first element which complies with the filter. This function MAY NOT TERMINATE if there is no such element.
 */
FilteredList.prototype.head = function(){
	while(!this.f(Prelude.head(this.ls))){
		this.ls = Prelude.tail(this.ls);
	}
	
	return Prelude.head(this.ls);
}

/**
 * Returns the tail by constructing a new FilteredList, without the head of this list.
 * This function calls head(), which MAY NOT TERMINATE if there is no element complying with the filter
 */
FilteredList.prototype.tail = function(){
	this.head();
	return new FilteredList(Prelude.tail(this.ls), this.f);
}

/**
 * Concatenates a FINITE list as with INFINITE LIST bs
 */
var ConcatenatedList = function(as, bs){
	if(as.length == Infinity)
		throw new ListNotFiniteException();
	
	LazyList.call(this);
	
	this.as = as;
	this.bs = bs;
}

ConcatenatedList.prototype = Object.create(LazyList.prototype);

ConcatenatedList.prototype.head = function(){
	return Prelude.head(this.as);
}

ConcatenatedList.prototype.tail = function(){
	if(this.as.length > 1)
		return new ConcatenatedList(Prelude.tail(this.as), this.bs);
	else if(this.as.length == 1)
		return this.bs;
}

ConcatenatedList.prototype.get = function(pos){
	if(pos < this.as.length)
		return Prelude.get(this.as)(pos);
	else return Prelude.get(this.bs)(pos - this.as.length + 1);
}

/**
 * Creates a zipped list using two or three input lists and a zipping function f.
 */
 
var ZippedList = function(f, list1, list2){
	LazyList.call(this);
	
	var args = Array.prototype.slice.call(arguments);
	
	this.f = args[0];
	
	this.lists = args.slice(1);
	
	if(this.lists.length < 2 || this.lists.length > 3)
		throw new Exception("Only 2 or 3 lists are supported at the time");
}

ZippedList.prototype = Object.create(LazyList.prototype);

/**
 * Returns the zipped head by applying f to the 2 or 3 list heads
 */
ZippedList.prototype.head = function(){
	var result = [];
	
	if(this.lists.length == 2)
		return this.f(Prelude.head(this.lists[0]))(Prelude.head(this.lists[1]));
	else if(this.lists.length == 3)
		return this.f(Prelude.head(this.lists[0]))(Prelude.head(this.lists[1]))(Prelude.head(this.lists[2]));
	else throw new Exception("Only 2 or 3 lists are supported at the time"); 
}

/**
 * Returns the tail of this ZippedList by returning a new ZippedList using the tails of the wrapped lists and the zipping function f.
 */
ZippedList.prototype.tail = function(){	
	var args  = [this.f];
	
	if(this.lists.length == 2)
		return new ZippedList(this.f, Prelude.tail(this.lists[0]), Prelude.tail(this.lists[1]));
	else if(this.lists.length == 3)
		return new ZippedList(this.f, Prelude.tail(this.lists[0]), Prelude.tail(this.lists[1]), Prelude.tail(this.lists[2]));
	else throw new Exception("Only 2 or 3 lists are supported at the time");
}

/**
 * Represents the prefix of list of which the elements comply with the predicate
 * The length of this prefix can be both finite or infinite
 */
var TakeWhileList = function(predicate, list){
	LazyList.call(this);
	
	this.list = list;
	this.p = predicate;
}

TakeWhileList.prototype = Object.create(LazyList.prototype);

/**
 * If the head of the wrapped list does not satisfy the predicate, we are at the end of the refix
 * Note: should be called hasCurrent(), we will fix this in future release.
 */
TakeWhileList.prototype.hasNext = function(){
	return this.p(Prelude.head(this.list));
}

TakeWhileList.prototype.head = function(){
	var head = Prelude.head(this.list);
	
	return this.p(head) ? head : null;
}

TakeWhileList.prototype.tail = function(){
	return new TakeWhileList(this.p, Prelude.tail(this.list));
}

/**
 * Drops elements of the wrapped list while the predicate holds
 */
var DropWhileList = function(predicate, list){
	LazyList.call(this);
	
	this.list = list;
	this.p = predicate;
}

DropWhileList.prototype = Object.create(LazyList.prototype);

/**
 * Gets the first none dropped element of this list. This function MAY NOT TERMINATE if there is no such element.
 */
DropWhileList.prototype.head = function(){
	while(this.p(Prelude.head(this.list))){
		this.list = Prelude.tail(this.list);
	}
	
	return Prelude.head(this.list);
}

/**
 * Returns the tail, which are all non dropped elements, except for the first (this is the head)
 */
DropWhileList.prototype.tail = function(){
	this.head();

	return Prelude.tail(this.list);
}
/**
 * Each element in the wrapped list is fed to function f, this results in a finite number of results.
 * The results of all elements are then concatenated. This list is represented by the ConcatMapList.
 */
var ConcatMapList = function(f, list, results, cursor){
	LazyList.call(this);
	
	this.f = f;
	this.list = list;
	
	this.results = results ? results : f(Prelude.head(list));
	
	// the position in the result set of f(current element in the wrapped list)
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
	else return new ConcatMapList(this.f, Prelude.tail(this.list));
}


var InfiniteLists = {
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
};