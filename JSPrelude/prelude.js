/**
 * The functions in this file are javascript implementations of the haskell list prelude found in the link below:
 * http://www.haskell.org/ghc/docs/6.12.2/html/libraries/base-4.2.0.1/Prelude.html#11
 * Each function matches the original workings of the haskell functions as close as possible. 
 */
var InfiniteLists = require("./infinite.js");

var Operators = require("./operators.js");

var ListNotFiniteException = function(){};

var Prelude = new (function(undefined){
	var $prelude = this;
	
	
	/*
	 * List Operations: map, (++) ~ append, filter, head, last, tail, init, null, length, (!!) ~ get, reverse
	 */
	
	/**
	 * Haskell type description:	 
	 * map :: (a -> b) -> [a] -> [b]
	 * 
	 * map takes a function f, which returns a function that takes a list. This latter function will use the function f on each of the elements in the list.
	 * If the list is empty, an empty list will be returned. 
	 * If an infinite list is applied, we return a MappedList.
	 */ 
	this.map = function(f){
		return function(list){
			if($prelude.null(list))
				return [];
			else if(list instanceof InfiniteLists.LazyList){
				return new InfiniteLists.MappedList(f, list);	
			} else {
				return $prelude.append([f($prelude.head(list))]) ($prelude.map(f)($prelude.tail(list)));
			}
		}
	}
	
	/**
	 * Haskell type description:
	 * (++) :: [a] -> [a] -> [a]
	 * 
	 * Append will take a list, list1, and return a function that takes another list, list2. The latter function returns the concatenation of list2 to list1.
	 * If the list1 is infinite, it returns lists1. If else list2 is infinite a ConcatenatedList of list1 and list2 is returned.
	 */ 
	this.append = function(list1){
		return function(list2){
			
			if(list1 instanceof InfiniteLists.LazyList)
				return list1;
			else if(list2 instanceof InfiniteLists.LazyList)
				return new InfiniteLists.ConcatenatedList(list1, list2);
			else return list1.concat(list2);
		}
	};
	
	/**
	 * Haskell type description:
	 * filter :: (a -> Bool) -> [a] -> [a]
	 * 
	 * Filter will take a function f, that returns a boolean, and return a function that takes a list. The latter function will return a list of the elements
	 * that f returns true on. If f does not return a boolean on an element, it will throw an exception.
	 * If the list is infinite a FilteredList is returned.
	 */ 
	this.filter = function(f){
		return function(list){			
			if($prelude.null(list))
				return [];
			else if(list instanceof InfiniteLists.LazyList)
				return new InfiniteLists.FilteredList(list,f);
				
			
			var head = $prelude.head(list);
			if (typeof f(head) !== 'boolean')
				throw new ReturnException("The function does not return a boolean!");
			else if(f(head))
				return $prelude.append([head])($prelude.filter(f)($prelude.tail(list)))
			else return $prelude.filter(f)($prelude.tail(list));
		}
	}
	
	/**
	 * Haskell type description:
	 * head :: [a] -> a
	 * 
	 * Returns the first element of the list. Throws an exception if the list is empty.
	 */ 
	this.head = function(list){
		if ($prelude.null(list))
			throw new EmptyListException("Cannot return the first element of an empty list");
		
		if(list.head && typeof list.head == 'function')
			return list.head();
		else return list[0];
	};
	
	/**
	 * Haskell type description:
	 * last :: [a] -> a
	 * 
	 * Returns the last element of the list. Throws an exception if the list is empty or infinite.
	 */ 
	this.last = function(list){
		if($prelude.length(list) == Infinity)
			throw new ListNotFiniteException("There is no such element in infinite lists!");
		
		if ($prelude.null(list))
			throw new EmptyListException("Cannot return the last element of an empty list");
		return list.slice(-1)[0];
	};
	
	/**
	 * Haskell type description:
	 * tail :: [a] -> [a]
	 * 
	 * Returns all elements of the list except for the first. Throws an exception if the list is empty.
	 */ 
	this.tail = function(list){
		if ($prelude.null(list))
			throw new EmptyListException("Cannot return elements of an empty list");
		
		if(list instanceof InfiniteLists.LazyList)
			return list.tail();
		else if(list.length > 1)
			return list.slice(1);
		else return [];
	};
	
	/**
	 * Haskell type description:
	 * init :: [a] -> [a]
	 * 
	 * Returns all elements of the list except for the last. Throws an exception if the list is empty.
	 */ 
	this.init = function(list){
		if(list instanceof InfiniteLists.LazyList)
			return list;
		
		if ($prelude.null(list))
			throw new EmptyListException("Cannot return elements of an empty list");
		return list.slice(0,-1);
	};
	
	/**
	 * Haskell type description:
	 * null :: [a] -> Bool
	 * 
	 * Returns true if the list is empty, otherwise returns false.
	 */
	this["null"] = function(list){
		return $prelude.length(list) === 0;
	};
	
	/**
	 * Haskell type description:
	 * length :: [a] -> Int
	 * 
	 * Returns the length of the list. 
	 */
	this.length = function(list){
		return list.length;
	};
	
	/**
	 * Haskell type description:
	 * (!!) :: [a] -> Int -> a
	 * 
	 * Returns a function that takes an integer, i. This function will return i+1th element of the list.
	 */
	this.get = function(list){
		return function(i){
			if(list.get && typeof list.get == 'function')
				return list.get(i);
			else return list[i];
		}
	};
	
	/**
	 * Haskell type description:
	 * reverse :: [a] -> [a]
	 * 
	 * Returns a list with the elements in reversed order. The list must be finite.
	 */
	this.reverse = function(list){
		if($prelude.length(list) == Infinity)
			throw new ListNotFiniteException();
		
		return list.reverse();
	}
	
	
	
	/*
	 * Folds: foldl, foldr, foldl1, foldr1
	 */ 
	
	/**
	 * Haskell type description:
	 * foldl :: (a -> b -> a) -> a -> [b] -> a
	 * 
	 * Foldl takes a binary operator, which returns a function that takes an initial value, which returns a function that takes a list.
	 * The last function will return a single value, which is a result of performing the operator on the leftmost two values in the list,
	 * starting with the initial value, and thus reducing the lenght of the list by one, each iteration.
	 * If the list is empty, the initial value will be returned.
	 */
	this.foldl = function(op){
		return function(val){
			return function(xs){
				if($prelude.length(xs) == 0)
					return val;
				
				var head = $prelude.head(xs);
				var tail = $prelude.tail(xs);
				
				return $prelude.foldl(op)(op(val)(head))(tail);
			}
		}
	};
	
	/**
	 * Haskell type description:
	 * foldl1 :: (a -> a -> a) -> [a] -> a
	 *
	 * Foldl1 takes a binary operator, which returns a function that takes a list.
	 * The latter function will return a single value, which is a result of performing the operator on the leftmost two values in the list,
	 * and thus reducing the lenght of the list by one, each iteration.
	 * If the list is empty, an exception will be thrown.
	 */
	this.foldl1 = function(op){
		return function(xs){
			if($prelude.length(xs) == 0)
				throw new EmptyListException("Cannot fold an empty list");
				
			var head = $prelude.head(xs);
			var tail = $prelude.tail(xs);				
				
			return $prelude.foldl(op)(head)(tail);
		}
	}
	
	/**
	 * Haskell type description:
	 * foldr :: (a -> b -> b) -> b -> [a] -> b
	 * 
	 * Foldr takes a binary operator, which returns a function that takes an initial value, which returns a function that takes a list.
	 * The last function will return a single value, which is a result of performing the operator on the rightmost two values in the list,
	 * starting with the initial value, and thus reducing the lenght of the list by one, each iteration.
	 * If the list is empty, the initial value will be returned.
	 */
	this.foldr = function(op){
		return function(val){
			return function(xs){
				if($prelude.length(xs) == 0)
					return val;
				
				var head = $prelude.head(xs);
				var tail = $prelude.tail(xs);				
				
				return op(head)($prelude.foldr(op)(val)(tail));
			}
		}
	}
	

	/**
	 * Haskell type description:
	 * foldr1 :: (a -> a -> a) -> [a] -> a
	 *
	 * Foldr1 takes a binary operator, which returns a function that takes a list.
	 * The latter function will return a single value, which is a result of performing the operator on the rightmost two values in the list,
	 * and thus reducing the lenght of the list by one, each iteration.
	 * If the list is empty, an exception will be thrown.
	 */
	this.foldr1 = function(op){
		return function(xs){
			if($prelude.length(xs) == 0)
				throw new EmptyListException("Cannot fold an empty list");
			
			return $prelude.foldr(op)($prelude.last(xs))($prelude.init(xs));
		}
	}
	
	
	/*
	 * Special folds: and, or, any, all, sum, product, concatMap, concat, maximum, minimum
	 */
	
	/**
	 * Haskell type description:
	 * and :: [Bool] -> Bool
	 * 
	 * And takes a list of booleans and returns a single boolean, by calling the foldl function with the binary and operation,
	 * xs[i] && xs[i+1], and the initial value true.
	 */
	this.and = function(xs){
		// For finite list nice functional approach
		if($prelude.length(xs) != Infinity){			
			return $prelude.foldl(Operators.and)(true)(xs);
		}
		
		var val = $prelude.head(xs);
		var list = $prelude.tail(xs);
		
		while(val && !$prelude.null(xs)){
			val = val && $prelude.head(list);
			list = $prelude.tail(list);
		}
		
		return val;
	}
	
	/**
	 * Haskell type description:
	 * or :: [Bool] -> Bool
	 * 
	 * Or takes a list of booleans and returns a single boolean, by calling the foldl function with the binary and operation,
	 * xs[i] || xs[i+1], and the initial value false.
	 */
	this.or = function(xs){
		// For finite list nice functional approach
		if($prelude.length(xs) != Infinity){
			return $prelude.foldl(Operators.or)(false)(xs);
		}
		
		var val = $prelude.head(xs);
		var list = $prelude.tail(xs);
		
		while(!val && !$prelude.null(xs)){
			val = val || $prelude.head(list);
			list = $prelude.tail(list);
		}
		
		return val;
	}
	
	/**
	 * Haskell type description:
	 * any :: (a -> Bool) -> [a] -> Bool
	 * 
	 * Any takes 
	 */
	this.any = function(predicate){		
		return function(xs){
			return $prelude.or($prelude.map(predicate)(xs));
		}
	}
	
	// all :: (a -> Bool) -> [a] -> Bool
	this.all = function(predicate){
		return function(xs){
			return $prelude.and($prelude.map(predicate)(xs));
		}
	}
	
	// sum :: Num a => [a] -> a
	this.sum = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		
		return $prelude.foldl(Operators.add)(0)(xs);
	}
	
	// product :: Num a => [a] -> a
	this.product = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		
		return $prelude.foldl(Operators.multiply)(1)(xs);
	}
	
	// concat :: [[a]] -> [a]
	this.concat = function(xss){
		if($prelude.length(xss) == Infinity)
			throw new ListNotFiniteException();
		
		if($prelude.length(xss) > 0 && $prelude.length($prelude.get(xss)(0)) == Infinity)
			return $prelude.get(xss)(0);
		
		var results = [];
		var i=0
		for(; i < $prelude.length(xss); i++ ){
			var xs = $prelude.get(xss)(i);
			
			if($prelude.length(xs) == Infinity)
				return new InfiniteLists.ConcatenatedList(results, xs);
			
			results = results.concat(xs);
		}
		
		return results;
	}
	
	// concatMap :: (a -> [b]) -> [a] -> [b]
	this.concatMap = function(f){
		return function(xs){
			if(xs instanceof InfiniteLists.LazyList)
				return new InfiniteLists.ConcatMapList(f,xs);
			return $prelude.concat($prelude.map(f)(xs));
		}
	}
	
	// maximum :: Ord a => [a] -> a
	this.maximum = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		if($prelude.null(xs))
			throw new EmptyListException("List cannot be empty!");
		
		return $prelude.foldl1(Operators.max)(xs);
	}
	
	// minimum :: Ord a => [a] -> a
	this.minimum = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		if($prelude.null(xs))
			throw new EmptyListException("List cannot be empty!");
		
		return $prelude.foldl1(Operators.min)(xs);
	}
	
	
	/*
	 * Scans: scanl, scanl1, scanr, scanr1
	 */
	
	// scanl :: (a -> b -> a) -> a -> [b] -> [a]
	this.scanl = function(op){
		return function(val){
			return function(xs){
				var appendItem = function(op){
					return function(xs){
						return function(x){
							var last = $prelude.last(xs);
							xs.push(op(last)(x)); 
							
							return xs;
						}
					}
				};
				
				return $prelude.foldl(appendItem(op))([val])(xs);
			}
		}
	};
	
	/**
	 * scanl1 :: (a -> a -> a) -> [a] -> [a] 
	 */
	this.scanl1 = function(op){
		return function(list){
			if($prelude.null(list))
				throw new EmptyListException("List cannot be empty!");
			var head = $prelude.head(list);
			var tail = $prelude.tail(list);
			
			return $prelude.scanl(op)(head)(tail);
		}
	};
	
	// scanr :: (a -> b -> a) -> a -> [b] -> [a]
	this.scanr = function(op){
		return function(val){
			return function(xs){
				var prependItem = function(op){
					return function(x){
						return function(xs){
							var head = $prelude.head(xs);
							xs.unshift(op(x)(head)); 
							
							return xs;
						}
					}
				};
				
				return $prelude.foldr(prependItem(op))([val])(xs);
			}
		}
	};
	
	/**
	 * scanr1 :: (a -> a -> a) -> [a] -> [a] 
	 */
	this.scanr1 = function(op){
		return function(list){
			if($prelude.null(list))
				throw new EmptyListException("List cannot be empty!");
			var last = $prelude.last(list);
			var prefix = $prelude.init(list);
			
			return $prelude.scanr(op)(last)(prefix);
		}
	};
	
	/*
	 * Sublists: take, drop, 
	 */ 

	// take :: Int -> [a] -> [a]
	this.take = function(num){
		return function(list){
			if(! list instanceof InfiniteLists.LazyList)
				return num > 0 ? list.slice(0,num) : [];
			
			var result = [];
			var arr = list;
			
			for(var i=0; num > 0 && i < Math.min($prelude.length(list),num); i++){
				if(list instanceof InfiniteLists.LazyList && list.hasNext() == false)
					break;
				
				result.push($prelude.head(arr));
				arr = $prelude.tail(arr);
			}
			
			return result;
		}
	}
	
	// drop :: Int -> [a] -> [a]
	this.drop = function(num){
		return function(list){
			if(! list instanceof InfiniteLists.LazyList)
				return num > 0 ? list.slice(0,num) : [];
			
			var result = list;
			for(var i=0; i < num; i++){
				if(result instanceof InfiniteLists.LazyList && result.hasNext() == false)
					break;
				
				result = $prelude.tail(result);
			}
			
			return result;
		}
	}
	
	/**
	 * splitAt :: Int -> [a] -> ([a], [a]) 
	 */
	this.splitAt = function(pos){
		return function(list){
			return [
				$prelude.take(pos)(list)
				, $prelude.drop(pos)(list)
			];
		}
	}
	
	/**
	 * takeWhile :: (a -> Bool) -> [a] -> [a]
	 */
	this.takeWhile = function(predicate){
		return function(list){		
			if(list instanceof InfiniteLists.LazyList)
				return new InfiniteLists.TakeWhileList(predicate, list);
			
			if($prelude.length(list) == 0)
				return [];
				
			var head = $prelude.head(list);
			var tail = $prelude.tail(list);
			
			if(predicate(head))
				return $prelude.concat([[head], $prelude.takeWhile(predicate)(tail)]);
			else return [];
		};
	};
	
	/**
	 * dropWhile :: (a -> Bool) -> [a] -> [a]
	 */
	this.dropWhile = function(predicate){
		return function(list){
			if(list instanceof InfiniteLists.LazyList)
				return new InfiniteLists.DropWhileList(predicate, list);
			
			if($prelude.length(list) == 0)
				return [];
				
			var head = $prelude.head(list);
			var tail = $prelude.tail(list);
			
			if(predicate(head))
				return $prelude.dropWhile(predicate)(tail);
			else return list;
		}
	}
	
	/**
	 * span :: (a -> Bool) -> [a] -> ([a], [a])
	 */
	this.span = function(predicate){
		return function(list){
			return [
				$prelude.takeWhile(predicate)(list)
				, $prelude.dropWhile(predicate)(list)
			];
		} 
	};
	
	/**
	 * break :: (a -> Bool) -> [a] -> ([a], [a])
	 */
	this["break"] = function(p){
		return function(list){
			var not = function(p){
				return function(x){
					return !p(x);
				}
			}
			return $prelude.span(not(p))(list);
		}
	};
	
	// Searching lists
	// ==============================================
	
	/**
	 * elem :: Eq a => a -> [a] -> Bool 
	 */
	this.elem = function(element){
		return function(list){
			return $prelude.any(Operators.eq(element))(list);
		}
	}
	
	/**
	 * notElem :: Eq a => a -> [a] -> Bool 
	 */
	this.notElem = function(element){
		return function(list){
			return !$prelude.elem(element)(list);
		}
	}
	
	/**
	 * lookup :: Eq a => a -> [(a, b)] -> Maybe b 
	 */
	this.lookup = function(key){
		return function(list){
			if($prelude.length(list) == 0)
				return null;
			
			var head = $prelude.head(list);
			var tail = $prelude.tail(list);
			
			if(head.length == 2 && head[0] == key)
				return head[1]; // value
			else return $prelude.lookup(key)(tail);
				
		}
	}
	
	// ZIP FUNCTIONS
	// ==============================================
	
	/**
	 * zipWith :: (a -> b -> c) -> [a] -> [b] -> [c] 
	 */
	this.zipWith = function(f){ 
		return function(list1){
			return function(list2){	
				if($prelude.length(list1) == Infinity && $prelude.length(list2) == Infinity)
					return new InfiniteLists.ZippedList(f, list1, list2);
				
				
				if($prelude.length(list1) == 0
					|| $prelude.length(list2) == 0)
					return [];
				
				var h1 = $prelude.head(list1);
				var h2 = $prelude.head(list2);
				
				var t1 = $prelude.tail(list1);
				var t2 = $prelude.tail(list2);
				
				var val = f(h1)(h2);
				
				return $prelude.concat([[ val ], $prelude.zipWith(f)(t1)(t2)]);
			}
		}
	}
	
	/**
	 * zipWith3 :: (a -> b -> c -> d) -> [a] -> [b] -> [c] -> [d]
	 */
	this.zipWith3 = function(f){ 
		return function(list1){
			return function(list2){
				return function(list3){
					if($prelude.length(list1) == Infinity && $prelude.length(list2) == Infinity && $prelude.length(list3) == Infinity)
						return new InfiniteLists.ZippedList(f, list1, list2, list3);
					
					if($prelude.length(list1) == 0
						|| $prelude.length(list2) == 0
						|| $prelude.length(list3) == 0)
						return [];
					
					var h1 = $prelude.head(list1);
					var h2 = $prelude.head(list2);
					var h3 = $prelude.head(list3);
					
					var t1 = $prelude.tail(list1);
					var t2 = $prelude.tail(list2);
					var t3 = $prelude.tail(list3);
					
					var val = f(h1)(h2)(h3);
					
					return $prelude.concat([[ val ], $prelude.zipWith3(f)(t1)(t2)(t3)]);
				}
			}
		}
	}
	
	/**
	 * zip :: [a] -> [b] -> [(a, b)] 
	 */
	this.zip = function(list1){
		return function(list2){
			var f = function(a){return function(b){return [a,b]}};
			
			return $prelude.zipWith(f)(list1)(list2);
		}
	};
	
	/**
	 * zip3 :: [a] -> [b] -> [c] -> [(a, b, c)]
	 */
	this.zip3 = function(list1){
		return function(list2){
			return function(list3){
				var f = function(a){return function(b){return function(c){ return [a,b,c]}}};
			
				return $prelude.zipWith3(f)(list1)(list2)(list3);
			}
		}
	};
	
	/**
	 * unzip :: [(a, b)] -> ([a], [b]) 
	 */
	this.unzip = function(list){
		if(list instanceof InfiniteLists.LazyList){
			var f = function(col){
				return function(pair){
					return pair[col];
				}
			}
			
			return [
			        new InfiniteLists.MappedList(f(0),list),
			        new InfiniteLists.MappedList(f(1),list)
			];
		}
		
		if($prelude.length(list) == 0)
			return [[],[]];
		
		var head = $prelude.head(list);
		var tail = $prelude.tail(list);
		var h1 = head[0];
		var h2 = head[1];
		
		var recursive = $prelude.unzip(tail);
		
		return [
			$prelude.concat([[h1], recursive[0]])
			, $prelude.concat([[h2], recursive[1]])
		];// ([h11, h12, h13], [h21, h22, h33]) 
	}
	
	/**
	 * unzip3 :: [(a, b, c)] -> ([a], [b], [c]) 
	 */
	this.unzip3 = function(list){
		if(list instanceof InfiniteLists.LazyList){
			var f = function(col){
				return function(pair){
					return pair[col];
				}
			}
			
			return [
			        new InfiniteLists.MappedList(f(0),list),
			        new InfiniteLists.MappedList(f(1),list),
			        new InfiniteLists.MappedList(f(2),list)
			];
		}
		
		if($prelude.length(list) == 0)
			return [[],[],[]];
		
		var head = $prelude.head(list);
		var tail = $prelude.tail(list);
		var h1 = head[0];
		var h2 = head[1];
		var h3 = head[2];
		
		var recursive = $prelude.unzip3(tail);
		
		return [
			$prelude.concat([[h1], recursive[0]])
			, $prelude.concat([[h2], recursive[1]])
			, $prelude.concat([[h3], recursive[2]])
		];
	}
	
	/*
	 * Functions ons strings: lines, words, unlines, unwords
	 */
	
	/**
	 * lines :: String -> [String]
	 */ 
	this.lines = function(string){
		var f = function(s){
			return function(l) {
				var x = s.indexOf("\n");
				if (x==-1)	
					return l.concat([s]);
				else			
					return f(s.substring(x+1))(l.concat([s.substring(0, x)]));
			}			
		}
		return f(string)([])
	}
	
	/**
	 * words :: String -> [String]
	 */ 
	this.words = function(string){
		var f = function(s){
			return function(l) {
				var x = s.indexOf(" ");
				if (x==-1)	
					return l.concat([s]);
				else			
					return f(s.substring(x+1))(l.concat([s.substring(0, x)]));
			}			
		}
		return f(string)([])
	}
	
	/**
	 * unlines :: [String] -> String
	 */
	this.unlines = function(list){
		var f = function(l){
			return function(s) {
				if ($prelude.length(l)==0)	
					return s;
				else 
					return f($prelude.tail(l))(s.concat("\n"+$prelude.head(l)));			
			}			
		}
		return (f(list)("")).substring(1);
	}
	
	this.replicate = function(n){
		return function(a){
			var left = function(x){return function(y){return x;}};
			var arr = new Array(n);
			
			return $prelude.map(left(a))(arr);
		}
	}
	
	
	/**
	 * unwords :: [String] -> String
	 */
	this.unwords = function(list){
		var f = function(l){
			return function(s) {
				if ($prelude.length(l)==0)	
					return s;
				else 
					return f($prelude.tail(l))(s.concat(" "+$prelude.head(l)));					
			}			
		}
		return (f(list)("")).substring(1);
	}
})();

module.exports = Prelude;
