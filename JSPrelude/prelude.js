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
	this.null = function(list){
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
	 * Any takes a function that returns a boolean, which will return a function that takes a list. 
	 * The initially supplied function will be mapped over the list. If one of the booleans in the resulting list is true,
	 * then the function will return true, otherwise it will return false.
	 */
	this.any = function(predicate){		
		return function(xs){
			return $prelude.or($prelude.map(predicate)(xs));
		}
	}
	
	/**
	 * Haskell type description:
	 * all :: (a -> Bool) -> [a] -> Bool
	 * 
	 * All takes a function that returns a boolean, which will return a function that takes a list. 
	 * The initially supplied function will be mapped over the list. If all of the booleans in the resulting list are true,
	 * then the function will return true, otherwise it will return false.
	 */
	this.all = function(predicate){
		return function(xs){
			return $prelude.and($prelude.map(predicate)(xs));
		}
	}
	
	/**
	 * Haskell type description:
	 * sum :: Num a => [a] -> a
	 * 
	 * Sum takes a list of numbers, and returns the sum of those numbers. 
	 * If the list is infinite it will throw an exception.
	 */
	this.sum = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		
		return $prelude.foldl(Operators.add)(0)(xs);
	}
	
	/**
	 * Haskell type description:
	 * product :: Num a => [a] -> a
	 * 
	 * Product takes a list of numbers, and returns the product of those numbers
	 */
	this.product = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		
		return $prelude.foldl(Operators.multiply)(1)(xs);
	}
	
	/**
	 * Haskell type description:
	 * concat :: [[a]] -> [a]
	 * 
	 * Concat takes a list of lists, and returns a concatentation of the lists within.
	 * If the supplied list is infinite, it will throw an exception. If one of the inner lists is infinite, 
	 * the concatentation will end with that list.
	 */
	this.concat = function(xss){
		if($prelude.length(xss) == Infinity)
			throw new ListNotFiniteException();
		
		if($prelude.length(xss) > 0 && $prelude.get(xss)(0) instanceof InfiniteLists.LazyList)
			return $prelude.get(xss)(0);
		
		var results = [];
		var i=0
		for(; i < $prelude.length(xss); i++ ){
			var xs = $prelude.get(xss)(i);
			
			if(xs instanceof InfiniteLists.LazyList)
				return new InfiniteLists.ConcatenatedList(results, xs);
			
			results = results.concat(xs);
		}
		
		return results;
	}
	
	/**
	 * Haskell type description:
	 * concatMap :: (a -> [b]) -> [a] -> [b]
	 * 
	 * ConcatMap takes a function f, which returns a function that takes a list. The function f takes some value,
	 * and returns a list of results. The initial list will therefore become a list of lists, which is concatenated by concat.
	 * If the initial list is infinite, it will return a ConcatMapList.
	 */
	this.concatMap = function(f){
		return function(xs){
			if(xs instanceof InfiniteLists.LazyList)
				return new InfiniteLists.ConcatMapList(f,xs);
			return $prelude.concat($prelude.map(f)(xs));
		}
	}
	
	/**
	 * Haskell type description:
	 * maximum :: Ord a => [a] -> a
	 * 
	 * Maximum takes a list of numbers, and returns the maximum value.
	 * If the list is empty, it will throw an exception.
	 * If the list is infinite, ite will throw an exception.
	 */
	this.maximum = function(xs){
		if($prelude.length(xs) == Infinity)
			throw new ListNotFiniteException();
		if($prelude.null(xs))
			throw new EmptyListException("List cannot be empty!");
		
		return $prelude.foldl1(Operators.max)(xs);
	}
	
	/**
	 * Haskell type description:
	 * minimum :: Ord a => [a] -> a
	 * 
	 * Minimum takes a list of numbers, and returns the minimum value.
	 * If the list is empty, it will throw an exception.
	 * If the list is infinite, ite will throw an exception.
	 */
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
	
	/**
	 * Haskell type description:
	 * scanl :: (a -> b -> a) -> a -> [b] -> [a]
	 * 
	 * Scanl takes a binary operator, which will return a function that takes an initial value, which will return a function that takes a list.
	 * Scanl, works similar to foldl, but instead of returning only the final result, it returns a list of intermediate results.
	 */
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
	 * Haskell type description:
	 * scanl1 :: (a -> a -> a) -> [a] -> [a] 
	 * 
	 * Scanl1 takes a binary operator, which will return a function that takes a list.
	 * Scanl1, works similar to foldl1, but instead of returning only the final result, it returns a list of intermediate results.
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
	
	/**
	 * Haskell type description:
	 * scanr :: (a -> b -> a) -> a -> [b] -> [a]
	 *
	 * Scanr takes a binary operator, which will return a function that takes an initial value, which will return a function that takes a list.
	 * Scanr, works similar to foldr, but instead of returning only the final result, it returns a list of intermediate results.
	 */
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
	 * Haskell type description:
	 * scanr1 :: (a -> a -> a) -> [a] -> [a] 
	 * 
	 * Scanr1 takes a binary operator, which will return a function that takes a list.
	 * Scanr1, works similar to foldr1, but instead of returning only the final result, it returns a list of intermediate results.
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
	 * Infinite lists: iterate, repeat, replicate, cycle 
	 * These lists are implemented in a separate module, infinite.js.
	 * The replicate function is not strictly an infinite list, since it takes a finite number and is thus documented here.
	 */
	 
	/**
	 * Haskell type description:
	 * replicate :: Int -> a -> [a]
	 * 
	 * Replicate takes a number n, which returns a function that takes an element.
	 * Replicate will return a new array with n elements a.
	 */
	this.replicate = function(n){
		return function(a){
			var left = function(x){return function(y){return x;}};
			var arr = new Array(n);
			
			return $prelude.map(left(a))(arr);
		}
	}
	
	/*
	 * Sublists: take, drop, 
	 */ 

	/**
	 * Haskell type description:
	 * take :: Int -> [a] -> [a]
	 * 
	 * Take takes a number num, which will return a function that takes a list.
	 * The latter function will return the first num elements of the list.
	 * If the num is larger than the length of the list, it will return the entire list.
	 */
	this.take = function(num){
		return function(list){
			if(!(list instanceof InfiniteLists.LazyList))
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
	
	/**
	 * Haskell type description:
	 * drop :: Int -> [a] -> [a]
	 * 
	 * Drop takes a number num, which will return a function that takes a list.
	 * The latter function will return the list of elements after the first num elements.
	 * If num is larger than the lenght of the list, it will return an empty list.
	 */
	this.drop = function(num){
		return function(list){
			if(!(list instanceof InfiniteLists.LazyList))
				return num >= 0 ? list.slice(num) : list;
			
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
	 * Haskell type description:
	 * splitAt :: Int -> [a] -> ([a], [a]) 
	 * 
	 * SplitAt takes a number pos, which returns a function that takes a list. 
	 * It will returns a list of two lists. The two lists are the result of splitting the initial list after pos elements.
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
	 * Haskell type description:
	 * takeWhile :: (a -> Bool) -> [a] -> [a]
	 * 
	 * TakeWhile takes a function f, which returns a function that takes a list. 
	 * The function f takes an element and returns a boolean. The result of takeWhile is a list of elements for which f returns true,
	 * starting with the first element up till f returns false. If f returns false on the first element it will return an empty list.
	 * If the initial list is infinite, a TakeWhileList is returned.
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
	 * Haskell type description:
	 * dropWhile :: (a -> Bool) -> [a] -> [a]
	 * 
	 * dropWhile takes a function f, which returns a function that takes a list. 
	 * The function f takes an element and returns a boolean. The result of dropWhile is the list of elements after and including the 
	 * the first element on which f returns false.
	 * If the initial list is infinite, a DropWhileList is returned.
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
	 * Haskell type description:
	 * span :: (a -> Bool) -> [a] -> ([a], [a])
	 * 
	 * Span takes a function f, which returns a function that takes a list.
	 * Span returns a list of two lists, of which the first is the result of using the same arguments on takeWhile, 
	 * and the second is the result of using the same arguments on dropWhile.
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
	 * Haskell type description:
	 * break :: (a -> Bool) -> [a] -> ([a], [a])
	 * 
	 * Break takes a function f, which returns a function that takes a list l.
	 * Break returns span with the arguments !f and l.
	 */
	this.break = function(p){
		return function(list){
			return $prelude.span(Operators.not(p))(list);
		}
	};
	
	/*
	 * Searching lists: elem, notElem, lookup, 
	 */
	
	/**
	 * Haskell type description:
	 * elem :: Eq a => a -> [a] -> Bool 
	 * 
	 * Elem takes an element, which returns a function that takes a list.
	 * If element is in the list, elem will return true, otherwise false.
	 */
	this.elem = function(element){
		return function(list){
			return $prelude.any(Operators.eq(element))(list);
		}
	}
	
	/**
	 * Haskell type description:
	 * notElem :: Eq a => a -> [a] -> Bool 
	 * 
	 * NotElem takes an element, which returns a function that takes a list.
	 * If element is not in the list, notElem will return true, otherwise false.
	 */
	this.notElem = function(element){
		return function(list){
			return !$prelude.elem(element)(list);
		}
	}
	
	/**
	 * Haskell type description:
	 * lookup :: Eq a => a -> [(a, b)] -> Maybe b 
	 * 
	 * Lookup takes an element key, which returns a function that takes a list of lists of length 2.
	 * Lookup goes through all sublists and compares the first element of that sublist to key.
	 * If the comparison returns true, the second element of that sublist is returned.
	 * If the list is empty or if the key is not found,lookup will return null.
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
	
	/*
	 * Zip: zip, zip3, zipWith, zipWith3, unzip, unzip3
	 */
	 
	/**
	 * Haskell type description:
	 * zip :: [a] -> [b] -> [(a, b)] 
	 * 
	 * Zip takes a list l1, which returns a function that takes a list l2.
	 * Zip will return a list of lists of length 2, where each sublist has one element from l1 and one from l2
	 * at the corresponding position. 
	 * If one of the lists is longer than the other, the excess will be discarded. 
	 */
	this.zip = function(list1){
		return function(list2){
			var f = function(a){return function(b){return [a,b]}};
			
			return $prelude.zipWith(f)(list1)(list2);
		}
	};
	
	/**
	 * Haskell type description:
	 * zip3 :: [a] -> [b] -> [c] -> [(a, b, c)]
	 *
	 * Zip3 takes a list l1, which returns a function that takes a list l2, which returns a function that takes a list l3.
	 * Zip3 will return a list of lists of length 3, where each sublist has one element from l1, from l2 and from l3
	 * at the corresponding positions.
	 * If one of the lists is longer than one of the others, the excess will be discarded. 
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
	 * Haskell type description:
	 * zipWith :: (a -> b -> c) -> [a] -> [b] -> [c] 
	 *
	 * ZipWith will take a function f, which returns a function that takes a list l1, which returns a function that takes a list l2.
	 * The function f is applied upon two elements, returning a single element. 
	 * ZipWith will use f on an element from l1 and l2 at corresponding positions, and return a single list of results.
	 * If one list is longer than the other, excess elements will be discarded.
	 * If the list is infinite, a ZippedList will be returned.
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
	 * Haskell type description:
	 * zipWith3 :: (a -> b -> c -> d) -> [a] -> [b] -> [c] -> [d]
	 *
	 * ZipWith3 will take a function f, which returns a function that takes a list l1, which returns a function that takes a list l2, which returns a function that takes a list l3.
	 * The function f is applied upon three elements, returning a single element. 
	 * ZipWith3 will use f on an element from l1, l2 and l3 at corresponding positions, and return a single list of results.
	 * If one list is longer than one of the others, excess elements will be discarded.
	 * If the list is infinite, a ZippedList will be returned.
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
	 * Haskell type description:
	 * unzip :: [(a, b)] -> ([a], [b]) 
	 * 
	 * Unzip takes a list of lists of length 2. Unzip returns a list of two lists, where the first list has the first element of each sublist, 
	 * and the second list has the second element of each sublist.
	 * If the initial list is infinite, a MappedList will be returned.
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
		];
	}
	
	/**
	 * Haskell type description:
	 * unzip3 :: [(a, b, c)] -> ([a], [b], [c]) 
	 * 
	 * Unzip takes a list of lists of length 3. Unzip returns a list of three lists, where the first list has the first element of each sublist, 
	 * the second list has the second element of each sublist, and the third list the third element of each sublist.
	 * If the initial list is infinite, a MappedList will be returned.
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
	 * Haskell type description:
	 * lines :: String -> [String]
	 * 
	 * Lines takes a string and returns a list of strings broken up at newline characters (\n).
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
	 * Haskell type description:
	 * words :: String -> [String]
	 * 
	 * Words takes a string and returns a list of strings broken up at spaces.
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
	 * Haskell type description:
	 * unlines :: [String] -> String
	 * 
	 * Unlines takes a list of strings and returns a single string, where the strings in the list are concatenated
	 * with a newline character (\n) in between.
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
	
	/**
	 * Haskell type description:
	 * unwords :: [String] -> String
	 * 
	 * Unwords takes a list of strings and returns a single string, where the strings in the list are concatenated
	 * with a space in between.
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
